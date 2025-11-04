import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT t.amount::float8 AS amount,
              COALESCE(c.name, 'Uncategorized') AS category,
              t.date::date AS date
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1 AND t.type = 'expense'
       ORDER BY t.date DESC, t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows.map(r => ({ amount: Number(r.amount), category: r.category, date: r.date })));
  } catch (e) { next(e); }
});

export default router;


