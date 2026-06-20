import { Router, Request, Response } from 'express';
import sql from '../db/index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name`;
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, image_url } = req.body;
    const [cat] = await sql`INSERT INTO categories (name, slug, image_url) VALUES (${name}, ${slug}, ${image_url}) RETURNING *`;
    res.status(201).json(cat);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, image_url } = req.body;
    const [cat] = await sql`UPDATE categories SET name = ${name}, slug = ${slug}, image_url = ${image_url} WHERE id = ${req.params.id} RETURNING *`;
    res.json(cat);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
