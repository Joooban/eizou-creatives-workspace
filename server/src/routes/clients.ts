import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/clients - list all clients
router.get("/", async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});

// POST /api/clients - create a new client
router.post("/", async (req, res) => {
  const { name, contractStart, contractEnd, driveFolder, notes, color } = req.body;

  if (!name || !contractStart || !contractEnd) {
    return res.status(400).json({
      error: "name, contractStart, and contractEnd are required",
    });
  }

  const client = await prisma.client.create({
    data: {
      name,
      contractStart: new Date(contractStart),
      contractEnd: new Date(contractEnd),
      driveFolder,
      notes,
      color: color || undefined,
    },
  });

  res.status(201).json(client);
});

// PUT /api/clients/:id - update an existing client
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, contractStart, contractEnd, driveFolder, notes, color, isActive } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        contractStart: contractStart ? new Date(contractStart) : undefined,
        contractEnd: contractEnd ? new Date(contractEnd) : undefined,
        driveFolder,
        notes,
        color,
        isActive,
      },
    });
    res.json(client);
  } catch (err) {
    res.status(404).json({ error: `Client with id ${id} not found` });
  }
});

// DELETE /api/clients/:id - remove a client
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Client with id ${id} not found` });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return res.status(409).json({
        error: `Cannot delete this client — it still has tasks or a deliverable plan attached. Remove those first.`,
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// GET /api/clients/:id/quota - quota progress for a client in a given month/year
router.get("/:id/quota", async (req, res) => {
  const clientId = Number(req.params.id);
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!clientId || !month || !year) {
    return res.status(400).json({ error: "clientId, month, and year are required" });
  }

  const plan = await prisma.deliverablePlan.findUnique({
    where: {
      clientId_periodMonth_periodYear: {
        clientId,
        periodMonth: month,
        periodYear: year,
      },
    },
  });

  if (!plan) {
    return res.status(404).json({ error: "No deliverable plan found for this client/month/year" });
  }

  const rangeStart = new Date(year, month - 1, 1);
  const rangeEnd = new Date(year, month, 1);

  const publishedTasks = await prisma.task.findMany({
    where: {
      clientId,
      status: "PUBLISHED",
      actualPublishDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    select: {
      contentType: true,
      quantity: true,
    },
  });

  const completed = { GRAPHIC: 0, PHOTO: 0, REEL: 0 };
  for (const task of publishedTasks) {
    completed[task.contentType] += task.quantity;
  }

  res.json({
    clientId,
    planId: plan.id,
    month,
    year,
    graphics: { completed: completed.GRAPHIC, quota: plan.graphicsQuota },
    photo: { completed: completed.PHOTO, quota: plan.photoQuota },
    reels: { completed: completed.REEL, quota: plan.reelsQuota },
  });
});

// POST /api/clients/:id/deliverable-plans - create or update the plan for a period
router.post("/:id/deliverable-plans", async (req, res) => {
  const clientId = Number(req.params.id);
  const { periodMonth, periodYear, graphicsQuota, photoQuota, reelsQuota } = req.body;

  if (
    !periodMonth ||
    !periodYear ||
    graphicsQuota === undefined ||
    photoQuota === undefined ||
    reelsQuota === undefined
  ) {
    return res.status(400).json({
      error: "periodMonth, periodYear, graphicsQuota, photoQuota, and reelsQuota are required",
    });
  }

  try {
    const plan = await prisma.deliverablePlan.upsert({
      where: {
        clientId_periodMonth_periodYear: {
          clientId,
          periodMonth: Number(periodMonth),
          periodYear: Number(periodYear),
        },
      },
      update: {
        graphicsQuota: Number(graphicsQuota),
        photoQuota: Number(photoQuota),
        reelsQuota: Number(reelsQuota),
      },
      create: {
        clientId,
        periodMonth: Number(periodMonth),
        periodYear: Number(periodYear),
        graphicsQuota: Number(graphicsQuota),
        photoQuota: Number(photoQuota),
        reelsQuota: Number(reelsQuota),
      },
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: "Failed to save deliverable plan. Check that the client exists." });
  }
});

// DELETE /api/clients/:id/deliverable-plans/:planId - clear a plan
router.delete("/:id/deliverable-plans/:planId", async (req, res) => {
  const planId = Number(req.params.planId);

  try {
    await prisma.deliverablePlan.delete({ where: { id: planId } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: `Deliverable plan with id ${planId} not found` });
  }
});

export default router;