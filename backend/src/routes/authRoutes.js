import { Router } from 'express';
import { signIn, signUp, getProfile, updateProfile, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

export default router;


