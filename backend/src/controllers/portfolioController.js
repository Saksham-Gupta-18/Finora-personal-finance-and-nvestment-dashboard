import { isNonEmptyString, isPositiveNumber } from '../utils/validate.js';
import { listAssets, createAsset, updateAsset, deleteAsset, portfolioSummary } from '../models/portfolioModel.js';

export async function getAll(req, res, next) {
  try {
    const items = await listAssets(req.user.id);
    const summary = await portfolioSummary(req.user.id);
    res.json({ assets: items, summary });
  } catch (e) { next(e); }
}

export async function createOne(req, res, next) {
  try {
    const { asset_name, type, quantity, buy_price, current_price } = req.body;
    if (!isNonEmptyString(asset_name) || !isNonEmptyString(type)) { res.status(400); throw new Error('Invalid asset'); }
    const q = Number(quantity), bp = Number(buy_price), cp = Number(current_price);
    if (![q, bp, cp].every(isFinite) || q < 0 || bp < 0 || cp < 0) { res.status(400); throw new Error('Invalid numeric values'); }
    const created = await createAsset(req.user.id, { asset_name, type, quantity: q, buy_price: bp, current_price: cp });
    res.status(201).json({ asset: created });
  } catch (e) { next(e); }
}

export async function updateOne(req, res, next) {
  try {
    const updated = await updateAsset(req.user.id, req.params.id, req.body);
    if (!updated) { res.status(404); throw new Error('Asset not found'); }
    res.json({ asset: updated });
  } catch (e) { next(e); }
}

export async function removeOne(req, res, next) {
  try {
    const ok = await deleteAsset(req.user.id, req.params.id);
    if (!ok) { res.status(404); throw new Error('Asset not found'); }
    res.json({ success: true });
  } catch (e) { next(e); }
}


