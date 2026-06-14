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
      const { id } = req.params;
      const { status, reason } = req.body;

      const validStatuses = ['pending', 'open', 'closed', 'banned'];
      if (!validStatuses.includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      }

      const data = await adminService.updateVendorStatus(id, status, reason);
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
   * Xóa vĩnh viễn sản phẩm vi phạm
   */
  permanentDeleteProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await adminService.permanentDeleteProduct(id);
      res.status(200).json({
        success: true,
        message: 'Đã xóa vĩnh viễn sản phẩm.',
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
      const { id } = req.params;
      const { hide } = req.body;

      const data = await adminService.toggleProductVisibility(id, hide === true || hide === 'true');
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

  // ============================================================
  // A-05: BÁO CÁO DOANH THU
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
};

export default adminController;
