import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Bắt buộc đăng nhập
router.use(authMiddleware);

// Route cho Copilot (Chỉ dành cho Vendor)
router.get('/copilot/history', authorize(['vendor']), aiController.getHistory);
router.post('/copilot/ask', authorize(['vendor']), aiController.askCopilot);

// Route cho Smart Cart (Chỉ dành cho Customer)
router.get('/customer/history', authorize(['user']), aiController.getCustomerHistory);
router.post('/customer/ask', authorize(['user']), aiController.askCustomerAssistant);

export default router;
