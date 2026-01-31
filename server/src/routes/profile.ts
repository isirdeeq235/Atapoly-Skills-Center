import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

// Get current user's profile (match by email)
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    res.json({ profile, email: user.email });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update profile (create if missing)
router.put("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { full_name, phone, avatar_url } = req.body;

    let profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (profile) {
      profile = await prisma.profile.update({ where: { email: user.email }, data: { full_name, phone, avatar_url, updated_at: new Date() as any } });
    } else {
      profile = await prisma.profile.create({ data: { email: user.email, full_name, phone, avatar_url } });
    }

    res.json({ profile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
