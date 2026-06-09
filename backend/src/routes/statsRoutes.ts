import { Router } from 'express';
import { statsController } from '../controllers/statsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Áp dụng xác thực cho tất cả các API thống kê
router.use(authMiddleware);

// Thống kê dành cho chủ nhà hàng (Vendor & Admin): GET /api/v1/stats/vendor
router.get('/vendor', authorize(['vendor', 'admin']), statsController.getVendorStats);

// Thống kê dành cho quản trị viên hệ thống (Admin): GET /api/v1/stats/admin
router.get('/admin', authorize(['admin']), statsController.getAdminStats);

export default router;
