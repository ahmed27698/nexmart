import { Router, Response } from 'express';
import sql from '../db/index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shipping_address, payment_method } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items in order' });

    let total = 0;
    for (const item of items) {
      const [product] = await sql`SELECT price, stock FROM products WHERE id = ${item.product_id}`;
      if (!product || product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
      total += parseFloat(product.price) * item.quantity;
    }

    const [order] = await sql`
      INSERT INTO orders (user_id, total, shipping_address, payment_method)
      VALUES (${req.user!.id}, ${total}, ${JSON.stringify(shipping_address)}, ${payment_method})
      RETURNING *
    `;

    for (const item of items) {
      const [product] = await sql`SELECT price FROM products WHERE id = ${item.product_id}`;
      await sql`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${product.price})`;
      await sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`;
    }

    await sql`DELETE FROM cart_items WHERE user_id = ${req.user!.id}`;
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await sql`
      SELECT o.*, json_agg(json_build_object('id', oi.id, 'quantity', oi.quantity, 'price', oi.price, 'product_id', oi.product_id, 'name', p.name, 'image_url', p.image_url)) as items
      FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${req.user!.id} GROUP BY o.id ORDER BY o.created_at DESC
    `;
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await sql`
      SELECT o.*, u.name as user_name, u.email as user_email,
        json_agg(json_build_object('id', oi.id, 'quantity', oi.quantity, 'price', oi.price, 'product_id', oi.product_id, 'name', p.name)) as items
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC
    `;
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const [order] = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${req.params.id} RETURNING *
    `;
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
