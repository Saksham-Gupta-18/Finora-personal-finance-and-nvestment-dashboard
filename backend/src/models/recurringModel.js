import { query } from '../config/db.js';

export async function createRecurring(userId, tpl) {
  const { categoryId, type, amount, note, day_of_month } = tpl;
  const result = await query(
    `INSERT INTO recurring_transactions (user_id, category_id, type, amount, note, day_of_month, last_applied_date)
     VALUES ($1, $2, $3, $4, COALESCE($5,''), $6, NULL)
     RETURNING id, user_id, category_id, type, amount, note, day_of_month, last_applied_date, created_at, updated_at`,
    [userId, categoryId, type, amount, note, day_of_month]
  );
  return result.rows[0];
}

export async function listRecurring(userId) {
  const result = await query(
    `SELECT id, category_id, type, amount, note, day_of_month, last_applied_date, created_at, updated_at
     FROM recurring_transactions WHERE user_id=$1 ORDER BY day_of_month`,
    [userId]
  );
  return result.rows;
}

export async function deleteRecurring(userId, id) {
  const res = await query(`DELETE FROM recurring_transactions WHERE user_id=$1 AND id=$2`, [userId, id]);
  return res.rowCount > 0;
}

export async function applyRecurringUpToToday(userId) {
  // For each template, insert missing months up to current month
  const { rows: templates } = await query(`SELECT * FROM recurring_transactions WHERE user_id=$1`, [userId]);
  const results = [];
  for (const t of templates) {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let last = t.last_applied_date ? new Date(t.last_applied_date) : null;
    let monthCursor = last ? new Date(last.getFullYear(), last.getMonth()+1, 1) : currentMonth; // if null, apply this month only
    const inserts = [];
    while (monthCursor <= currentMonth) {
      const day = Math.min(t.day_of_month, 28);
      const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
      inserts.push(query(
        `INSERT INTO transactions (user_id, category_id, type, amount, note, date)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [userId, t.category_id, t.type, t.amount, t.note, date.toISOString().slice(0,10)]
      ));
      monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth()+1, 1);
    }
    if (inserts.length) {
      await Promise.all(inserts);
      await query(`UPDATE recurring_transactions SET last_applied_date = CURRENT_DATE WHERE id=$1`, [t.id]);
      results.push({ templateId: t.id, applied: inserts.length });
    }
  }
  return results;
}


