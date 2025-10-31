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
  const start = month + '-01';
  const end = month + '-31';
  const exp = await query(
    `SELECT COALESCE(SUM(amount),0) as spent FROM transactions WHERE user_id=$1 AND type='expense' AND date >= $2 AND date <= $3`,
    [userId, start, end]
  );
  const budget = await getMonthlyBudget(userId, month);
  return { month, limit_amount: Number(budget?.limit_amount || 0), spent: Number(exp.rows[0].spent) };
}


