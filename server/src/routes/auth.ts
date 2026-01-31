import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Forgot password - generate reset token and send email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const token = Math.random().toString(36).slice(2, 12) + '-' + Date.now();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordReset.create({ data: { email, token, expiresAt } });

    // send reset email
    const resetLink = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${token}`;
    await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject: 'Password reset', html: `<p>Use this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>` })
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password required' });

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired token' });

    const user = await prisma.user.findUnique({ where: { email: reset.email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;