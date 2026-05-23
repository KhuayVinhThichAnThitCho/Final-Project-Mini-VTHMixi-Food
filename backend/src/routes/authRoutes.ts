import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Route Đăng ký: POST /api/v1/auth/register
router.post('/register', authController.register);

// Route Đăng nhập: POST /api/v1/auth/login
router.post('/login', authController.login);

export default router;
