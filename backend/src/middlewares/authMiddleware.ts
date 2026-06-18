import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../controllers/orderController';
import { AppError } from './errorHandler';
import { User } from '../models/User';

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
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        // Nếu token hết hạn, client có thể sử dụng Refresh Token để lấy token mới
        if (err.name === 'TokenExpiredError') {
          return next(new AppError(401, 'UNAUTHORIZED', 'Mã xác thực đã hết hạn.'));
        }
        return next(new AppError(401, 'UNAUTHORIZED', 'Mã xác thực không hợp lệ.'));
      }

      try {
        const payload = decoded as { id: string; email: string; role: string };
        const user = await User.findByPk(payload.id);
        
        if (!user) {
          return next(new AppError(401, 'UNAUTHORIZED', 'Người dùng không tồn tại.'));
        }
        
        if (user.status === 'banned') {
          return next(new AppError(401, 'UNAUTHORIZED', 'Tài khoản đã bị khóa.'));
        }

        // Đính kèm thông tin user từ DB vào request
        req.user = { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          managedRegion: user.managedRegion
        };
        next();
      } catch (dbErr) {
        next(dbErr);
      }
    });
  } catch (error) {
    next(error);
  }
};
