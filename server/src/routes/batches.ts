import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

// List batches (optionally filter by program_id)
router.get("/", async (req: Request, res: Response) => {
  try {
      const { program_id, status } = req.query as any;
    const where: any = {};
    if (program_id) where.program_id = String(program_id);
    if (status) {
      // support comma-separated or single status
      const statuses = String(status).split(',').map((s: string) => s.trim());
      if (statuses.length === 1) where.status = statuses[0];
      else where.status = { in: statuses };
    }

    const batches = await prisma.batch.findMany({
      where,
      orderBy: { start_date: 'asc' } as any,
      include: {
        program: { select: { title: true } },
      },
    });

    // add enrolled_count placeholder (0) for now
    const enriched = batches.map((b) => ({ ...b, enrolled_count: 0 }));
    res.json(enriched);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create batch (admin)
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { program_id, batch_name, start_date, end_date, max_capacity, status } = req.body as any;
    const b = await prisma.batch.create({ data: { program_id, batch_name, start_date: start_date ? new Date(start_date) : null, end_date: end_date ? new Date(end_date) : null, max_capacity: max_capacity ? Number(max_capacity) : null, status } });
    res.status(201).json(b);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update batch (admin)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as any;
    const b = await prisma.batch.update({ where: { id }, data: { batch_name: data.batch_name, start_date: data.start_date ? new Date(data.start_date) : null, end_date: data.end_date ? new Date(data.end_date) : null, max_capacity: data.max_capacity ? Number(data.max_capacity) : null, status: data.status } });
    res.json(b);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete batch (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.batch.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
