import { query } from '../config/db.js';

export async function listCategories(userId) {
  const result = await query(
    `SELECT id, name, created_at, updated_at FROM categories WHERE user_id = $1 ORDER BY name ASC`,
    [userId]
  );
  return result.rows;
}

export async function createCategory(userId, name) {
  const result = await query(
    `INSERT INTO categories (user_id, name) VALUES ($1, $2)
     ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, created_at, updated_at`,
    [userId, name]
  );
  return result.rows[0];
}

export async function deleteCategory(userId, id) {
  const result = await query(
    `DELETE FROM categories WHERE user_id = $1 AND id = $2`,
    [userId, id]
  );
  return result.rowCount > 0;
}


