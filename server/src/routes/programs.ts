import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

// List programs
router.get("/", async (req, res) => {
  try {
    const showAll = req.query.showAll === 'true' || req.query.showAll === true;
    const where: any = {};
    if (!showAll) where.status = 'published';

    const programs = await prisma.program.findMany({ where, orderBy: { createdAt: 'desc' } as any });
    res.json(programs);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get program by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) return res.status(404).json({ error: 'Not found' });
    res.json(program);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create program (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const p = await prisma.program.create({ data });
    res.status(201).json(p);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update program (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const p = await prisma.program.update({ where: { id }, data });
    res.json(p);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete program (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.program.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
