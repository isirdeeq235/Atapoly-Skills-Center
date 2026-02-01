import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.get("/stats", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const trainees = await prisma.profile.count();

    const pending = await prisma.application.count({ where: { status: 'pending', submitted: true, application_fee_paid: true } as any });

    const programs = await prisma.program.count({ where: { status: 'published' } as any });

    // Compute revenue from completed payments (best-effort, depends on metadata)
    const completedPayments = await prisma.payment.findMany({ where: { status: 'completed' } as any });
    let totalRevenue = 0;
    for (const p of completedPayments) {
      const meta: any = p.metadata || {};
      const amt = meta?.amount || (meta?.data?.amount) || 0;
      totalRevenue += Number(amt) || 0;
    }

    // Recent applications (submitted & fee paid)
    const recentApplications = await prisma.application.findMany({ where: { submitted: true, application_fee_paid: true } as any, orderBy: { submitted_at: 'desc' } as any, take: 5, include: { programs: true } as any });

    // Recent payments (include trainee profiles)
    const recentPayments = await prisma.payment.findMany({ where: { status: 'completed' } as any, orderBy: { created_at: 'desc' } as any, take: 5 });
    const traineeIds = Array.from(new Set(recentPayments.map((p: any) => p.trainee_id).filter(Boolean)));
    const profiles = traineeIds.length > 0 ? await prisma.profile.findMany({ where: { id: { in: traineeIds } } }) : [];
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const recentPaymentsWithProfile = recentPayments.map((p: any) => ({ ...p, profiles: profileMap.get(p.trainee_id) || null }));

    res.json({ trainees, pending, programs, revenue: totalRevenue, recentApplications, recentPayments: recentPaymentsWithProfile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: list users and their roles
router.get('/users', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({ orderBy: { updated_at: 'desc' } as any });
    const roles = await prisma.userRole.findMany();
    const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

    const users = profiles.map(p => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      phone: p.phone,
      avatar_url: p.avatar_url,
      created_at: p.updated_at || null,
      role: (roleMap.get(p.id) as string) || 'trainee'
    }));

    res.json({ users });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: update a user's role
router.put('/users/:id/role', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    // Upsert into user_roles
    await prisma.userRole.upsert({
      where: { user_id: id },
      update: { role },
      create: { user_id: id, role }
    } as any);

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
