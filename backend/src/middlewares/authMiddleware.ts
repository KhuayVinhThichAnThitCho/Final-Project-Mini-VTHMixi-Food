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
          return next(new AppError(401, 'UNAUTHORIZED', user.banReason ? `Tài khoản đã bị khóa. Lý do: ${user.banReason}` : 'Tài khoản đã bị khóa.'));
        }

        // Kiểm tra xem nếu người dùng là vendor và cửa hàng của họ bị cấm (banned)
        if (user.role === 'vendor') {
          const { Restaurant } = await import('../models/Restaurant');
          const restaurant = await Restaurant.findOne({ where: { ownerId: user.id } });
          if (restaurant && restaurant.status === 'banned') {
            if (req.method !== 'GET') {
              return next(new AppError(403, 'FORBIDDEN', 'Cửa hàng của bạn đã bị cấm bởi quản trị viên. Không thể thực hiện thao tác này.'));
            }
          }
        }

        req.user = { 
          id: user.id, 
          email: user.email, 
          role: user.role
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
