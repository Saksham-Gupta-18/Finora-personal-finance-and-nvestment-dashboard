import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAll, createOne, removeOne, applyNow } from '../controllers/recurringController.js';

const router = Router();
router.use(requireAuth);
router.get('/', getAll);
router.post('/', createOne);
router.delete('/:id', removeOne);
router.post('/apply', applyNow);
export default router;


