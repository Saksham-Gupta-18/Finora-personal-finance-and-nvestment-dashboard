import { query } from '../config/db.js';

export async function listAssets(userId) {
  const result = await query(
    `SELECT id, asset_name, type, quantity, buy_price, current_price, created_at, updated_at
     FROM portfolio WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function createAsset(userId, asset) {
  const { asset_name, type, quantity, buy_price, current_price } = asset;
  const result = await query(
    `INSERT INTO portfolio (user_id, asset_name, type, quantity, buy_price, current_price)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, asset_name, type, quantity, buy_price, current_price, created_at, updated_at`,
    [userId, asset_name, type, quantity, buy_price, current_price]
  );
  return result.rows[0];
}

export async function updateAsset(userId, id, asset) {
  const { asset_name, type, quantity, buy_price, current_price } = asset;
  const result = await query(
    `UPDATE portfolio
     SET asset_name = COALESCE($3, asset_name),
         type = COALESCE($4, type),
         quantity = COALESCE($5, quantity),
         buy_price = COALESCE($6, buy_price),
         current_price = COALESCE($7, current_price),
         updated_at = NOW()
     WHERE user_id = $1 AND id = $2
     RETURNING id, asset_name, type, quantity, buy_price, current_price, created_at, updated_at`,
    [userId, id, asset_name, type, quantity, buy_price, current_price]
  );
  return result.rows[0] || null;
}

export async function deleteAsset(userId, id) {
  const result = await query(
    `DELETE FROM portfolio WHERE user_id = $1 AND id = $2`,
    [userId, id]
  );
  return result.rowCount > 0;
}

export async function portfolioSummary(userId) {
  const result = await query(
    `SELECT COALESCE(SUM(quantity * current_price),0) as portfolio_value
     FROM portfolio WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}


