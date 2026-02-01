import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/certificates - list certificates for current trainee
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number((req as any).userId) } as any });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (!profile) return res.json([]);

    const certs = await prisma.certificate.findMany({ where: { trainee_id: profile.id }, orderBy: { issued_at: 'desc' } as any });

    // enrich with application + program + batch info where available
    const enriched = await Promise.all(certs.map(async (c: any) => {
      const application = c.application_id ? await prisma.application.findUnique({ where: { id: c.application_id } }) : null;
      const program = c.program_id ? await prisma.program.findUnique({ where: { id: c.program_id } }) : null;
      const batch = c.batch_id ? await prisma.batch.findUnique({ where: { id: c.batch_id } as any }) : null;
      return { ...c, application, program, batch };
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Issue certificate for an application (admin)
router.post('/issue', requireAuth, async (req: Request, res: Response) => {
  try {
    const { application_id } = req.body as any;
    if (!application_id) return res.status(400).json({ error: 'application_id required' });

    // check admin
    const user = await prisma.user.findUnique({ where: { id: Number((req as any).userId) } as any });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ur = await prisma.userRole.findUnique({ where: { user_id: user.id } as any });
    if (!ur || (ur.role !== 'admin' && ur.role !== 'super_admin')) return res.status(403).json({ error: 'Forbidden' });

    // idempotent: return existing certificate if present
    const existing = await prisma.certificate.findFirst({ where: { application_id } });
    if (existing) return res.json({ certificate: existing, existed: true });

    // create certificate
    const certificateNumber = `CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const app = await prisma.application.findUnique({ where: { id: application_id } });
    const created = await prisma.certificate.create({ data: { application_id, program_id: app?.program_id || null, batch_id: app?.batch_id || null, trainee_id: app?.trainee_id || null, certificate_number: certificateNumber } as any });

    // create in-app notification
    if (created && created.trainee_id) {
      await prisma.notification.create({ data: { user_id: created.trainee_id, type: 'certificate_issued', title: 'Certificate Issued 🎖️', message: `Your completion certificate (${created.certificate_number}) has been issued.`, metadata: { certificate_id: created.id, application_id } as any } as any });
    }

    res.json({ certificate: created, existed: false });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
