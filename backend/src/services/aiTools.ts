import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { AiConversation } from '../models/AiConversation';
import { Op } from 'sequelize';

export const aiTools = {
  getRevenueTrends: async (restaurantId: string, days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      where: {
        restaurantId,
        status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['totalAmount', 'platformFee', 'createdAt']
    });

    // Aggregate by day: net revenue (after platform fee) + order count
    const dailyData: Record<string, { netRevenue: number; orders: number }> = {};
    orders.forEach(order => {
      const dateString = new Date(order.createdAt)
        .toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
      if (!dailyData[dateString]) {
        dailyData[dateString] = { netRevenue: 0, orders: 0 };
      }
      const net = Number(order.totalAmount) - Number((order as any).platformFee || 0);
      dailyData[dateString].netRevenue += net;
      dailyData[dateString].orders += 1;
    });

    const totalNetRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount) - Number((o as any).platformFee || 0), 0
    );

    return {
      timeframe: `${days} ngày gần nhất`,
      totalOrders: orders.length,
      totalNetRevenue,
      dailyData
    };
  },

  getMenuPerformance: async (restaurantId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      where: {
        restaurantId,
        status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['items']
    });

    // items is JSON array: { menuItemId, name, quantity, price }
    const performance: Record<string, { quantity: number, revenue: number }> = {};

    orders.forEach(order => {
      const items = order.items || [];
      items.forEach((item: any) => {
        if (!performance[item.name]) {
          performance[item.name] = { quantity: 0, revenue: 0 };
        }
        performance[item.name].quantity += item.quantity;
        performance[item.name].revenue += item.quantity * item.price;
      });
    });

    // Sort by quantity desc
    const sorted = Object.entries(performance)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      timeframe: `${days} days`,
      topItems: sorted.slice(0, 5),
      bottomItems: sorted.slice(-5).reverse(), // Reverse so the worst is first
    };
  },

  getRecentReviews: async (restaurantId: string, maxRating: number = 5, limit: number = 10) => {
    // Find recent orders for this restaurant to get reviews
    const recentOrders = await Order.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']],
      limit: limit * 5, // fetch more orders to find enough reviews
      attributes: ['id']
    });

    const orderIds = recentOrders.map(o => o.id);

    if (orderIds.length === 0) return { filter: `Rating <= ${maxRating}`, reviews: [] };

    const reviews = await Review.findAll({
      where: {
        orderId: { [Op.in]: orderIds },
        rating: { [Op.lte]: maxRating }
      },
      order: [['createdAt', 'DESC']],
      limit,
      attributes: ['rating', 'comment', 'createdAt']
    });

    return {
      filter: `Rating <= ${maxRating}`,
      reviews: reviews.map(r => ({ rating: r.rating, comment: r.comment, date: r.createdAt }))
    };
  },

  updateBusinessMemory: async (restaurantId: string, memoryObject: any) => {
    const conversation = await AiConversation.findOne({ where: { restaurantId } });
    if (!conversation) return { status: 'failed', message: 'No conversation found.' };

    const currentMemory = conversation.businessMemory || {};
    const updatedMemory = { ...currentMemory, ...memoryObject };

    conversation.businessMemory = updatedMemory;
    await conversation.save();

    return { status: 'success', memory: updatedMemory };
  }
};
