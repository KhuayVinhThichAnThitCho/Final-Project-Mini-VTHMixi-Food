import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Route Đăng ký: POST /api/v1/auth/register
router.post('/register', authController.register);

// Route Đăng nhập: POST /api/v1/auth/login
router.post('/login', authController.login);

// Route Quên mật khẩu: POST /api/v1/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// Route Đặt lại mật khẩu: POST /api/v1/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// Route Xác thực OTP đăng nhập: POST /api/v1/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

// Route Gửi lại mã OTP đăng nhập: POST /api/v1/auth/resend-otp
router.post('/resend-otp', authController.resendOtp);

export default router;
