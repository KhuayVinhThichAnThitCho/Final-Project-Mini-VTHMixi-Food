import { Order } from '../models/Order';
import { MenuItem } from '../models/MenuItem';
import { Wallet } from '../models/Wallet';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

export const statsService = {
  /**
   * Lấy số liệu thống kê tổng quan cho một Nhà hàng (Vendor Dashboard)
   */
  getRestaurantStats: async (restaurantId: string) => {
    // 1. Tổng số đơn hàng phân theo từng trạng thái
    const ordersByStatus = await Order.findAll({
      where: { restaurantId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    // 2. Tổng doanh thu (Chỉ tính các đơn hàng có status là 'completed')
    const totalRevenueResult = await Order.findOne({
      where: { restaurantId, status: 'completed' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
    });
    const totalRevenue = Number(totalRevenueResult?.getDataValue('revenue') || 0);

    // 3. Quản lý dòng tiền ví (của chủ nhà hàng)
    // Giả định mỗi nhà hàng thuộc 1 Vendor, ta tìm ví của Vendor đó
    // Trong thực tế, cần join Restaurant -> User -> Wallet
    
    // 4. Top 5 món ăn bán chạy nhất của nhà hàng
    // Query kết hợp đếm các món ăn trong hóa đơn đã hoàn thành
    const topMenuItems = await MenuItem.findAll({
      where: { restaurantId, isDeleted: false },
      attributes: [
        'id',
        'name',
        'price',
        'soldCount',
      ],
      order: [['soldCount', 'DESC']],
      limit: 5,
    });

    return {
      ordersByStatus,
      totalRevenue,
      topMenuItems,
    };
  },

  /**
   * Lấy số liệu thống kê toàn hệ thống (Admin Dashboard)
   */
  getSystemStats: async () => {
    const totalUsers = await Wallet.count(); // Ví dụ đếm số ví đại diện user
    
    const totalRevenueResult = await Order.findOne({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
    });
    
    const systemRevenue = Number(totalRevenueResult?.getDataValue('revenue') || 0);

    return {
      totalUsers,
      systemRevenue,
    };
  },
};

export default statsService;
