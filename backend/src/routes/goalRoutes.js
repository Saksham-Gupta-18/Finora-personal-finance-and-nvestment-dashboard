import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { create, update, list, progress, contribute, contributions } from '../controllers/goalController.js';

const router = Router();
router.use(requireAuth);
router.post('/', create);
router.put('/:id', update);
router.get('/', list);
router.get('/progress', progress);
router.post('/contribute', contribute);
router.get('/contributions', contributions);
export default router;


