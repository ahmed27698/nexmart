import { Router, Response } from 'express';
import { z } from 'zod';
import sql from '../db/index';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_ROLES = ['customer', 'admin'] as const;

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').trim(),
  currentPassword: z.string().max(128).optional(),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await sql`SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ${req.user!.id}`;
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name, currentPassword, newPassword } = parsed.data;

  try {
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to set a new password' });
      const [user] = await sql`SELECT password_hash FROM users WHERE id = ${req.user!.id}`;
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
      const hash = await bcrypt.hash(newPassword, 12);
      await sql`UPDATE users SET name = ${name}, password_hash = ${hash} WHERE id = ${req.user!.id}`;
    } else {
      await sql`UPDATE users SET name = ${name} WHERE id = ${req.user!.id}`;
    }

    const [updated] = await sql`SELECT id, email, name, role FROM users WHERE id = ${req.user!.id}`;
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await sql`SELECT id, email, name, role, avatar_url, created_at FROM users ORDER BY created_at DESC`;
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Prevent self-demotion
  const targetId = parseInt(String(req.params.id), 10);
  if (isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });
  if (targetId === req.user!.id) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  try {
    const [user] = await sql`UPDATE users SET role = ${role} WHERE id = ${targetId} RETURNING id, email, name, role`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
