import { Router } from 'express';
import { managerController } from '../controllers/managerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Tất cả các route dưới đây yêu cầu đăng nhập và có role là manager hoặc admin
router.use(authMiddleware, authorize(['manager', 'admin']));

router.get('/stats', managerController.getDashboard);
router.get('/restaurants/pending', managerController.getPendingRestaurants);
router.post('/restaurants/:id/approve', managerController.approveRestaurant);
router.patch('/users/:id/status', managerController.updateUserStatus);

export default router;
