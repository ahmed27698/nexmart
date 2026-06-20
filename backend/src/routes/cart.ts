import { Router, Response } from 'express';
import sql from '../db/index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await sql`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock, p.original_price
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${req.user!.id}
    `;
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const [item] = await sql`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (${req.user!.id}, ${product_id}, ${quantity})
      ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + ${quantity}
      RETURNING *
    `;
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:product_id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await sql`DELETE FROM cart_items WHERE user_id = ${req.user!.id} AND product_id = ${req.params.product_id}`;
      return res.json({ message: 'Item removed' });
    }
    const [item] = await sql`
      UPDATE cart_items SET quantity = ${quantity}
      WHERE user_id = ${req.user!.id} AND product_id = ${req.params.product_id} RETURNING *
    `;
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:product_id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await sql`DELETE FROM cart_items WHERE user_id = ${req.user!.id} AND product_id = ${req.params.product_id}`;
    res.json({ message: 'Removed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
