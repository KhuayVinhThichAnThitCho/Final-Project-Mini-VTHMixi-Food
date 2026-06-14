import { Router } from 'express';
import { voucherController } from '../controllers/voucherController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// GET /api/v1/vouchers: Lấy danh sách mã giảm giá công khai
router.get('/', voucherController.getActiveVouchers);

// GET /api/v1/vouchers/mine: Lấy tất cả vouchers của quán (kể cả hết hạn)
router.get('/mine', authMiddleware, authorize(['vendor', 'admin']), voucherController.getMyVouchers);

// POST /api/v1/vouchers/mine: Tạo mã giảm giá mới
router.post('/mine', authMiddleware, authorize(['vendor', 'admin']), voucherController.createVoucher);

// DELETE /api/v1/vouchers/mine/:id: Vô hiệu hóa mã giảm giá
router.delete('/mine/:id', authMiddleware, authorize(['vendor', 'admin']), voucherController.deleteVoucher);

export default router;
