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
    const { type, amount, categoryId, note, date, goal_id, add_to_savings } = req.body;
    if (!isValidTransactionType(type) || !isPositiveNumber(Number(amount))) {
      res.status(400);
      throw new Error('Invalid type or amount');
    }
    let finalNote = isNonEmptyString(note) ? note : '';
    // optional savings contribution
    if (add_to_savings && goal_id) {
      try {
        const { addContribution, listGoals } = await import('../models/goalModel.js');
        await addContribution(req.user.id, { goal_id: Number(goal_id), amount: Number(amount), date });
        // fetch goal name to tag the transaction note so frontend can display category
        const goals = await listGoals(req.user.id);
        const g = goals.find(x => String(x.id) === String(goal_id));
        if (g) {
          finalNote = `${finalNote ? finalNote + ' ' : ''}saved_to:${g.name}`;
        }
      } catch (_) {}
    }
    const tx = await createTransaction({
      userId: req.user.id,
      type,
      amount: Number(amount),
      categoryId: categoryId ? Number(categoryId) : null,
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
    const items = await getTransactionsByUser(req.user.id);
    const stats = await getStats(req.user.id);
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
    const totals = await getStats(req.user.id);
    const monthly = await getMonthlyIncomeExpense(req.user.id, { start, end });
    const byCategory = await getExpenseByCategory(req.user.id, { start, end });
    res.json({ totals, monthly, byCategory });
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


