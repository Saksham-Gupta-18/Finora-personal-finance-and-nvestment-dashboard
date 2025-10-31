import { query } from '../config/db.js';

export async function createTransaction({ userId, type, amount, categoryId, note, date }) {
  const result = await query(
    `INSERT INTO transactions (user_id, category_id, type, amount, note, date)
     VALUES ($1, $2, $3, $4, COALESCE($5, ''), COALESCE($6, CURRENT_DATE))
     RETURNING id, user_id, category_id, type, amount, note, date, created_at`,
    [userId, categoryId, type, amount, note, date]
  );
  return result.rows[0];
}

export async function getTransactionsByUser(userId) {
  const result = await query(
    `SELECT t.id, t.user_id, t.type, t.amount, t.note, t.date, t.created_at, t.updated_at,
            c.id as category_id, c.name as category
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.date DESC, t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getTransactionById(userId, id) {
  const result = await query(
    `SELECT t.id, t.user_id, t.type, t.amount, t.note, t.date, t.created_at, t.updated_at,
            c.id as category_id, c.name as category
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1 AND t.id = $2`,
    [userId, id]
  );
  return result.rows[0] || null;
}

export async function updateTransactionById(userId, id, { type, amount, categoryId, note, date }) {
  const result = await query(
    `UPDATE transactions
     SET category_id = COALESCE($3, category_id),
         type = COALESCE($4, type),
         amount = COALESCE($5, amount),
         note = COALESCE($6, note),
         date = COALESCE($7, date),
         updated_at = NOW()
     WHERE user_id = $1 AND id = $2
     RETURNING id, user_id, category_id, type, amount, note, date, created_at, updated_at`,
    [userId, id, categoryId, type, amount, note, date]
  );
  return result.rows[0] || null;
}

export async function deleteTransactionById(userId, id) {
  const result = await query(
    `DELETE FROM transactions
     WHERE user_id = $1 AND id = $2
     RETURNING id`,
    [userId, id]
  );
  return result.rowCount > 0;
}

export async function getStats(userId) {
  const totals = await query(
    `SELECT
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
     FROM transactions WHERE user_id = $1`,
    [userId]
  );
  return totals.rows[0];
}

export async function getMonthlyIncomeExpense(userId, { start, end } = {}) {
  const result = await query(
    `SELECT to_char(date_trunc('month', date), 'YYYY-MM') as month,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE user_id = $1
       AND ($2::date IS NULL OR date >= $2::date)
       AND ($3::date IS NULL OR date <= $3::date)
     GROUP BY 1
     ORDER BY 1`,
    [userId, start || null, end || null]
  );
  return result.rows;
}

export async function getExpenseByCategory(userId, { start, end } = {}) {
  const result = await query(
    `SELECT COALESCE(c.name,'Uncategorized') as category, SUM(t.amount)::float8 as total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1 AND t.type='expense'
       AND ($2::date IS NULL OR t.date >= $2::date)
       AND ($3::date IS NULL OR t.date <= $3::date)
     GROUP BY 1
     ORDER BY total DESC`,
    [userId, start || null, end || null]
  );
  return result.rows;
}


