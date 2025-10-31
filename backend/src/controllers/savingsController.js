import { computeAndStoreDailySnapshot, listSavings } from '../models/savingsModel.js';

export async function snapshot(req, res, next) {
  try {
    const data = await computeAndStoreDailySnapshot(req.user.id);
    res.status(201).json({ snapshot: data });
  } catch (e) { next(e); }
}

export async function getHistory(req, res, next) {
  try {
    const rows = await listSavings(req.user.id);
    res.json({ savings: rows });
  } catch (e) { next(e); }
}


