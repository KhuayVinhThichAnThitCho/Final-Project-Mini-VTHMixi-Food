import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Order } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

export const managerService = {
  getDashboardStats: async (region: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const calcGrowth = (current: number, past: number) => {
      if (past === 0) return current > 0 ? '+100%' : '0%';
      const percentage = ((current - past) / past) * 100;
      return percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`;
    };

    // 1. Restaurants
    const restaurantsCount = await Restaurant.count({ where: { region } });
    const restaurantsBefore30Days = await Restaurant.count({ where: { region, createdAt: { [Op.lt]: thirtyDaysAgo } } });
    const restaurantsTrend = calcGrowth(restaurantsCount, restaurantsBefore30Days);

    // 2. Users
    const usersCount = await User.count({ where: { region } });
    const usersBefore30Days = await User.count({ where: { region, createdAt: { [Op.lt]: thirtyDaysAgo } } });
    const usersTrend = calcGrowth(usersCount, usersBefore30Days);
    
    // 3. Orders
    const ordersCount = await Order.count({
      include: [{ model: Restaurant, where: { region }, required: true }]
    });
    const ordersBefore30Days = await Order.count({
      where: { createdAt: { [Op.lt]: thirtyDaysAgo } },
      include: [{ model: Restaurant, where: { region }, required: true }]
    });
    const ordersTrend = calcGrowth(ordersCount, ordersBefore30Days);

    // 4. Sales Data (Daily total amount for the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        status: { [Op.in]: ['completed', 'delivering'] }
      },
      include: [{ model: Restaurant, where: { region }, required: true, attributes: ['id'] }],
      attributes: ['createdAt', 'totalAmount']
    });

    const salesMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      salesMap[dateStr] = 0;
    }

    recentOrders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr] += Number(order.totalAmount);
      }
    });

    const salesData = Object.keys(salesMap).sort().map(date => {
      const parts = date.split('-');
      return {
        name: `${parts[2]}/${parts[1]}`, // DD/MM
        sales: salesMap[date]
      };
    });

    // 5. Total Revenue
    const allCompletedOrders = await Order.findAll({
      where: { status: { [Op.in]: ['completed', 'delivering'] } },
      include: [{ model: Restaurant, where: { region }, required: true, attributes: ['id'] }],
      attributes: ['createdAt', 'totalAmount']
    });

    let currentTotalRevenue = 0;
    let pastTotalRevenue = 0;
    
    allCompletedOrders.forEach(o => {
      const amt = Number(o.totalAmount);
      currentTotalRevenue += amt;
      if (o.createdAt < thirtyDaysAgo) {
        pastTotalRevenue += amt;
      }
    });
    
    const revenueTrend = calcGrowth(currentTotalRevenue, pastTotalRevenue);

    return {
      restaurantsCount,
      restaurantsTrend,
      usersCount,
      usersTrend,
      ordersCount,
      ordersTrend,
      revenueTotal: currentTotalRevenue,
      revenueTrend,
      salesData
    };
  },

  getPendingRestaurants: async (region: string) => {
    return await Restaurant.findAll({
      where: {
        region,
        status: 'pending'
      },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }]
    });
  },

  approveRestaurant: async (restaurantId: string, region: string) => {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng.');
    if (restaurant.region !== region) throw new AppError(403, 'FORBIDDEN', 'Nhà hàng không thuộc khu vực quản lý của bạn.');
    if (restaurant.status !== 'pending') throw new AppError(400, 'BUSINESS_ERROR', 'Nhà hàng không ở trạng thái chờ duyệt.');

    restaurant.status = 'open';
    await restaurant.save();
    return restaurant;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'banned', managerRegion: string) => {
    const targetUser = await User.findByPk(userId);
    if (!targetUser) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    if (targetUser.region !== managerRegion) {
      throw new AppError(403, 'FORBIDDEN', 'Người dùng này không thuộc khu vực bạn quản lý.');
    }
    // Không cho phép Manager khóa Admin hoặc Manager khác
    if (targetUser.role === 'admin' || targetUser.role === 'manager') {
      throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền khóa tài khoản cấp quản lý trở lên.');
    }

    targetUser.status = status;
    await targetUser.save();
    return targetUser;
  }
};
