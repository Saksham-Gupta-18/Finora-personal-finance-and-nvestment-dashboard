import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { setBudget, progress } from '../controllers/budgetController.js';

const router = Router();
router.use(requireAuth);
router.post('/', setBudget);
router.get('/progress', progress);
export default router;


