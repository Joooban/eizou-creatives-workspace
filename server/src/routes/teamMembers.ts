import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/team-members
router.get("/", async (req, res) => {
  const members = await prisma.teamMember.findMany();
  res.json(members);
});

// POST /api/team-members
router.post("/", async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: "name and role are required" });
  }

  const member = await prisma.teamMember.create({
    data: { name, role },
  });

  res.status(201).json(member);
});

// PUT /api/team-members/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, role, isActive } = req.body;

  try {
    const member = await prisma.teamMember.update({
      where: { id },
      data: { name, role, isActive },
    });
    res.json(member);
  } catch (err) {
    res.status(404).json({ error: `Team member with id ${id} not found` });
  }
});

// DELETE /api/team-members/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.teamMember.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: `Team member with id ${id} not found` });
  }
});

export default router;