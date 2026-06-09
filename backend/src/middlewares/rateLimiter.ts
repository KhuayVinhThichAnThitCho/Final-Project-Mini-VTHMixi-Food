import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

/**
 * Cấu hình Rate Limiter chung cho toàn bộ API hệ thống
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Khung thời gian: 15 phút
  max: 100, // Tối đa 100 requests từ 1 địa chỉ IP trong 15 phút
  standardHeaders: true, // Trả về thông tin giới hạn trong headers `RateLimit-*`
  legacyHeaders: false, // Tắt headers `X-RateLimit-*` truyền thống
  handler: (req, res, next) => {
    // Ném lỗi chuẩn hóa qua global errorHandler
    next(new AppError(429, 'BUSINESS_ERROR', 'Bạn đã gửi quá nhiều yêu cầu lên hệ thống. Vui lòng thử lại sau 15 phút.'));
  },
});

/**
 * Cấu hình Rate Limiter chuyên biệt bảo vệ các API nhạy cảm dễ bị brute force / spam
 * (Đăng ký, gửi OTP kích hoạt qua mail, đổi mật khẩu)
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Khung thời gian: 1 phút
  max: 5, // Tối đa 5 lần gửi OTP hoặc cố gắng đăng nhập từ 1 IP trong 1 phút
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(429, 'BUSINESS_ERROR', 'Tần suất gửi yêu cầu quá nhanh. Vui lòng đợi 1 phút trước khi thử lại.'));
  },
});
