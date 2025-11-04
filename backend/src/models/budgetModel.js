import { query } from '../config/db.js';

export async function setMonthlyBudget(userId, month, limit_amount) {
  const result = await query(
    `INSERT INTO budgets (user_id, month, limit_amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, month) DO UPDATE SET limit_amount = EXCLUDED.limit_amount
     RETURNING id, user_id, month, limit_amount, created_at`,
    [userId, month, limit_amount]
  );
  return result.rows[0];
}

export async function getMonthlyBudget(userId, month) {
  const result = await query(`SELECT id, month, limit_amount FROM budgets WHERE user_id=$1 AND month=$2`, [userId, month]);
  return result.rows[0] || null;
}

export async function getBudgetProgress(userId, month) {
  // Calculate month range using SQL to avoid invalid last-day values
  const exp = await query(
    `SELECT COALESCE(SUM(amount),0) as spent
     FROM transactions
     WHERE user_id=$1 AND type='expense'
       AND date >= to_date($2, 'YYYY-MM')
       AND date < (to_date($2, 'YYYY-MM') + INTERVAL '1 month')`,
    [userId, month]
  );
  const budget = await getMonthlyBudget(userId, month);
  return { month, limit_amount: Number(budget?.limit_amount || 0), spent: Number(exp.rows[0].spent) };
}


