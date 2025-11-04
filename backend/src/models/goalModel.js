import { query } from '../config/db.js';

export async function createGoal(userId, { name, target_amount, target_date }) {
  const result = await query(
    `INSERT INTO savings_goals (user_id, name, target_amount, target_date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, target_amount, target_date, created_at, updated_at`,
    [userId, name || 'Goal', target_amount, target_date]
  );
  return result.rows[0];
}

export async function updateGoal(userId, id, { name, target_amount, target_date }) {
  const result = await query(
    `UPDATE savings_goals SET
       name = COALESCE($3, name),
       target_amount = COALESCE($4, target_amount),
       target_date = COALESCE($5, target_date),
       updated_at = NOW()
     WHERE user_id=$1 AND id=$2
     RETURNING id, name, target_amount, target_date, created_at, updated_at`,
    [userId, id, name, target_amount, target_date]
  );
  return result.rows[0] || null;
}

export async function listGoals(userId) {
  const res = await query(`SELECT id, name, target_amount, target_date, created_at, updated_at FROM savings_goals WHERE user_id=$1 ORDER BY created_at DESC`, [userId]);
  return res.rows;
}

export async function addContribution(userId, { goal_id, amount, date }) {
  const result = await query(
    `INSERT INTO savings_contributions (user_id, goal_id, amount, date)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
     RETURNING id, goal_id, amount, date, created_at`,
    [userId, goal_id, amount, date]
  );
  return result.rows[0];
}

export async function getGoalProgress(userId) {
  const res = await query(
    `SELECT g.id, g.name, g.target_amount::float8, g.target_date,
            COALESCE((SELECT SUM(c.amount) FROM savings_contributions c WHERE c.user_id=g.user_id AND c.goal_id=g.id),0)::float8 as contributed
     FROM savings_goals g WHERE g.user_id=$1 ORDER BY g.created_at DESC`,
    [userId]
  );
  return res.rows.map(r => ({
    id: r.id,
    name: r.name,
    target_amount: Number(r.target_amount),
    target_date: r.target_date,
    current_savings: Number(r.contributed),
    progress: r.target_amount > 0 ? Math.min(100, (Number(r.contributed)/Number(r.target_amount))*100) : 0
  }));
}

export async function listContributions(userId) {
  const res = await query(
    `SELECT goal_id, amount::float8 AS amount, date::date AS date
     FROM savings_contributions
     WHERE user_id=$1
     ORDER BY date ASC, created_at ASC`,
    [userId]
  );
  return res.rows;
}


