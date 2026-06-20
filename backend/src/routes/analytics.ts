import { Router, Response } from 'express';
import sql from '../db/index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalRevenue] = await sql`SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'`;
    const [totalOrders] = await sql`SELECT COUNT(*) as count FROM orders`;
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`;
    const [totalProducts] = await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`;
    const [pendingOrders] = await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`;

    const recentOrders = await sql`
      SELECT o.id, o.total, o.status, o.created_at, u.name as user_name
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `;

    const topProducts = await sql`
      SELECT p.id, p.name, p.price, p.image_url, SUM(oi.quantity) as sold
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY sold DESC LIMIT 5
    `;

    const monthlySales = await sql`
      SELECT DATE_TRUNC('month', created_at) as month, SUM(total) as revenue, COUNT(*) as orders
      FROM orders WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY month
    `;

    const ordersByStatus = await sql`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `;

    res.json({
      stats: {
        revenue: parseFloat(totalRevenue.revenue),
        orders: parseInt(totalOrders.count),
        users: parseInt(totalUsers.count),
        products: parseInt(totalProducts.count),
        pendingOrders: parseInt(pendingOrders.count)
      },
      recentOrders,
      topProducts,
      monthlySales,
      ordersByStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
