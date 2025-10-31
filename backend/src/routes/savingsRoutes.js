import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { snapshot, getHistory } from '../controllers/savingsController.js';

const router = Router();
router.use(requireAuth);
router.post('/snapshot', snapshot);
router.get('/', getHistory);
export default router;


