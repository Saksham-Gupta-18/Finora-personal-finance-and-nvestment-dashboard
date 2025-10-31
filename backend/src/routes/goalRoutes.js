import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { create, update, list, progress, contribute } from '../controllers/goalController.js';

const router = Router();
router.use(requireAuth);
router.post('/', create);
router.put('/:id', update);
router.get('/', list);
router.get('/progress', progress);
router.post('/contribute', contribute);
export default router;


