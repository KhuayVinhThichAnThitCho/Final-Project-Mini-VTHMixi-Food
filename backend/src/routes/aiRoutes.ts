import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Route cho Copilot (Chỉ dành cho Vendor)
router.use(authMiddleware, authorize(['vendor']));
router.get('/copilot/history', aiController.getHistory);
router.post('/copilot/ask', aiController.askCopilot);

export default router;
