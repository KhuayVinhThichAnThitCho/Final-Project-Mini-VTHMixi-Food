import { Router } from 'express';
import { managerController } from '../controllers/managerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Tất cả các route dưới đây yêu cầu đăng nhập và có role là manager hoặc admin
router.use(authMiddleware, authorize(['manager', 'admin']));

router.get('/stats', managerController.getDashboard);

// M-01: Quản lý Vendor
router.get('/restaurants/pending', managerController.getPendingRestaurants);
router.post('/restaurants/:id/approve', managerController.approveRestaurant);
router.post('/restaurants/:id/reject', managerController.rejectRestaurant);
router.get('/vendors', managerController.getAllVendors);
router.patch('/users/:id/status', managerController.updateUserStatus);

// M-02: Quản lý Sản phẩm
router.get('/products', managerController.getAllProducts);
router.patch('/products/:id/status', managerController.updateProductStatus);

// M-03: Xử lý Báo cáo
router.get('/reports', managerController.getReports);
router.patch('/reports/:id/resolve', managerController.resolveReport);

// M-04: Xử lý Rút tiền
router.get('/withdrawals', managerController.getWithdrawals);
router.patch('/withdrawals/:id/process', managerController.processWithdrawal);

export default router;
