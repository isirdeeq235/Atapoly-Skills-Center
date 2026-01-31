import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    res.json(posts);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, body } = req.body;
    const userId = req.userId!;
    if (!title) return res.status(400).json({ error: "title required" });
    const post = await prisma.post.create({ data: { title, body, authorId: userId } });
    res.status(201).json(post);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;