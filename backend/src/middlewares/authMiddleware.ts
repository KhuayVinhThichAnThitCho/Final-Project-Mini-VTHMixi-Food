import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../controllers/orderController';
import { AppError } from './errorHandler';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123456';

/**
 * Middleware kiểm tra Access Token JWT của người dùng
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để truy cập tài nguyên này.');
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // Nếu token hết hạn, client có thể sử dụng Refresh Token để lấy token mới
        if (err.name === 'TokenExpiredError') {
          throw new AppError(401, 'UNAUTHORIZED', 'Mã xác thực đã hết hạn.');
        }
        throw new AppError(401, 'UNAUTHORIZED', 'Mã xác thực không hợp lệ.');
      }

      // Đính kèm thông tin user đã giải mã vào request
      req.user = decoded as { id: string; email: string; role: string };
      next();
    });
  } catch (error) {
    next(error);
  }
};
