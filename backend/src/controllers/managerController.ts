import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { managerService } from '../services/managerService';
import { AppError } from '../middlewares/errorHandler';

export const managerController = {
  getDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const data = await managerService.getDashboardStats(region);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getPendingRestaurants: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const data = await managerService.getPendingRestaurants(region);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  approveRestaurant: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const { id } = req.params;
      const data = await managerService.approveRestaurant(id, region);
      res.status(200).json({ success: true, message: 'Đã duyệt nhà hàng thành công', data });
    } catch (error) {
      next(error);
    }
  },

  updateUserStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['active', 'banned'].includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, banned');
      }

      const data = await managerService.updateUserStatus(id, status, region);
      res.status(200).json({ 
        success: true, 
        message: status === 'banned' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.', 
        data 
      });
    } catch (error) {
      next(error);
    }
  }
};
