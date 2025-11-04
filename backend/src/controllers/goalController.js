import { createGoal, updateGoal, listGoals, getGoalProgress, addContribution, listContributions } from '../models/goalModel.js';

export async function create(req, res, next) {
  try {
    const { name, target_amount, target_date } = req.body;
    if (!target_date) { res.status(400); throw new Error('target_date is required'); }
    const g = await createGoal(req.user.id, { name, target_amount: Number(target_amount), target_date });
    res.status(201).json({ goal: g });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const g = await updateGoal(req.user.id, id, req.body);
    if (!g) { res.status(404); throw new Error('Goal not found'); }
    res.json({ goal: g });
  } catch (e) { next(e); }
}

export async function list(req, res, next) {
  try { const gs = await listGoals(req.user.id); res.json({ goals: gs }); } catch (e) { next(e); }
}

export async function progress(req, res, next) {
  try { const p = await getGoalProgress(req.user.id); res.json({ progress: p }); } catch (e) { next(e); }
}

export async function contribute(req, res, next) {
  try {
    const { goal_id, amount, date } = req.body;
    const c = await addContribution(req.user.id, { goal_id, amount: Number(amount), date });
    res.status(201).json({ contribution: c });
  } catch (e) { next(e); }
}

export async function contributions(req, res, next) {
  try {
    const items = await listContributions(req.user.id);
    res.json({ contributions: items });
  } catch (e) { next(e); }
}


