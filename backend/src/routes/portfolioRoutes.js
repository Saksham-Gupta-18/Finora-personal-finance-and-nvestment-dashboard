import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAll, createOne, updateOne, removeOne } from '../controllers/portfolioController.js';

const router = Router();
router.use(requireAuth);
router.get('/', getAll);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', removeOne);
export default router;


