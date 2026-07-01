import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Wallet } from '../models/Wallet';
import { SystemConfig } from '../models/SystemConfig';
import { AdminLog } from '../models/AdminLog';
import { AppError } from '../middlewares/errorHandler';
import { notificationService } from './notificationService';
import { reconciliationService } from './reconciliationService';
import orderService from './orderService';

// ============================================================
// HELPER: Ghi log hành động Admin
// ============================================================
const createAdminLog = async (data: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
  details?: any;
  ipAddress?: string;
}) => {
  try {
    await AdminLog.create({
      ...data,
      details: data.details ? JSON.stringify(data.details) : null,
    });
  } catch (error) {
    // Log lỗi nhưng không throw để không ảnh hưởng đến hành động chính
    console.error('⚠️ Lỗi ghi admin log:', error);
  }
};

// Helper: Xử lý lưu ảnh banner dạng base64
const processBannerBase64 = (key: string, value: any): any => {
  if (key === 'homepage_banner') {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'banners');

    const saveBase64 = (imageUrl: string, prefixId: string): string => {
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = imageUrl.split(';')[0].split('/')[1] || 'jpg';
        const filename = `banner_${prefixId}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        return `/uploads/banners/${filename}`;
      }
      return imageUrl;
    };

    if (Array.isArray(value)) {
      return value.map((banner, index) => {
        const id = banner.id || `b_${index}`;
        return {
          ...banner,
          imageUrl: saveBase64(banner.imageUrl, id),
        };
      });
    } else if (value && typeof value === 'object') {
      return {
        ...value,
        imageUrl: saveBase64(value.imageUrl, 'single'),
      };
    }
  }
  return value;
};

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
  updateUserStatus: async (userId: string, status: 'active' | 'banned', adminId: string, banReason?: string) => {
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

    const oldStatus = user.status;
    const updateData: any = { status };
    if (status === 'banned') {
      updateData.banReason = banReason || 'Không có lý do cụ thể';
    } else {
      updateData.banReason = null;
    }

    await user.update(updateData);

    // Gửi thông báo email và realtime cho người dùng
    try {
      if (status === 'banned') {
        await notificationService.sendSystemNotification(
          user.id,
          user.email,
          'Tài khoản của bạn đã bị khóa',
          `Tài khoản của bạn trên hệ thống đã bị khóa bởi Quản trị viên. Lý do: ${updateData.banReason}`
        );
      } else {
        await notificationService.sendSystemNotification(
          user.id,
          user.email,
          'Tài khoản của bạn đã được mở khóa',
          `Tài khoản của bạn trên hệ thống đã được mở khóa bởi Quản trị viên. Bạn hiện có thể đăng nhập và sử dụng dịch vụ.`
        );
      }
    } catch (notifError) {
      console.error('⚠️ Lỗi gửi thông báo đổi trạng thái user:', notifError);
    }

    // Ghi log
    await createAdminLog({
      adminId,
      action: 'USER_STATUS_CHANGE',
      targetType: 'user',
      targetId: userId,
      description: `${status === 'banned' ? 'Khóa' : 'Mở khóa'} tài khoản "${user.name}" (${user.email})${status === 'banned' ? ` - Lý do: ${updateData.banReason}` : ''}`,
      details: { oldStatus, newStatus: status, userName: user.name, userEmail: user.email, banReason: updateData.banReason },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      banReason: user.banReason,
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
    reason?: string,
    adminId?: string
  ) => {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng.');
    }

    const oldStatus = restaurant.status;
    await restaurant.update({ status });

    // Ghi log
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'VENDOR_STATUS_CHANGE',
        targetType: 'restaurant',
        targetId: restaurantId,
        description: `Chuyển trạng thái nhà hàng "${restaurant.name}" từ "${oldStatus}" sang "${status}"${reason ? ` — Lý do: ${reason}` : ''}`,
        details: { oldStatus, newStatus: status, restaurantName: restaurant.name, reason },
      });
    }

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

    // Luôn lọc bỏ sản phẩm đã bị xóa mềm (isDeleted: true) ra khỏi danh sách hiển thị
    const where: any = { isDeleted: false };
    
    // Nếu includeDeleted = true (Bật 'Hiển thị đã ẩn'): CHỈ lấy sản phẩm đang ẩn (isAvailable = false)
    // Nếu includeDeleted = false: CHỈ lấy sản phẩm đang hoạt động (isAvailable = true)
    if (includeDeleted) {
      where.isAvailable = false;
    } else {
      where.isAvailable = true;
    }
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
   * A-03: Xóa mềm sản phẩm vi phạm (Soft Delete)
   */
  permanentDeleteProduct: async (menuItemId: string, adminId?: string) => {
    const item = await MenuItem.findByPk(menuItemId, {
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] }],
    });
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }

    const itemName = item.name;
    const restaurantName = (item as any).restaurant?.name || 'N/A';

    // Xóa mềm sản phẩm bằng cách set isDeleted = true
    await item.update({ isDeleted: true });

    // Ghi log
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'PRODUCT_HARD_DELETE',
        targetType: 'menuItem',
        targetId: menuItemId,
        description: `Xóa (ẩn) sản phẩm "${itemName}" của nhà hàng "${restaurantName}"`,
        details: { productName: itemName, restaurantName },
      });
    }

    return { deleted: true, id: menuItemId };
  },

  /**
   * A-03: Ẩn / Hiện sản phẩm (Soft hide via isAvailable flag)
   */
  toggleProductVisibility: async (menuItemId: string, hide: boolean, adminId?: string) => {
    const item = await MenuItem.findByPk(menuItemId);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }

    // Cập nhật trạng thái hiển thị qua isAvailable
    await item.update({ isAvailable: !hide });

    // Ghi log
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'PRODUCT_VISIBILITY_TOGGLE',
        targetType: 'menuItem',
        targetId: menuItemId,
        description: `${hide ? 'Ẩn' : 'Hiện'} sản phẩm "${item.name}"`,
        details: { productName: item.name, hide },
      });
    }

    return {
      id: item.id,
      name: item.name,
      isAvailable: item.isAvailable,
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

    // Nếu chuyển sang hoàn thành, thực hiện đối soát tài chính qua Ví điện tử
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      await reconciliationService.settleOrderPayment(order);
    }

    // Nếu chuyển sang trạng thái hủy và trạng thái cũ không phải là hủy, hoàn lại tồn kho & tiền (nếu có)
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      await orderService.handleOrderCancellation(order);
    }

    // Ghi log
    await createAdminLog({
      adminId,
      action: 'ORDER_STATUS_OVERRIDE',
      targetType: 'order',
      targetId: orderId,
      description: `Can thiệp đơn hàng #${orderId.slice(0, 8)}... từ "${oldStatus}" sang "${newStatus}" — Lý do: ${reason}`,
      details: { oldStatus, newStatus, reason },
    });

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

    const validRoles = ['user', 'vendor', 'shipper', 'admin'];
    if (!validRoles.includes(role)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Role không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    }

    if (user.status === 'banned') {
      throw new AppError(400, 'BUSINESS_ERROR', 'Không thể gán vai trò mới cho tài khoản đang bị khóa.');
    }

    const oldRole = user.role;
    await user.update({ role: role as any });

    // Gửi thông báo đến user
    try {
      await notificationService.sendSystemNotification(
        user.id,
        user.email,
        'Thay đổi vai trò tài khoản',
        `Tài khoản của bạn đã được quản trị viên thay đổi vai trò từ "${oldRole}" sang "${role}". Vui lòng đăng nhập lại để cập nhật quyền truy cập mới.`
      );
    } catch (notiError) {
      console.error('⚠️ Lỗi gửi thông báo đổi vai trò tài khoản:', notiError);
    }

    // Ghi log
    await createAdminLog({
      adminId,
      action: 'USER_ROLE_ASSIGN',
      targetType: 'user',
      targetId: userId,
      description: `Gán role "${role}" cho "${user.name}" (trước đó: ${oldRole})`,
      details: { oldRole, newRole: role, userName: user.name, userEmail: user.email },
    });

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

  // ============================================================
  // A-07: SYSTEM CONFIG — Cấu hình hệ thống
  // ============================================================

  /**
   * A-07: Lấy toàn bộ cấu hình hệ thống
   */
  getSystemConfigs: async () => {
    const configs = await SystemConfig.findAll({ order: [['group', 'ASC'], ['key', 'ASC']] });
    // Parse JSON value cho từng config
    return configs.map(c => ({
      key: c.key,
      value: JSON.parse(c.value),
      group: c.group,
      description: c.description,
      updatedAt: c.updatedAt,
    }));
  },

  /**
   * A-07: Cập nhật một config theo key
   */
  updateSystemConfig: async (key: string, value: any, adminId?: string) => {
    const config = await SystemConfig.findByPk(key);
    if (!config) {
      throw new AppError(404, 'NOT_FOUND', `Không tìm thấy cấu hình với key: ${key}`);
    }
    const oldValue = config.value;
    const processedValue = processBannerBase64(key, value);
    await config.update({ value: JSON.stringify(processedValue) });

    // Ghi log
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'SYSTEM_CONFIG_UPDATE',
        targetType: 'config',
        targetId: key,
        description: `Cập nhật cấu hình "${key}" (nhóm: ${config.group})`,
        details: { key, group: config.group, oldValue, newValue: JSON.stringify(processedValue) },
      });
    }

    return {
      key: config.key,
      value: JSON.parse(config.value),
      group: config.group,
      description: config.description,
      updatedAt: config.updatedAt,
    };
  },

  /**
   * A-07: Cập nhật nhiều config cùng lúc (batch update)
   */
  batchUpdateConfigs: async (updates: { key: string; value: any }[], adminId?: string) => {
    const results = [];
    for (const { key, value } of updates) {
      const config = await SystemConfig.findByPk(key);
      if (config) {
        const processedValue = processBannerBase64(key, value);
        await config.update({ value: JSON.stringify(processedValue) });
        results.push({ key, value: processedValue, success: true });
      } else {
        results.push({ key, value, success: false, error: 'Key not found' });
      }
    }

    // Ghi log & Tự động tạo System Notice
    if (adminId) {
      const successKeys = results.filter(r => r.success).map(r => r.key);
      if (successKeys.length > 0) {
        await createAdminLog({
          adminId,
          action: 'SYSTEM_CONFIG_BATCH_UPDATE',
          targetType: 'config',
          targetId: successKeys.join(','),
          description: `Cập nhật hàng loạt ${successKeys.length} cấu hình: ${successKeys.join(', ')}`,
          details: { updatedKeys: successKeys, totalRequested: updates.length },
        });

        // Chỉ tạo thông báo tự động nếu không phải là cập nhật thủ công system_notice
        if (!successKeys.includes('system_notice')) {
          const noticeParts: string[] = [];
          for (const { key, value } of updates) {
            if (key === 'platform_fee') {
              noticeParts.push(`Phí dịch vụ cập nhật thành ${Number(value).toLocaleString('vi-VN')} VNĐ`);
            } else if (key === 'min_order_amount') {
              noticeParts.push(`Đơn hàng tối thiểu cập nhật thành ${Number(value).toLocaleString('vi-VN')} VNĐ`);
            } else if (key === 'free_delivery_threshold') {
              noticeParts.push(`Đơn hàng từ ${Number(value).toLocaleString('vi-VN')} VNĐ sẽ được miễn phí giao hàng`);
            } else if (key === 'payment_methods') {
              const methods = typeof value === 'string' ? JSON.parse(value) : value;
              const activeMethods = Object.keys(methods).filter(k => methods[k]).map(m => m === 'COD' ? 'Tiền mặt' : m === 'WALLET' ? 'Ví điện tử' : 'Điểm tích lũy').join(', ');
              noticeParts.push(`Phương thức thanh toán khả dụng: ${activeMethods}`);
            } else if (key === 'homepage_banner') {
              noticeParts.push(`Cập nhật Banner trang chủ mới`);
            }
          }
          if (noticeParts.length > 0) {
            const noticeMsg = `[Cập nhật hệ thống] ${noticeParts.join(' | ')}.`;
            await adminService.createSystemNotice(noticeMsg, 'info');
          }
        }
      }
    }

    return results;
  },

  // ============================================================
  // LỊCH SỬ HOẠT ĐỘNG (Activity Log)
  // ============================================================

  /**
   * Lấy danh sách lịch sử hoạt động Admin (có phân trang, lọc)
   */
  getActivityLogs: async (options: {
    action?: string;
    adminId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const { action, adminId, dateFrom, dateTo, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo + 'T23:59:59');
    }

    const { count, rows } = await AdminLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      logs: rows.map(log => ({
        id: log.id,
        adminId: log.adminId,
        admin: (log as any).admin,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        description: log.description,
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * Tạo thông báo hệ thống tự động
   */
  createSystemNotice: async (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      const config = await SystemConfig.findByPk('system_notice');
      let notices: any[] = [];
      if (config) {
        const parsed = JSON.parse(config.value);
        if (Array.isArray(parsed)) {
          notices = parsed;
        } else if (parsed && parsed.message) {
          notices = [{ id: 'notice_legacy', ...parsed, createdAt: new Date().toISOString() }];
        }
      }

      // Deactivate all existing notices
      notices = notices.map(n => ({ ...n, isActive: false }));

      // Create and prepend the new active notice
      const newNotice = {
        id: 'notice_auto_' + Date.now(),
        message,
        type,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      notices.unshift(newNotice);

      // Keep max 20 notices
      if (notices.length > 20) {
        notices = notices.slice(0, 20);
      }

      if (config) {
        await config.update({ value: JSON.stringify(notices) });
      } else {
        await SystemConfig.create({
          key: 'system_notice',
          value: JSON.stringify(notices),
          group: 'notice',
          description: 'Thông báo hệ thống hiển thị cho toàn bộ người dùng'
        });
      }
      console.log(`[Auto Notice] Created system notice: "${message}"`);
    } catch (error) {
      console.error('⚠️ Lỗi tạo thông báo hệ thống tự động:', error);
    }
  },
};

export default adminService;
