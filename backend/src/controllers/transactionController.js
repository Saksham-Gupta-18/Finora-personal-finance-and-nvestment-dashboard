import { isPositiveNumber, isValidTransactionType, isNonEmptyString } from '../utils/validate.js';
import {
  createTransaction,
  getTransactionsByUser,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
  getStats,
  getMonthlyIncomeExpense,
  getExpenseByCategory
} from '../models/transactionModel.js';

export async function createOne(req, res, next) {
  try {
    const { type, amount, categoryId, note, date, goal_id } = req.body;
    if (!isValidTransactionType(type) || !isPositiveNumber(Number(amount))) {
      res.status(400);
      throw new Error('Invalid type or amount');
    }
    if (type === 'saving' && !goal_id) {
      res.status(400);
      throw new Error('Goal is required for saving');
    }
    let finalNote = isNonEmptyString(note) ? note : '';
    // optional goal tagging for savings
    if (type === 'saving' && goal_id) {
      try {
        const { listGoals, addContribution } = await import('../models/goalModel.js');
        const goals = await listGoals(req.user.id);
        const g = goals.find(x => String(x.id) === String(goal_id));
        if (g) {
          finalNote = `${finalNote ? finalNote + ' ' : ''}saved_to:${g.name}`;
        }
        await addContribution(req.user.id, { goal_id: Number(goal_id), amount: Number(amount), date });
      } catch (_) {}
    }
    const tx = await createTransaction({
      userId: req.user.id,
      type,
      amount: Number(amount),
      categoryId: type === 'saving' ? null : (categoryId ? Number(categoryId) : null),
      note: finalNote,
      date
    });
    res.status(201).json({ transaction: tx });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req, res, next) {
  try {
    const { start, end } = req.query;
    const items = await getTransactionsByUser(req.user.id, { start, end });
    const stats = await getStats(req.user.id, { start, end });
    res.json({ transactions: items, stats });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const item = await getTransactionById(req.user.id, req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    res.json({ transaction: item });
  } catch (err) {
    next(err);
  }
}

export async function updateOne(req, res, next) {
  try {
    const { type, amount, categoryId, note, date } = req.body;
    const updated = await updateTransactionById(req.user.id, req.params.id, {
      type,
      amount: typeof amount !== 'undefined' ? Number(amount) : undefined,
      categoryId,
      note,
      date
    });
    if (!updated) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    res.json({ transaction: updated });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const { start, end } = req.query;
    const totals = await getStats(req.user.id, { start, end });
    const monthly = await getMonthlyIncomeExpense(req.user.id, { start, end });
    const byCategory = await getExpenseByCategory(req.user.id, { start, end });
    const { getSavingByCategory } = await import('../models/transactionModel.js');
    const bySaving = await getSavingByCategory(req.user.id, { start, end });
    res.json({ totals, monthly, byCategory, bySaving });
  } catch (e) { next(e); }
}

export async function removeOne(req, res, next) {
  try {
    const ok = await deleteTransactionById(req.user.id, req.params.id);
    if (!ok) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


