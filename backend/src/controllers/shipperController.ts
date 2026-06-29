import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { AppError } from '../middlewares/errorHandler';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { sequelize } from '../config/database';
import path from 'path';
import fs from 'fs';
import { reconciliationService } from '../services/reconciliationService';

export const shipperController = {
  /**
   * Lấy danh sách đơn hàng sẵn sàng để nhận (status = 'ready', chưa có shipper)
   * GET /api/v1/shipper/orders/available
   */
  getAvailableOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      // Chỉ shipper online mới thấy đơn
      const shipper = await User.findByPk(req.user.id);
      if (!shipper || !shipper.isOnline) {
        res.status(200).json({ success: true, data: [], message: 'Bật trạng thái online để nhận đơn hàng.' });
        return;
      }

      const orders = await Order.findAll({
        where: { status: 'ready', shipperId: null },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'avatar'] },
          { model: Restaurant, attributes: ['id', 'name', 'address', 'logo'] },
        ],
        order: [['createdAt', 'ASC']],
      });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Nhận đơn hàng (race-safe với transaction)
   * POST /api/v1/shipper/orders/:id/accept
   */
  acceptOrder: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const { id } = req.params;

      // Dùng transaction để tránh race condition (2 shipper cùng nhận 1 đơn)
      const order = await sequelize.transaction(async (t) => {
        const found = await Order.findOne({
          where: { id, status: 'ready', shipperId: null },
          lock: true,
          transaction: t,
        });

        if (!found) {
          throw new AppError(409, 'BUSINESS_ERROR', 'Đơn hàng này đã được nhận bởi shipper khác hoặc không còn khả dụng.');
        }

        await found.update({ shipperId: req.user!.id }, { transaction: t });
        return found;
      });

      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'avatar'] },
          { model: Restaurant, attributes: ['id', 'name', 'address', 'logo'] },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Bạn đã nhận đơn hàng thành công! Hãy đến lấy hàng tại nhà hàng.',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xác nhận lấy hàng tại quán + upload ảnh (chuyển sang delivering)
   * POST /api/v1/shipper/orders/:id/pickup
   */
  confirmPickup: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const { id } = req.params;
      const { photo } = req.body; // base64 data URL

      const order = await Order.findByPk(id);
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
      if (order.shipperId !== req.user.id) throw new AppError(403, 'FORBIDDEN', 'Bạn không phải shipper của đơn này.');
      if (order.status !== 'ready') throw new AppError(400, 'BUSINESS_ERROR', 'Đơn hàng chưa ở trạng thái sẵn sàng.');

      let pickupPhotoUrl: string | undefined;
      if (photo && photo.startsWith('data:image/')) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'delivery-photos');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const ext = photo.split(';')[0].split('/')[1] || 'jpg';
        const filename = `pickup_${id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        pickupPhotoUrl = `/uploads/delivery-photos/${filename}`;
      }

      await order.update({ status: 'delivering', pickupPhotoUrl });

      res.status(200).json({
        success: true,
        message: 'Xác nhận lấy hàng thành công! Đang trên đường giao cho khách.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xác nhận giao hàng xong + upload ảnh (chuyển sang completed)
   * POST /api/v1/shipper/orders/:id/complete
   */
  completeDelivery: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const { id } = req.params;
      const { photo, deliveryCode } = req.body;

      const order = await Order.findByPk(id);
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
      if (order.shipperId !== req.user.id) throw new AppError(403, 'FORBIDDEN', 'Bạn không phải shipper của đơn này.');
      if (order.status !== 'delivering') throw new AppError(400, 'BUSINESS_ERROR', 'Đơn hàng chưa ở trạng thái đang giao.');

      // Xác thực mã nhận hàng từ khách để chống bưu tá trục lợi
      if (order.deliveryCode && order.deliveryCode !== deliveryCode) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã xác nhận giao hàng từ khách hàng không chính xác.');
      }

      let deliveryPhotoUrl: string | undefined;
      if (photo && photo.startsWith('data:image/')) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'delivery-photos');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const ext = photo.split(';')[0].split('/')[1] || 'jpg';
        const filename = `delivery_${id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        deliveryPhotoUrl = `/uploads/delivery-photos/${filename}`;
      }

      await order.update({ status: 'completed', deliveryPhotoUrl });

      // Thực hiện đối soát tài chính qua Ví điện tử hệ thống
      await reconciliationService.settleOrderPayment(order);

      console.log(`💰 Shipper ${req.user.id} hoàn thành đơn ${id} — Thu nhập: ${order.shippingFee}đ`);

      res.status(200).json({
        success: true,
        message: 'Giao hàng thành công! Thu nhập đã được ghi nhận.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy lịch sử đơn hàng của shipper
   * GET /api/v1/shipper/orders/my
   */
  getMyDeliveries: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const orders = await Order.findAll({
        where: { shipperId: req.user.id },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'avatar'] },
          { model: Restaurant, attributes: ['id', 'name', 'address', 'logo'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bật/Tắt trạng thái nhận đơn (online/offline)
   * PATCH /api/v1/shipper/me/online
   */
  toggleOnline: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const shipper = await User.findByPk(req.user.id);
      if (!shipper) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản.');

      const newStatus = !shipper.isOnline;
      await shipper.update({ isOnline: newStatus });

      res.status(200).json({
        success: true,
        message: newStatus ? '🟢 Bạn đang online — sẵn sàng nhận đơn!' : '🔴 Bạn đã offline.',
        data: { isOnline: newStatus },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thống kê thu nhập của shipper
   * GET /api/v1/shipper/me/earnings
   */
  getMyEarnings: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const { Op } = require('sequelize');

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const allOrders = await Order.findAll({
        where: { shipperId: req.user.id, status: 'completed' },
        attributes: ['id', 'shippingFee', 'shipperRating', 'createdAt'],
        order: [['createdAt', 'DESC']],
      });

      const calcEarnings = (orders: Order[]) =>
        orders.reduce((sum, o) => sum + Number(o.shippingFee), 0);

      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfDay);
      const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfWeek);
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth);

      // Tính rating trung bình
      const ratedOrders = allOrders.filter(o => o.shipperRating != null);
      const avgRating = ratedOrders.length > 0
        ? ratedOrders.reduce((sum, o) => sum + (o.shipperRating || 0), 0) / ratedOrders.length
        : null;

      // Dữ liệu biểu đồ 7 ngày gần nhất
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const chartData = last7Days.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const dayOrders = allOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d >= day && d < nextDay;
        });
        return {
          date: day.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
          earnings: calcEarnings(dayOrders),
          orders: dayOrders.length,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          today: { earnings: calcEarnings(todayOrders), orders: todayOrders.length },
          week: { earnings: calcEarnings(weekOrders), orders: weekOrders.length },
          month: { earnings: calcEarnings(monthOrders), orders: monthOrders.length },
          total: { earnings: calcEarnings(allOrders), orders: allOrders.length },
          avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
          chartData,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khách đánh giá shipper sau khi giao hàng hoàn tất
   * POST /api/v1/shipper/orders/:id/rate
   */
  rateShipper: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');

      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Điểm đánh giá phải từ 1 đến 5 sao.');
      }

      const order = await Order.findByPk(id);
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
      if (order.userId !== req.user.id) throw new AppError(403, 'FORBIDDEN', 'Bạn không phải chủ đơn hàng này.');
      if (order.status !== 'completed') throw new AppError(400, 'BUSINESS_ERROR', 'Chỉ có thể đánh giá sau khi đơn hoàn thành.');
      if (order.shipperRating != null) throw new AppError(400, 'BUSINESS_ERROR', 'Bạn đã đánh giá shipper rồi.');
      if (!order.shipperId) throw new AppError(400, 'BUSINESS_ERROR', 'Đơn hàng này không có shipper.');

      await order.update({ shipperRating: rating });

      // Cập nhật rating trung bình của shipper
      const allRatedOrders = await Order.findAll({
        where: { shipperId: order.shipperId, status: 'completed' },
        attributes: ['shipperRating'],
      });
      const ratedList = allRatedOrders.filter(o => o.shipperRating != null);
      const avgRating = ratedList.reduce((sum, o) => sum + (o.shipperRating || 0), 0) / ratedList.length;
      await User.update({ shipperRating: parseFloat(avgRating.toFixed(1)) }, { where: { id: order.shipperId } });

      res.status(200).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá shipper!',
        data: { rating },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default shipperController;
