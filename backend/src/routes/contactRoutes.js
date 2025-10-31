import { Router } from 'express';
const router = Router();
router.post('/', (req, res) => {
  // For demo: accept and return success; in production you might email/store
  res.status(201).json({ success: true });
});
export default router;


