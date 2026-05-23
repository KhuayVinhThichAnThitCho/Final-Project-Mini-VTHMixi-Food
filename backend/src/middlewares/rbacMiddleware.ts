import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../controllers/orderController';
import { UserRole } from '../models/User';
import { AppError } from './errorHandler';

/**
 * Middleware phân quyền (Role-Based Access Control)
 * Nhận vào danh sách các vai trò (roles) được phép truy cập
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const userRole = req.user.role as UserRole;

      // Kiểm tra xem vai trò của user có nằm trong danh sách được phép không
      if (!allowedRoles.includes(userRole)) {
        throw new AppError(
          403,
          'FORBIDDEN',
          `Bạn không có quyền truy cập. Yêu cầu một trong các vai trò: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
