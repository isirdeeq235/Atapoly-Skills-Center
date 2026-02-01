import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

// List email templates
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await prisma.emailTemplates.findMany({ orderBy: { template_key: 'asc' } });
    res.json(items);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get template by key
router.get("/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const item = await prisma.emailTemplates.findFirst({ where: { template_key: key } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update template (admin)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await prisma.emailTemplates.update({ where: { id }, data: { ...updates } });
    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
