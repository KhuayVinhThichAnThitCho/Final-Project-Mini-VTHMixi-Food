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

  getAllVendors: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const data = await managerService.getAllVendors(region);
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

  rejectRestaurant: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const { id } = req.params;
      const { reason } = req.body;
      const data = await managerService.rejectRestaurant(id, region, reason || '');
      res.status(200).json({ success: true, message: 'Đã từ chối nhà hàng thành công', data });
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
      const { status, reason } = req.body;
      
      if (!['active', 'banned'].includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, banned');
      }

      const data = await managerService.updateUserStatus(id, status, reason || '', region);
      res.status(200).json({ 
        success: true, 
        message: status === 'banned' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.', 
        data 
      });
    } catch (error) {
      next(error);
    }
  },

  getAllProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const data = await managerService.getAllProducts(region);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  updateProductStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const region = req.user.managedRegion || 'Hồ Chí Minh';
      const { id } = req.params;
      const { action, reason } = req.body; // hide, unhide, delete

      const data = await managerService.updateProductStatus(id, action, reason || '', region);
      res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái sản phẩm.', data });
    } catch (error) {
      next(error);
    }
  },

  getReports: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const data = await managerService.getReports();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  resolveReport: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const { id } = req.params;
      const { action, managerNote } = req.body; // resolved, rejected

      const data = await managerService.resolveReport(id, action, managerNote || '');
      res.status(200).json({ success: true, message: 'Đã xử lý báo cáo.', data });
    } catch (error) {
      next(error);
    }
  },

  getWithdrawals: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const data = await managerService.getWithdrawals();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  processWithdrawal: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !['manager', 'admin'].includes(req.user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
      }
      const { id } = req.params;
      const { action, reason } = req.body; // approved, rejected

      const data = await managerService.processWithdrawal(id, action, reason || '');
      res.status(200).json({ success: true, message: 'Đã xử lý yêu cầu rút tiền.', data });
    } catch (error) {
      next(error);
    }
  }
};
