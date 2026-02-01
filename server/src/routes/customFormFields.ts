import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Public: list active fields with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { form_type, program_id } = req.query as any;

    const where: any = { is_active: true };
    if (form_type) where.form_type = form_type;

    if (form_type === 'application' && program_id) {
      where.OR = [
        { program_id: String(program_id) },
        { program_id: null }
      ];
    } else if (form_type === 'profile') {
      where.program_id = null;
    }

    const fields = await prisma.customFormField.findMany({ where, orderBy: [{ form_type: 'asc' }, { display_order: 'asc' }] as any });
    res.json({ fields });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: all fields
router.get('/admin/all', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const fields = await prisma.customFormField.findMany({ orderBy: [{ form_type: 'asc' }, { display_order: 'asc' }] as any });
    res.json({ fields });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin create
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const created = await prisma.customFormField.create({ data });
    res.json({ field: created });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin update
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await prisma.customFormField.update({ where: { id }, data: updates } as any);
    res.json({ field: updated });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin delete
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customFormField.delete({ where: { id } } as any);
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
