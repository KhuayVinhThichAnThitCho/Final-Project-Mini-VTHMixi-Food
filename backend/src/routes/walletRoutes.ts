import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Tất cả route ví cần đăng nhập
router.use(authMiddleware);

// GET /api/v1/wallet/balance: Lấy số dư ví
router.get('/balance', walletController.getBalance);

// POST /api/v1/wallet/deposit: Nạp tiền vào ví
router.post('/deposit', walletController.deposit);

export default router;
