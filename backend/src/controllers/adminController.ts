import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { adminService } from '../services/adminService';
import { AppError } from '../middlewares/errorHandler';

export const adminController = {
  // ============================================================
  // DASHBOARD
  // ============================================================

  /**
   * GET /admin/dashboard
   * Lấy tổng quan Dashboard Admin
   */
  getDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // A-01: QUẢN LÝ USER
  // ============================================================

  /**
   * GET /admin/users
   * Danh sách user. Query: role, search, status, page, limit
   */
  getAllUsers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, search, status, page, limit } = req.query;
      const result = await adminService.getAllUsers({
        role: role as string,
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/users/:id
   * Lấy chi tiết user + lịch sử đơn hàng
   */
  getUserDetail: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await adminService.getUserDetail(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /admin/users/:id/status
   * Khóa/Mở khóa tài khoản user
   */
  updateUserStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'banned'].includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, banned');
      }

      const data = await adminService.updateUserStatus(id, status, req.user.id);
      res.status(200).json({
        success: true,
        message: status === 'banned' ? 'Đã khóa tài khoản người dùng.' : 'Đã mở khóa tài khoản người dùng.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /admin/users/:id/role
   * Gán role cho user
   */
  assignRole: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu trường role.');
      }

      const data = await adminService.assignRole(id, role, req.user.id);
      res.status(200).json({
        success: true,
        message: `Đã gán role "${role}" cho người dùng.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // A-02: QUẢN LÝ VENDOR
  // ============================================================

  /**
   * GET /admin/vendors
   * Danh sách tất cả vendor. Query: search, status, page, limit
   */
  getAllVendors: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, page, limit } = req.query;
      const result = await adminService.getAllVendors({
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/vendors/:id
   * Chi tiết vendor + doanh thu + đơn hàng
   */
  getVendorDetail: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await adminService.getVendorDetail(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /admin/vendors/:id/status
   * Admin override trạng thái nhà hàng (approve/reject/ban/close)
   */
  updateVendorStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { status, reason } = req.body;

      const validStatuses = ['pending', 'open', 'closed', 'banned'];
      if (!validStatuses.includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      }

      const data = await adminService.updateVendorStatus(id, status, reason, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái nhà hàng thành công.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // A-03: QUẢN LÝ SẢN PHẨM
  // ============================================================

  /**
   * GET /admin/products
   * Toàn bộ sản phẩm trên nền tảng. Query: search, restaurantId, includeDeleted, page, limit
   */
  getAllProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, restaurantId, includeDeleted, page, limit } = req.query;
      const result = await adminService.getAllProducts({
        search: search as string,
        restaurantId: restaurantId as string,
        includeDeleted: includeDeleted === 'true',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /admin/products/:id
   * Xóa mềm sản phẩm vi phạm (ẩn khỏi khách hàng)
   */
  permanentDeleteProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const data = await adminService.permanentDeleteProduct(id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Đã xóa (ẩn) sản phẩm thành công.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /admin/products/:id/hide
   * Ẩn hoặc hiện sản phẩm
   */
  toggleProductVisibility: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { hide } = req.body;

      const data = await adminService.toggleProductVisibility(id, hide === true || hide === 'true', req.user.id);
      res.status(200).json({
        success: true,
        message: hide ? 'Đã ẩn sản phẩm.' : 'Đã hiện sản phẩm.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // A-04: QUẢN LÝ ĐƠN HÀNG
  // ============================================================

  /**
   * GET /admin/orders
   * Toàn bộ đơn hàng hệ thống. Query: userId, restaurantId, status, dateFrom, dateTo, page, limit
   */
  getAllOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, restaurantId, status, dateFrom, dateTo, page, limit } = req.query;
      const result = await adminService.getAllOrders({
        userId: userId as string,
        restaurantId: restaurantId as string,
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/orders/:id
   * Chi tiết một đơn hàng
   */
  getOrderDetail: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await adminService.getOrderDetail(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /admin/orders/:id/status
   * Admin can thiệp / override trạng thái đơn hàng — xử lý tranh chấp
   */
  overrideOrderStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu trường status.');
      }
      if (!reason) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Phải nhập lý do can thiệp.');
      }

      const data = await adminService.overrideOrderStatus(id, status, reason, req.user.id);
      res.status(200).json({
        success: true,
        message: `Đã chuyển trạng thái đơn hàng từ "${data.oldStatus}" sang "${data.newStatus}".`,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================

  /**
   * GET /admin/analytics/revenue?period=month
   * Doanh thu toàn nền tảng theo period (day/week/month/year)
   */
  getRevenueAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      const data = await adminService.getRevenueAnalytics(period);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/analytics/vendors?page=1&limit=10
   * Thống kê theo vendor: top doanh thu
   */
  getVendorAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const data = await adminService.getVendorAnalytics(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/analytics/users
   * Thống kê user: đăng ký mới, active users
   */
  getUserAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminService.getUserAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // A-07: CẤU HÌNH HỆ THỐNG
  // ============================================================

  /**
   * GET /admin/settings
   * Lấy toàn bộ cấu hình hệ thống
   */
  getSystemConfigs: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminService.getSystemConfigs();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /admin/settings/:key
   * Cập nhật một config theo key
   */
  updateSystemConfig: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { key } = req.params;
      const { value } = req.body;
      if (value === undefined) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu trường value.');
      }
      const data = await adminService.updateSystemConfig(key, value, req.user.id);
      res.status(200).json({ success: true, message: `Đã cập nhật cấu hình "${key}".`, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /admin/settings/batch
   * Cập nhật nhiều config cùng lúc
   */
  batchUpdateConfigs: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { updates } = req.body;
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu danh sách updates.');
      }
      const data = await adminService.batchUpdateConfigs(updates, req.user.id);
      res.status(200).json({ success: true, message: `Đã cập nhật ${updates.length} cấu hình.`, data });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================
  // LỊCH SỬ HOẠT ĐỘNG
  // ============================================================

  /**
   * GET /admin/activity-logs
   * Lấy danh sách lịch sử hoạt động Admin
   */
  getActivityLogs: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action, adminId, dateFrom, dateTo, page, limit } = req.query;
      const result = await adminService.getActivityLogs({
        action: action as string,
        adminId: adminId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};

export default adminController;
