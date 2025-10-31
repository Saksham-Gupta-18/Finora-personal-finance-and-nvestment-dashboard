import { query } from '../config/db.js';

export async function computeAndStoreDailySnapshot(userId) {
  const totals = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as total_income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as total_expense
     FROM transactions WHERE user_id = $1`,
    [userId]
  );
  const { total_income, total_expense } = totals.rows[0];
  const total_savings = Number(total_income) - Number(total_expense);
  await query(
    `INSERT INTO savings (user_id, total_income, total_expense, total_savings, date)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
    [userId, total_income, total_expense, total_savings]
  );
  return { total_income, total_expense, total_savings };
}

export async function listSavings(userId) {
  const result = await query(
    `SELECT id, total_income, total_expense, total_savings, date, created_at
     FROM savings WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT 60`,
    [userId]
  );
  return result.rows;
}


