import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

// List all site settings as key->value map
router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, any> = {};
    rows.forEach((r) => (map[r.key] = r.value));
    res.json(map);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single setting
router.get("/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row.value);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Upsert setting (admin)
router.put("/:key", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = req.body;
    const up = await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    res.json(up);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
