import { isNonEmptyString } from '../utils/validate.js';
import { listCategories, createCategory, deleteCategory } from '../models/categoryModel.js';

export async function getAll(req, res, next) {
  try {
    const rows = await listCategories(req.user.id);
    res.json({ categories: rows });
  } catch (e) { next(e); }
}

export async function createOne(req, res, next) {
  try {
    const { name } = req.body;
    if (!isNonEmptyString(name)) { res.status(400); throw new Error('Invalid name'); }
    const cat = await createCategory(req.user.id, name.trim());
    res.status(201).json({ category: cat });
  } catch (e) { next(e); }
}

export async function removeOne(req, res, next) {
  try {
    const ok = await deleteCategory(req.user.id, req.params.id);
    if (!ok) { res.status(404); throw new Error('Category not found'); }
    res.json({ success: true });
  } catch (e) { next(e); }
}


