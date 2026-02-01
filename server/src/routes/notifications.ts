import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import prisma from "../lib/prisma";
import { subscribe, publishToUser, broadcast } from "../lib/notifications";

const router = Router();

// SSE stream endpoint (supports token in query param for EventSource)
router.get('/stream', async (req, res) => {
  try {
    // Try header-based auth first
    const authHeader = req.headers.authorization as string | undefined;
    let userId: number | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload: any = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'change_me');
        userId = payload.userId;
      } catch (e) {
        // fall through
      }
    }

    // If not header, try token query param
    if (!userId && req.query.token) {
      try {
        const payload: any = require('jsonwebtoken').verify(String(req.query.token), process.env.JWT_SECRET || 'change_me');
        userId = payload.userId;
      } catch (e) {
        // invalid token
      }
    }

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // subscribe will set SSE headers
    subscribe(user.id.toString(), res as any);
    // keep the connection open
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List notifications for current user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (!profile) return res.json([]);

    const notes = await prisma.notification.findMany({ where: { user_id: profile.id }, orderBy: { created_at: 'desc' } as any });
    res.json(notes);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification read
router.put('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const note = await prisma.notification.findUnique({ where: { id } as any });
    if (!note || note.user_id !== profile.id) return res.status(404).json({ error: 'Notification not found' });

    const updated = await prisma.notification.update({ where: { id }, data: { read: true } as any });
    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete single notification (user)
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const note = await prisma.notification.findUnique({ where: { id } as any });
    if (!note || note.user_id !== profile.id) return res.status(404).json({ error: 'Notification not found' });

    await prisma.notification.delete({ where: { id } as any });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Clear all notifications for current user
router.delete('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    await prisma.notification.deleteMany({ where: { user_id: profile.id } as any });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create a notification for a specific user (admin only)
router.post('/create', requireAdmin, async (req, res) => {
  try {
    const { user_id, type, title, message, metadata } = req.body;
    if (!user_id || !type || !title) return res.status(400).json({ error: 'user_id, type and title required' });

    const n = await prisma.notification.create({ data: { user_id, type, title, message, metadata } as any } as any);
    try { publishToUser(user_id, 'notification', n); } catch (e) {}
    res.json(n);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin broadcast
router.post('/broadcast', requireAdmin, async (req, res) => {
  try {
    const { title, message, metadata } = req.body;
    // create notifications for all profiles (or use filters)
    const profiles = await prisma.profile.findMany();
    const created: any[] = [];
    for (const p of profiles) {
      const n = await prisma.notification.create({ data: { user_id: p.id, type: 'announcement', title, message, metadata } as any } as any);
      publishToUser(p.id, 'notification', n);
      created.push(n);
    }
    res.json({ success: true, created: created.length });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
