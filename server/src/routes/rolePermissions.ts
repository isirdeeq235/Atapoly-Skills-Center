import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// GET /api/role-permissions?role=admin
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query as any;
    const where: any = {};
    if (role) where.role = String(role);
    const perms = await prisma.rolePermission.findMany({ where, orderBy: [{ permission_category: 'asc' }, { permission_label: 'asc' }] as any });
    res.json({ perms });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a single permission
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await prisma.rolePermission.update({ where: { id }, data: updates } as any);
    res.json({ perm: updated });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk update by role
router.put('/bulk/:role', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { is_enabled } = req.body;
    const updated = await prisma.rolePermission.updateMany({ where: { role }, data: { is_enabled, updated_at: new Date() } as any });
    res.json({ count: updated.count });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
