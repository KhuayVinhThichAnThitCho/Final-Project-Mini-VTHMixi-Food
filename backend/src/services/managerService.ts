import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Report } from '../models/Report';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { Wallet } from '../models/Wallet';
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

    const restaurantsCount = await Restaurant.count({ where: { region } });
    const restaurantsBefore30Days = await Restaurant.count({ where: { region, createdAt: { [Op.lt]: thirtyDaysAgo } } });
    const restaurantsTrend = calcGrowth(restaurantsCount, restaurantsBefore30Days);

    const usersCount = await User.count({ where: { region } });
    const usersBefore30Days = await User.count({ where: { region, createdAt: { [Op.lt]: thirtyDaysAgo } } });
    const usersTrend = calcGrowth(usersCount, usersBefore30Days);
    
    const ordersCount = await Order.count({
      include: [{ model: Restaurant, where: { region }, required: true }]
    });
    const ordersBefore30Days = await Order.count({
      where: { createdAt: { [Op.lt]: thirtyDaysAgo } },
      include: [{ model: Restaurant, where: { region }, required: true }]
    });
    const ordersTrend = calcGrowth(ordersCount, ordersBefore30Days);

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

  getAllVendors: async (region: string) => {
    return await Restaurant.findAll({
      where: { region },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'status', 'banReason'] }]
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

  rejectRestaurant: async (restaurantId: string, region: string, reason: string) => {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng.');
    if (restaurant.region !== region) throw new AppError(403, 'FORBIDDEN', 'Nhà hàng không thuộc khu vực quản lý của bạn.');
    if (restaurant.status !== 'pending') throw new AppError(400, 'BUSINESS_ERROR', 'Nhà hàng không ở trạng thái chờ duyệt.');

    restaurant.status = 'rejected';
    restaurant.rejectionReason = reason;
    await restaurant.save();
    return restaurant;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'banned', reason: string, managerRegion: string) => {
    const targetUser = await User.findByPk(userId);
    if (!targetUser) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
    if (targetUser.region !== managerRegion) {
      throw new AppError(403, 'FORBIDDEN', 'Người dùng này không thuộc khu vực bạn quản lý.');
    }
    if (targetUser.role === 'admin' || targetUser.role === 'manager') {
      throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền khóa tài khoản cấp quản lý trở lên.');
    }

    targetUser.status = status;
    if (status === 'banned') {
      targetUser.banReason = reason;
    } else {
      targetUser.banReason = undefined;
    }
    await targetUser.save();
    return targetUser;
  },

  getAllProducts: async (region: string) => {
    return await MenuItem.findAll({
      include: [{
        model: Restaurant,
        where: { region },
        attributes: ['id', 'name'],
        required: true
      }]
    });
  },

  updateProductStatus: async (productId: string, action: 'hide' | 'unhide' | 'delete', reason: string, region: string) => {
    const product = await MenuItem.findByPk(productId, {
      include: [{ model: Restaurant }]
    });
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    if (product.restaurant.region !== region) throw new AppError(403, 'FORBIDDEN', 'Sản phẩm không thuộc khu vực quản lý.');

    if (action === 'hide') {
      product.isAvailable = false;
      product.banReason = reason;
    } else if (action === 'unhide') {
      product.isAvailable = true;
      product.banReason = undefined;
    } else if (action === 'delete') {
      product.isDeleted = true;
      product.banReason = reason;
    }
    await product.save();
    return product;
  },

  getReports: async () => {
    // Trong môi trường phân tán khu vực, có thể lấy report theo target region. 
    // Tuy nhiên Report không có region, ta lấy tất cả cho đơn giản.
    return await Report.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
  },

  resolveReport: async (reportId: string, action: 'resolved' | 'rejected', managerNote: string) => {
    const report = await Report.findByPk(reportId);
    if (!report) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy báo cáo.');

    report.status = action;
    report.managerNote = managerNote;
    await report.save();
    return report;
  },

  getWithdrawals: async () => {
    return await WithdrawalRequest.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
  },

  processWithdrawal: async (withdrawalId: string, action: 'approved' | 'rejected', reason: string) => {
    const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
    if (!withdrawal) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu rút tiền.');
    if (withdrawal.status !== 'pending') throw new AppError(400, 'BUSINESS_ERROR', 'Yêu cầu này đã được xử lý.');

    const wallet = await Wallet.findOne({ where: { userId: withdrawal.vendorId } });
    if (!wallet) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy ví của vendor.');

    if (action === 'approved') {
      // Giả định: Pending balance đã được cộng khi tạo request rút tiền, nên khi duyệt, trừ cả pending balance.
      // Do không có createWithdrawal, ta chỉ cập nhật balance và pending (nếu có). 
      // Thực tế: Cần trừ vào pendingBalance nếu pendingBalance chứa tiền rút.
      // Dưới đây chỉ mô phỏng việc trừ pendingBalance (và có thể cả balance nếu chưa trừ).
      // Để an toàn, chỉ trừ balance và pendingBalance.
      const amountNum = Number(withdrawal.amount);
      if (Number(wallet.pendingBalance) >= amountNum) {
        wallet.pendingBalance = Number(wallet.pendingBalance) - amountNum;
      }
      if (Number(wallet.balance) >= amountNum) {
         wallet.balance = Number(wallet.balance) - amountNum;
      }
      await wallet.save();
      withdrawal.status = 'approved';
    } else {
      // Từ chối: hoàn lại tiền vào ví chính từ pendingBalance (nếu đã bị giam).
      const amountNum = Number(withdrawal.amount);
      if (Number(wallet.pendingBalance) >= amountNum) {
        wallet.pendingBalance = Number(wallet.pendingBalance) - amountNum;
        wallet.balance = Number(wallet.balance) + amountNum;
        await wallet.save();
      }
      withdrawal.status = 'rejected';
      withdrawal.reason = reason;
    }

    await withdrawal.save();
    return withdrawal;
  }
};
