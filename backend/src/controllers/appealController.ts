import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { UnbanAppeal } from '../models/UnbanAppeal';
import { AppError } from '../middlewares/errorHandler';
import { notificationService } from '../services/notificationService';
import { AuthenticatedRequest } from './orderController';

export const appealController = {
  /**
   * Khách hàng gửi đơn xin mở khóa tài khoản
   */
  submitAppeal: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, appealReason } = req.body;

      if (!email || !appealReason) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng cung cấp email và lý do giải trình.');
      }

      const user = await User.findOne({ where: { email: email.toLowerCase() } });
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản người dùng tương ứng.');
      }

      if (user.status !== 'banned') {
        throw new AppError(400, 'BUSINESS_ERROR', 'Tài khoản của bạn hiện không bị khóa.');
      }

      // Kiểm tra xem đã có đơn xin mở khóa nào đang chờ duyệt hay không
      const pendingAppeal = await UnbanAppeal.findOne({
        where: { userId: user.id, status: 'pending' },
      });

      if (pendingAppeal) {
        throw new AppError(
          400,
          'BUSINESS_ERROR',
          'Bạn đã gửi yêu cầu mở khóa trước đó và đang được xem xét. Vui lòng kiên nhẫn chờ đợi.'
        );
      }

      // Tạo đơn mới
      const appeal = await UnbanAppeal.create({
        userId: user.id,
        appealReason: appealReason.trim(),
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Đã gửi yêu cầu mở khóa tài khoản thành công. Ban quản trị sẽ sớm phản hồi qua email.',
        data: appeal,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách các đơn xin mở khóa (Admin)
   */
  getAppeals: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      const offset = (page - 1) * limit;

      const { count, rows } = await UnbanAppeal.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'status', 'role', 'banReason'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        appeals: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu mở khóa (Admin)
   */
  resolveAppeal: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Chưa xác thực.');
      const { id } = req.params;
      const { status, adminResponse } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái xử lý không hợp lệ.');
      }

      const appeal = await UnbanAppeal.findByPk(id, {
        include: [{ model: User, as: 'user' }],
      });

      if (!appeal) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu mở khóa.');
      }

      if (appeal.status !== 'pending') {
        throw new AppError(400, 'BUSINESS_ERROR', 'Yêu cầu này đã được xử lý từ trước.');
      }

      const user = appeal.user;
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản liên quan đến yêu cầu này.');
      }

      if (status === 'approved') {
        // Mở khóa tài khoản
        await user.update({ status: 'active', banReason: null });

        // Cập nhật trạng thái appeal
        await appeal.update({
          status: 'approved',
          adminId: req.user.id,
          adminResponse: adminResponse || 'Yêu cầu mở khóa được chấp nhận.',
        });

        // Gửi thông báo email/realtime
        await notificationService.sendSystemNotification(
          user.id,
          user.email,
          'Tài khoản của bạn đã được mở khóa thành công',
          `Yêu cầu xin mở khóa tài khoản của bạn đã được Ban quản trị Chấp nhận. Phản hồi: "${adminResponse || 'Chào mừng bạn trở lại với GrabFood Mini!'}"`
        );
      } else {
        // Từ chối yêu cầu mở khóa
        await appeal.update({
          status: 'rejected',
          adminId: req.user.id,
          adminResponse: adminResponse || 'Yêu cầu mở khóa bị từ chối.',
        });

        // Gửi thông báo email/realtime
        await notificationService.sendSystemNotification(
          user.id,
          user.email,
          'Yêu cầu mở khóa tài khoản bị từ chối',
          `Đơn giải trình xin mở khóa tài khoản của bạn đã bị Từ chối bởi Ban quản trị. Phản hồi: "${adminResponse || 'Tài khoản vẫn giữ nguyên trạng thái khóa.'}"`
        );
      }

      res.status(200).json({
        success: true,
        message: status === 'approved' ? 'Đã chấp nhận và mở khóa tài khoản.' : 'Đã từ chối đơn yêu cầu mở khóa.',
        data: appeal,
      });
    } catch (error) {
      next(error);
    }
  },
};
