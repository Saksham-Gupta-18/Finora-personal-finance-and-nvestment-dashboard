import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createOne, listAll, getOne, updateOne, removeOne, stats } from '../controllers/transactionController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listAll);
router.post('/', createOne);
router.get('/:id', getOne);
router.put('/:id', updateOne);
router.delete('/:id', removeOne);
router.get('/stats/summary', stats);

export default router;


