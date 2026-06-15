import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Wallet } from '../models/Wallet';
import { AppError } from '../middlewares/errorHandler';

// ============================================================
// A-01: QUẢN LÝ USER
// ============================================================

export const adminService = {
  /**
   * A-01: Lấy danh sách tất cả user hệ thống (có phân trang, lọc)
   */
  getAllUsers: async (options: {
    role?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { role, search, status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * A-01: Lấy chi tiết user + lịch sử đơn hàng
   */
  getUserDetail: async (userId: string) => {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
      include: [
        {
          model: Order,
          as: 'orders',
          include: [
            { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
          ],
          order: [['createdAt', 'DESC']],
          limit: 20,
        },
      ],
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    }

    return user;
  },

  /**
   * A-01: Khóa / Mở khóa tài khoản user
   */
  updateUserStatus: async (userId: string, status: 'active' | 'banned', adminId: string) => {
    if (userId === adminId) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Không thể tự khóa tài khoản của chính mình.');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    }

    if (user.role === 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Không thể thay đổi trạng thái tài khoản Admin khác.');
    }

    await user.update({ status });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  },

  // ============================================================
  // A-02: QUẢN LÝ VENDOR (TOÀN QUYỀN)
  // ============================================================

  /**
   * A-02: Lấy danh sách tất cả vendor (có phân trang, lọc)
   */
  getAllVendors: async (options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { search, status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const restaurantWhere: any = {};
    if (status) restaurantWhere.status = status;
    if (search) {
      restaurantWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Restaurant.findAndCountAll({
      where: restaurantWhere,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      vendors: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * A-02: Lấy chi tiết vendor - doanh thu + đơn hàng
   */
  getVendorDetail: async (restaurantId: string) => {
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
          include: [{ model: Wallet, as: 'wallet' }],
        },
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng.');
    }

    // Thống kê đơn hàng
    const orderStats = await Order.findAll({
      where: { restaurantId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
      group: ['status'],
    });

    return { restaurant, orderStats };
  },

  /**
   * A-02: Override trạng thái nhà hàng (Admin có thể approve/reject/ban)
   */
  updateVendorStatus: async (
    restaurantId: string,
    status: 'pending' | 'open' | 'closed' | 'banned',
    reason?: string
  ) => {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng.');
    }

    await restaurant.update({ status });

    return {
      id: restaurant.id,
      name: restaurant.name,
      status: restaurant.status,
      reason: reason || null,
    };
  },

  // ============================================================
  // A-03: QUẢN LÝ SẢN PHẨM
  // ============================================================

  /**
   * A-03: Lấy toàn bộ sản phẩm trên nền tảng (kể cả đã soft-delete)
   */
  getAllProducts: async (options: {
    search?: string;
    restaurantId?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const { search, restaurantId, includeDeleted = false, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (!includeDeleted) where.isDeleted = false;
    if (restaurantId) where.restaurantId = restaurantId;
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await MenuItem.findAndCountAll({
      where,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * A-03: Xóa vĩnh viễn sản phẩm vi phạm (Hard Delete)
   */
  permanentDeleteProduct: async (menuItemId: string) => {
    const item = await MenuItem.findByPk(menuItemId);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }

    await item.destroy();

    return { deleted: true, id: menuItemId };
  },

  /**
   * A-03: Ẩn / Hiện sản phẩm (Soft hide via isDeleted flag)
   */
  toggleProductVisibility: async (menuItemId: string, hide: boolean) => {
    const item = await MenuItem.findByPk(menuItemId);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }

    await item.update({ isDeleted: hide });

    return {
      id: item.id,
      name: item.name,
      isDeleted: item.isDeleted,
    };
  },

  // ============================================================
  // A-04: QUẢN LÝ ĐƠN HÀNG TOÀN HỆ THỐNG
  // ============================================================

  /**
   * A-04: Lấy toàn bộ đơn hàng hệ thống (có phân trang, lọc)
   */
  getAllOrders: async (options: {
    userId?: string;
    restaurantId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const { userId, restaurantId, status, dateFrom, dateTo, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (restaurantId) where.restaurantId = restaurantId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * A-04: Lấy chi tiết một đơn hàng
   */
  getOrderDetail: async (orderId: string) => {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
    }

    return order;
  },

  /**
   * A-04: Admin can thiệp / override trạng thái đơn hàng (xử lý tranh chấp)
   * Admin có toàn quyền chuyển đơn về bất kỳ trạng thái nào
   */
  overrideOrderStatus: async (
    orderId: string,
    newStatus: string,
    reason: string,
    adminId: string
  ) => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
    }

    if (!reason || reason.trim().length < 5) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Lý do can thiệp phải có ít nhất 5 ký tự.');
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
    }

    const oldStatus = order.status;
    await order.update({ status: newStatus as any });

    return {
      id: order.id,
      oldStatus,
      newStatus,
      reason,
      overriddenBy: adminId,
      overriddenAt: new Date().toISOString(),
    };
  },


  /**
   * A-05: Thống kê tổng doanh thu theo period
   */
  getRevenueAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    let dateFormat: string;
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d %H:00:00';
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateFormat = '%Y-%m-%d';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateFormat = '%Y-%m';
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        dateFormat = '%Y-%m-%d';
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Doanh thu theo thời gian
    const revenueByTime = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startDate },
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'ASC']],
    });

    // Tổng doanh thu toàn hệ thống
    const totalRevenueResult = await Order.findOne({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
      ],
    });

    // Số liệu tổng quan
    const totalUsers = await User.count({ where: { role: 'user', status: 'active' } });
    const totalVendors = await Restaurant.count({ where: { status: { [Op.ne]: 'banned' } } });
    const pendingOrders = await Order.count({ where: { status: 'pending' } });

    return {
      period,
      revenueByTime,
      summary: {
        totalOrders: Number(totalRevenueResult?.getDataValue('totalOrders') || 0),
        totalRevenue: Number(totalRevenueResult?.getDataValue('totalRevenue') || 0),
        totalUsers,
        totalVendors,
        pendingOrders,
      },
    };
  },

  /**
   * A-05: Thống kê theo từng vendor (top doanh thu)
   */
  getVendorAnalytics: async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const vendorStats = await Order.findAll({
      where: { status: 'completed' },
      attributes: [
        'restaurantId',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'completedOrders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
      ],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'ratingAvg', 'status'],
        },
      ],
      group: ['restaurantId', 'restaurant.id'],
      order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
      limit,
      offset,
    });

    return vendorStats;
  },

  /**
   * A-05: Thống kê user (đăng ký mới, active)
   */
  getUserAnalytics: async () => {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const activeUsers = await User.count({ where: { role: 'user', status: 'active' } });
    const bannedUsers = await User.count({ where: { role: 'user', status: 'banned' } });
    const pendingUsers = await User.count({ where: { role: 'user', status: 'pending' } });

    // Users đăng ký trong 30 ngày gần nhất
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.count({
      where: {
        role: 'user',
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Users đăng ký theo ngày (7 ngày gần nhất)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const registrationsByDay = await User.findAll({
      where: {
        role: 'user',
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    });

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingUsers,
      newUsersLast30Days: newUsers,
      registrationsByDay,
    };
  },

  // ============================================================
  // A-06: CẤU HÌNH QUYỀN (RBAC)
  // ============================================================

  /**
   * A-06: Gán / Thay đổi role cho user
   */
  assignRole: async (userId: string, role: string, adminId: string) => {
    if (userId === adminId) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Không thể thay đổi role của chính mình.');
    }

    const validRoles = ['user', 'vendor', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Role không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    }

    await user.update({ role: role as any });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  // ============================================================
  // A-07: CẤU HÌNH HỆ THỐNG (System Config)
  // ============================================================

  /**
   * A-07: Lấy thông tin tổng quan Dashboard Admin
   */
  getDashboard: async () => {
    const [
      totalUsers,
      totalVendors,
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingVendors,
      revenueResult,
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Restaurant.count(),
      Order.count(),
      Order.count({ where: { status: 'completed' } }),
      Order.count({ where: { status: 'cancelled' } }),
      Restaurant.count({ where: { status: 'pending' } }),
      Order.findOne({
        where: { status: 'completed' },
        attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue']],
      }),
    ]);

    const totalRevenue = Number(revenueResult?.getDataValue('totalRevenue') || 0);

    // Đơn hàng mới nhất
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
      ],
    });

    // User đăng ký mới nhất
    const recentUsers = await User.findAll({
      where: { role: 'user' },
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'status', 'createdAt'],
    });

    return {
      stats: {
        totalUsers,
        totalVendors,
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingVendors,
        totalRevenue,
        completionRate:
          totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
      recentOrders,
      recentUsers,
    };
  },
};

export default adminService;
