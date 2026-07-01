import { Order } from '../models/Order';
import { MenuItem } from '../models/MenuItem';
import { Wallet } from '../models/Wallet';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

/** Helper: Tạo khoảng thời gian đầu ngày VN */
const startOf = (unit: 'day' | 'week' | 'month'): Date => {
  const now = new Date();
  if (unit === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }
  if (unit === 'week') {
    const day = now.getDay(); // 0=Sun
    const diff = (day === 0 ? -6 : 1 - day); // bắt đầu từ Thứ Hai
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

/** Hàm tổng hợp revenue + order count trong khoảng thời gian */
const periodStats = async (restaurantId: string, from: Date) => {
  const result = await Order.findOne({
    where: {
      restaurantId,
      status: 'completed',
      createdAt: { [Op.gte]: from },
    },
    attributes: [
      [sequelize.literal('COUNT(id)'), 'orders'],
      [sequelize.literal('SUM(total_amount - platform_fee)'), 'revenue'],
    ],
  });
  return {
    orders: Number(result?.getDataValue('orders') || 0),
    earnings: Number(result?.getDataValue('revenue') || 0),
  };
};

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

    // 2. Tổng doanh thu toàn thời gian (đơn hoàn thành, đã trừ phí sàn)
    const totalRevenueResult = await Order.findOne({
      where: { restaurantId, status: 'completed' },
      attributes: [
        [sequelize.literal('SUM(total_amount - platform_fee)'), 'revenue'],
        [sequelize.literal('COUNT(id)'), 'orders'],
      ],
    });
    const totalRevenue = Number(totalRevenueResult?.getDataValue('revenue') || 0);
    const totalOrders  = Number(totalRevenueResult?.getDataValue('orders')  || 0);

    // 3. Thống kê theo kỳ: hôm nay / tuần này / tháng này
    const [today, week, month] = await Promise.all([
      periodStats(restaurantId, startOf('day')),
      periodStats(restaurantId, startOf('week')),
      periodStats(restaurantId, startOf('month')),
    ]);

    // 4. Biểu đồ doanh thu 7 ngày gần nhất (mỗi cột = 1 ngày)
    const chartData: { date: string; earnings: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const row = await Order.findOne({
        where: {
          restaurantId,
          status: 'completed',
          createdAt: { [Op.between]: [dayStart, dayEnd] },
        },
        attributes: [
          [sequelize.literal('COUNT(id)'),                            'orders'],
          [sequelize.literal('SUM(total_amount - platform_fee)'),     'revenue'],
        ],
      });

      chartData.push({
        date: dayStart.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        earnings: Number(row?.getDataValue('revenue') || 0),
        orders:   Number(row?.getDataValue('orders')  || 0),
      });
    }

    // 5. Top 5 món ăn bán chạy nhất
    const topMenuItems = await MenuItem.findAll({
      where: { restaurantId, isDeleted: false },
      attributes: ['id', 'name', 'price', 'soldCount'],
      order: [['soldCount', 'DESC']],
      limit: 5,
    });

    return {
      ordersByStatus,
      totalRevenue,
      totalOrders,
      today,
      week,
      month,
      chartData,
      topMenuItems,
    };
  },

  /**
   * Lấy số liệu thống kê toàn hệ thống (Admin Dashboard)
   */
  getSystemStats: async () => {
    const totalUsers = await Wallet.count();
    
    const totalRevenueResult = await Order.findOne({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('platform_fee')), 'revenue'],
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
