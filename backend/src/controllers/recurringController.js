import { createRecurring, listRecurring, deleteRecurring, applyRecurringUpToToday } from '../models/recurringModel.js';

export async function getAll(req, res, next) {
  try { const rows = await listRecurring(req.user.id); res.json({ recurring: rows }); }
  catch (e) { next(e); }
}

export async function createOne(req, res, next) {
  try {
    const { categoryId, type, amount, note, day_of_month } = req.body;
    const created = await createRecurring(req.user.id, { categoryId, type, amount: Number(amount), note, day_of_month: Number(day_of_month) });
    res.status(201).json({ recurring: created });
  } catch (e) { next(e); }
}

export async function removeOne(req, res, next) {
  try { const ok = await deleteRecurring(req.user.id, req.params.id); if (!ok) { res.status(404); throw new Error('Recurring not found'); } res.json({ success: true }); }
  catch (e) { next(e); }
}

export async function applyNow(req, res, next) {
  try { const applied = await applyRecurringUpToToday(req.user.id); res.json({ applied }); }
  catch (e) { next(e); }
}


