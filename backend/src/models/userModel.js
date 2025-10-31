import { query } from '../config/db.js';

export async function createUser({ name, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT id, name, email, password_hash, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, name, email, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateUserById(id, { name }) {
  const result = await query(
    `UPDATE users SET name = COALESCE($2, name), updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, created_at, updated_at`,
    [id, name]
  );
  return result.rows[0] || null;
}


