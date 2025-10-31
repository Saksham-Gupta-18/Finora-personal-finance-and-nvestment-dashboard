import { setMonthlyBudget, getBudgetProgress } from '../models/budgetModel.js';

export async function setBudget(req, res, next) {
  try {
    const { month, limit_amount } = req.body; // month format YYYY-MM
    const saved = await setMonthlyBudget(req.user.id, month, Number(limit_amount));
    res.status(201).json({ budget: saved });
  } catch (e) { next(e); }
}

export async function progress(req, res, next) {
  try {
    const { month } = req.query;
    const data = await getBudgetProgress(req.user.id, month);
    res.json({ progress: data });
  } catch (e) { next(e); }
}


