import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import sql from '../db/index';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim()
    .regex(/^[\p{L}\s'\-]+$/u, 'Name contains invalid characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email').max(254).toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});

function signToken(user: { id: number; email: string; role: string }, expiresIn: string) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn } as any
  );
}

router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, name } = parsed.data;

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name) VALUES (${email}, ${hash}, ${name})
      RETURNING id, email, name, role, created_at
    `;
    const token = signToken(user, '7d');
    res.status(201).json({ token, user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    // Always run bcrypt to prevent timing-based user enumeration
    const dummyHash = '$2b$12$invalidhashfortimingprotection0000000000000000000000';
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user, '7d');
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin/login', authRateLimit, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email} AND role = 'admin'`;
    const dummyHash = '$2b$12$invalidhashfortimingprotection0000000000000000000000';
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user, '1d');
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
