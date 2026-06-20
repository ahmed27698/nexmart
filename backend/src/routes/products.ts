import { Router, Request, Response } from 'express';
import { z } from 'zod';
import sql from '../db/index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_SORT = ['created_at', 'price', 'rating', 'discount'] as const;

function safeInt(val: unknown, fallback: number, min = 1, max = 200): number {
  const n = parseInt(val as string, 10);
  return isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
}

const productSchema = z.object({
  name: z.string().min(1, 'Name required').max(255).trim(),
  description: z.string().max(5000).trim().optional().default(''),
  price: z.number().positive('Price must be positive').max(999999),
  original_price: z.number().positive().max(999999).optional().nullable(),
  stock: z.number().int().min(0).max(999999),
  category_id: z.number().int().positive(),
  image_url: z.string().url('Invalid image URL').max(512).optional().nullable(),
  images: z.array(z.string().url().max(512)).max(10).optional().default([]),
  is_featured: z.boolean().optional().default(false),
  brand: z.string().max(100).trim().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sort, featured } = req.query;
    const page = safeInt(req.query.page, 1, 1, 1000);
    const limit = safeInt(req.query.limit, 20, 1, 100);
    const offset = (page - 1) * limit;
    const sortField = ALLOWED_SORT.includes(sort as any) ? (sort as string) : 'created_at';

    if (featured === 'true') {
      const products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND p.is_featured = true
        ORDER BY p.created_at DESC LIMIT 12
      `;
      return res.json({ products, total: products.length });
    }

    let products;
    let countResult;

    if (search) {
      const term = String(search).slice(0, 100);
      products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND (p.name ILIKE ${'%' + term + '%'} OR p.description ILIKE ${'%' + term + '%'})
        ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM products
        WHERE is_active = true AND (name ILIKE ${'%' + term + '%'} OR description ILIKE ${'%' + term + '%'})
      `;
    } else if (category) {
      const cat = String(category).slice(0, 100).replace(/[^a-z0-9\-]/gi, '');
      if (sortField === 'price') {
        products = await sql`
          SELECT p.*, c.name as category_name, c.slug as category_slug
          FROM products p LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true AND c.slug = ${cat}
          ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (sortField === 'rating') {
        products = await sql`
          SELECT p.*, c.name as category_name, c.slug as category_slug
          FROM products p LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true AND c.slug = ${cat}
          ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        products = await sql`
          SELECT p.*, c.name as category_name, c.slug as category_slug
          FROM products p LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true AND c.slug = ${cat}
          ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      }
      countResult = await sql`
        SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND c.slug = ${cat}
      `;
    } else if (sortField === 'discount') {
      products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug,
          CASE WHEN p.original_price > 0 THEN ROUND(((p.original_price - p.price) / p.original_price) * 100) ELSE 0 END as discount_pct
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND p.original_price IS NOT NULL AND p.original_price > p.price
        ORDER BY (p.original_price - p.price) / p.original_price DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM products
        WHERE is_active = true AND original_price IS NOT NULL AND original_price > price
      `;
    } else if (sortField === 'rating') {
      products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
    } else if (sortField === 'price') {
      products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
    } else {
      products = await sql`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
    }

    res.json({ products, total: parseInt(countResult?.[0]?.count ?? '0') });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

  try {
    const [product] = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id} AND p.is_active = true
    `;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const reviews = await sql`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${id}
      ORDER BY r.created_at DESC LIMIT 10
    `;
    res.json({ ...product, reviews });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;

  try {
    const [product] = await sql`
      INSERT INTO products (name, description, price, original_price, stock, category_id, image_url, images, is_featured, brand, tags)
      VALUES (${d.name}, ${d.description}, ${d.price}, ${d.original_price ?? null}, ${d.stock}, ${d.category_id}, ${d.image_url ?? null}, ${d.images}, ${d.is_featured}, ${d.brand ?? null}, ${d.tags})
      RETURNING *
    `;
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

  const parsed = productSchema.extend({ is_active: z.boolean().optional().default(true) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;

  try {
    const [product] = await sql`
      UPDATE products SET
        name = ${d.name}, description = ${d.description}, price = ${d.price},
        original_price = ${d.original_price ?? null}, stock = ${d.stock}, category_id = ${d.category_id},
        image_url = ${d.image_url ?? null}, images = ${d.images}, is_featured = ${d.is_featured},
        is_active = ${(d as any).is_active ?? true}, brand = ${d.brand ?? null}, tags = ${d.tags}
      WHERE id = ${id} RETURNING *
    `;
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

  try {
    await sql`UPDATE products SET is_active = false WHERE id = ${id}`;
    res.json({ message: 'Product deactivated' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
