import { Router } from "express";
import { prisma } from "../prisma";
import { ContentType, TaskStatus, Priority } from "@prisma/client";

const router = Router();

// GET /api/tasks - list all tasks, with client and assignee info included
router.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({
    include: {
      client: true,
      assignedTo: true,
      publishedLinks: true,
      revisions: { orderBy: { version: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

// POST /api/tasks - create a new task
router.post("/", async (req, res) => {
  const {
    title,
    clientId,
    assignedToId,
    contentType,
    platforms,
    quantity,
    status,
    priority,
    deadline,
    scheduledPublishDate,
    caption,
    instructions,
    workingFileLink,
    driveLink,
  } = req.body;

  if (!title || !clientId || !contentType || !platforms) {
    return res.status(400).json({
      error: "title, clientId, contentType, and platforms are required",
    });
  }

  if (!Object.values(ContentType).includes(contentType)) {
    return res.status(400).json({
      error: `contentType must be one of: ${Object.values(ContentType).join(", ")}`,
    });
  }

  if (status && !Object.values(TaskStatus).includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    });
  }

  if (priority && !Object.values(Priority).includes(priority)) {
    return res.status(400).json({
      error: `priority must be one of: ${Object.values(Priority).join(", ")}`,
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        clientId: Number(clientId),
        assignedToId: assignedToId ? Number(assignedToId) : undefined,
        contentType,
        platforms,
        quantity: quantity ? Number(quantity) : 1,
        status: status || undefined,
        priority: priority || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        scheduledPublishDate: scheduledPublishDate ? new Date(scheduledPublishDate) : undefined,
        caption,
        instructions,
        workingFileLink,
        driveLink,
      },
      include: {
        client: true,
        assignedTo: true,
        publishedLinks: true,
        revisions: true,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Failed to create task. Check that clientId and assignedToId exist." });
  }
});

// PUT /api/tasks/:id - update a task (used heavily for status changes)
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const {
    title,
    clientId,
    assignedToId,
    contentType,
    platforms,
    quantity,
    status,
    reviewRound,
    priority,
    deadline,
    scheduledPublishDate,
    actualPublishDate,
    caption,
    instructions,
    workingFileLink,
    driveLink,
    publishedPostLink,
    publishedLinks, // expect [{ platform: "FB", url: "..." }, ...]
  } = req.body;

  if (status && !Object.values(TaskStatus).includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    });
  }

  try {
    await prisma.task.update({
      where: { id },
      data: {
        title,
        clientId: clientId ? Number(clientId) : undefined,
        assignedToId: assignedToId !== undefined ? Number(assignedToId) : undefined,
        contentType,
        platforms,
        quantity: quantity ? Number(quantity) : undefined,
        status,
        reviewRound,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
        scheduledPublishDate: scheduledPublishDate ? new Date(scheduledPublishDate) : undefined,
        actualPublishDate: actualPublishDate ? new Date(actualPublishDate) : undefined,
        caption,
        instructions,
        workingFileLink,
        driveLink,
        publishedPostLink,
      },
    });

    if (Array.isArray(publishedLinks)) {
      for (const link of publishedLinks) {
        if (!link.platform || !link.url) continue;
        await prisma.taskPublishedLink.upsert({
          where: {
            taskId_platform: { taskId: id, platform: link.platform },
          },
          update: { url: link.url },
          create: { taskId: id, platform: link.platform, url: link.url },
        });
      }
    }

    const fullTask = await prisma.task.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: true,
        publishedLinks: true,
        revisions: { orderBy: { version: "desc" } },
      },
    });

    res.json(fullTask);
  } catch (err) {
    res.status(404).json({ error: `Task with id ${id} not found` });
  }
});

// POST /api/tasks/:id/revisions - log a new iteration while a task is in internal review
router.post("/:id/revisions", async (req, res) => {
  const taskId = Number(req.params.id);
  const { notes, fileLink } = req.body;

  if (!notes && !fileLink) {
    return res.status(400).json({ error: "notes or fileLink is required" });
  }

  try {
    const lastRevision = await prisma.taskRevision.findFirst({
      where: { taskId },
      orderBy: { version: "desc" },
    });

    const revision = await prisma.taskRevision.create({
      data: {
        taskId,
        version: (lastRevision?.version ?? 0) + 1,
        notes: notes || undefined,
        fileLink: fileLink || undefined,
      },
    });
    res.status(201).json(revision);
  } catch (err) {
    res.status(400).json({ error: "Failed to add revision. Check that the task exists." });
  }
});

// DELETE /api/tasks/:id/revisions/:revisionId
router.delete("/:id/revisions/:revisionId", async (req, res) => {
  const revisionId = Number(req.params.revisionId);

  try {
    await prisma.taskRevision.delete({ where: { id: revisionId } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: `Revision with id ${revisionId} not found` });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: `Task with id ${id} not found` });
  }
});

export default router;