import { Router } from 'express';
import { voucherController } from '../controllers/voucherController';

const router = Router();

// GET /api/v1/vouchers: Lấy danh sách mã giảm giá công khai
router.get('/', voucherController.getActiveVouchers);

export default router;
