import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/status-history?application_id=...&limit=50
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { application_id, limit } = req.query as any;
    const take = Number(limit || 50);

    let where: any = {};
    if (application_id) {
      where.application_id = String(application_id);
    } else {
      // map auth user -> profile
      const user = await prisma.user.findUnique({ where: { id: Number((req as any).userId) } as any });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const profile = await prisma.profile.findUnique({ where: { email: user.email } });
      if (!profile) return res.json([]);
      where.trainee_id = profile.id;
    }

    const data = await prisma.statusHistory.findMany({ where, orderBy: { created_at: 'desc' } as any, take });
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/status-history/:applicationId/timeline
router.get('/:applicationId/timeline', requireAuth, async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const data = await prisma.statusHistory.findMany({ where: { application_id: applicationId }, orderBy: { created_at: 'asc' } as any });
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: get status history across all trainees
router.get('/admin', requireAuth, async (req: Request, res: Response) => {
  try {
    // require admin role - reuse requireAdmin logic
    const { limit } = req.query as any;
    const take = Number(limit || 500);

    // verify admin - requireAdmin middleware not used to retain single place; however reuse user email check
    const user = await prisma.user.findUnique({ where: { id: Number((req as any).userId) } as any });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Very simple admin check: check if user exists in userRole with role 'admin' or 'super_admin'
    const ur = await prisma.userRole.findUnique({ where: { user_id: user.id } as any });
    if (!ur || (ur.role !== 'admin' && ur.role !== 'super_admin')) return res.status(403).json({ error: 'Forbidden' });

    const history = await prisma.statusHistory.findMany({ orderBy: { created_at: 'desc' } as any, take });

    // collect unique trainee and application ids
    const traineeIds = Array.from(new Set(history.map(h => h.trainee_id).filter(Boolean)));
    const applicationIds = Array.from(new Set(history.map(h => h.application_id).filter(Boolean)));

    const profiles = traineeIds.length > 0 ? await prisma.profile.findMany({ where: { id: { in: traineeIds } } }) : [];
    const applications = applicationIds.length > 0 ? await prisma.application.findMany({ where: { id: { in: applicationIds } }, include: { programs: true } as any }) : [];

    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const appMap = new Map(applications.map(a => [a.id, a]));

    const enriched = history.map(h => ({ ...h, profiles: profileMap.get(h.trainee_id) || null, applications: appMap.get(h.application_id) || null } as any));
    res.json(enriched);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
