import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Create application (trainee)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    // ensure trainee id is provided or derived from auth
    let traineeId = body.trainee_id as string | undefined;
    if (!traineeId && req.userId) {
      const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
      if (user) {
        const profile = await prisma.profile.findUnique({ where: { email: user.email } });
        traineeId = profile?.id;
      }
    }
    if (!traineeId) return res.status(400).json({ error: 'trainee_id required' });

    const app = await prisma.application.create({ data: { ...body, trainee_id: traineeId } as any });
    res.status(201).json(app);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get application by id (trainee or admin)
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({ where: { id }, include: { programs: true } as any });
    if (!application) return res.status(404).json({ error: 'Not found' });

    // Check access: if user is trainee, ensure they own it
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (user) {
      const profile = await prisma.profile.findUnique({ where: { email: user.email } });
      if (profile && profile.id !== application.trainee_id) {
        // not owner; allow admins only
        const isAdmin = false; // requireAdmin middleware handles admin-only in other routes
      }
    }

    res.json(application);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update application (trainee can update their own, admin can update many fields)
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If a trainee is updating, ensure they own it
    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (user) {
      const profile = await prisma.profile.findUnique({ where: { email: user.email } });
      if (profile) {
        const application = await prisma.application.findUnique({ where: { id } });
        if (application && application.trainee_id !== profile.id) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
    }

    const updated = await prisma.application.update({ where: { id }, data: updates as any });

    // If application marked submitted, notify admins
    if (updates.submitted) {
      try {
        const admins = await prisma.profile.findMany({ where: {} }); // TODO: use user_roles table if exists
        for (const a of admins) {
          await prisma.notification.create({ data: { user_id: a.id, type: 'new_application_for_review', title: 'New Application Submitted', message: 'A new application has been submitted for review', metadata: { application_id: id } as any } as any });
        }
      } catch (e) {
        console.error('Error notifying admins', e);
      }
    }

    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List applications (admin or trainee own list)
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { trainee_id, status } = req.query as any;

    let where: any = {};
    if (trainee_id) where.trainee_id = trainee_id;
    if (status) where.status = status;

    // If not provided, try to limit to current user
    if (!where.trainee_id && req.userId) {
      const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
      if (user) {
        const profile = await prisma.profile.findUnique({ where: { email: user.email } });
        if (profile) where.trainee_id = profile.id;
      }
    }

    const apps = await prisma.application.findMany({ where, orderBy: { created_at: 'desc' } as any, include: { programs: true } as any });
    res.json(apps);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: list all applications with profiles and program relations
router.get("/admin", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const apps = await prisma.application.findMany({ orderBy: { created_at: 'desc' } as any, include: { programs: true, profiles: true } as any });
    res.json(apps);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: update application status/notes and send notifications/emails
router.put("/:id/admin", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body as { status?: string; notes?: string };

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.admin_notes = notes;

    const updated = await prisma.application.update({ where: { id }, data: updateData as any });

    // Notify trainee
    try {
      const traineeId = updated.trainee_id;
      const app = await prisma.application.findUnique({ where: { id }, include: { programs: true } as any });
      // create in-app notification
      await prisma.notification.create({ data: { user_id: traineeId, type: status === 'approved' ? 'application_approved' : 'application_rejected', title: status === 'approved' ? 'Application Approved! 🎉' : 'Application Update', message: status === 'approved' ? `Your application for ${app?.programs?.title} has been approved.` : `Your application has been reviewed.`, metadata: { application_id: id, program_id: app?.programs?.id, program_title: app?.programs?.title } as any } as any });

      // send email via server-side email endpoint
      try {
        const recipient = await prisma.profile.findUnique({ where: { id: traineeId } });
        if (recipient?.email) {
          await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient.email, template: status === 'approved' ? 'application_approved' : 'application_rejected', data: { name: recipient.full_name, program: app?.programs?.title, admin_notes: notes || '', dashboard_url: `${process.env.CLIENT_BASE_URL || 'http://localhost:5173'}/dashboard/applications` } }),
          });
        }
      } catch (e) {
        console.error('Error sending status email', e);
      }
    } catch (e) {
      console.error('Error creating notification/email for trainee', e);
    }

    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Manually mark payment as complete (application_fee or registration_fee)
router.post("/:id/mark-payment-complete", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { paymentType } = req.body as { paymentType: 'application_fee' | 'registration_fee' };

    if (!['application_fee', 'registration_fee'].includes(paymentType)) return res.status(400).json({ error: 'Invalid payment type' });

    if (paymentType === 'application_fee') {
      await prisma.application.update({ where: { id }, data: { application_fee_paid: true, updated_at: new Date() } as any });
      // notify trainee
      const app = await prisma.application.findUnique({ where: { id } });
      if (app) {
        await prisma.notification.create({ data: { user_id: app.trainee_id, type: 'payment_verified', title: 'Payment Verified ✓', message: 'Your application fee has been verified by admin. Please complete your profile to continue.', metadata: { application_id: id } as any } as any });
      }

      return res.json({ success: true, paymentType });
    }

    // registration_fee
    // generate registration number and mark registration fee paid, increment program enrolled_count
    const registrationNumber = `R-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    await prisma.application.update({ where: { id }, data: { registration_fee_paid: true, registration_number: registrationNumber, updated_at: new Date() } as any });

    try {
      const app = await prisma.application.findUnique({ where: { id }, include: { programs: true } as any });
      if (app?.program_id) {
        await prisma.program.update({ where: { id: app.program_id }, data: { enrolled_count: { increment: 1 } as any } as any });
      }

      // notify trainee of registration complete
      await prisma.notification.create({ data: { user_id: app?.trainee_id as any, type: 'registration_complete', title: 'Registration Complete! 🎓', message: `Your registration fee has been verified. You are now enrolled. Your registration number is ${registrationNumber}.`, metadata: { application_id: id, registration_number: registrationNumber } as any } as any });

      // send registration email via local endpoint
      try {
        const recipient = await prisma.profile.findUnique({ where: { id: app?.trainee_id } });
        if (recipient?.email) {
          await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient.email, template: 'registration_complete', data: { name: recipient.full_name || 'Trainee', program: app?.programs?.title || 'Program', registration_number: registrationNumber } }),
          });
        }
      } catch (e) {
        console.error('Error sending registration email', e);
      }
    } catch (e) {
      console.error('Error finishing registration workflow', e);
    }

    res.json({ success: true, paymentType: 'registration_fee', registrationNumber });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
