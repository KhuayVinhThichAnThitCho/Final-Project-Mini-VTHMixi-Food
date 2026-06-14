import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

// Interface custom request to use req.user from authMiddleware
interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const chatController = {
  // Lấy hoặc tạo mới cuộc hội thoại giữa User và Restaurant
  getOrCreateConversation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
      }

      // Kiểm tra xem nhà hàng có tồn tại không
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy nhà hàng');
      }

      // Tìm conversation
      let conversation = await Conversation.findOne({
        where: { userId, restaurantId },
        include: [{ model: Restaurant, attributes: ['id', 'name', 'logo'] }]
      });

      if (!conversation) {
        // Tạo mới nếu chưa có
        conversation = await Conversation.create({
          userId,
          restaurantId,
          lastMessageAt: new Date()
        });

        // Tự động tạo một tin nhắn chào mừng từ nhà hàng
        await Message.create({
          conversationId: conversation.id,
          senderType: 'VENDOR',
          text: `Chào bạn, chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong ngày hôm nay nhé.`
        });

        // Load lại conversation để lấy đầy đủ thông tin restaurant trả về cho frontend
        const reloaded = await Conversation.findByPk(conversation.id, {
          include: [{ model: Restaurant, attributes: ['id', 'name', 'logo'] }]
        });
        if (reloaded) {
          conversation = reloaded;
        }
      }

      // Lấy danh sách tin nhắn
      const messages = await Message.findAll({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Lấy danh sách hội thoại của người dùng (User)
  getUserConversations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const conversations = await Conversation.findAll({
        where: { userId },
        include: [
          { model: Restaurant, attributes: ['id', 'name', 'logo'] }
        ],
        order: [['lastMessageAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  },

  // Lấy danh sách hội thoại của cửa hàng (Vendor)
  getVendorConversations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vendorId = req.user?.id;
      // Tìm tất cả nhà hàng của vendor này
      const restaurants = await Restaurant.findAll({ where: { ownerId: vendorId } });
      if (!restaurants || restaurants.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có nhà hàng nào');
      }

      const restaurantIds = restaurants.map(r => r.id);

      const conversations = await Conversation.findAll({
        where: { restaurantId: restaurantIds },
        include: [
          { model: User, attributes: ['id', 'name', 'avatar'] },
          { model: Restaurant, attributes: ['id', 'name'] } // Trả về thêm tên nhà hàng để Vendor phân biệt
        ],
        order: [['lastMessageAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  },

  // Lấy tin nhắn trong 1 hội thoại cụ thể
  getMessages: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      const conversation = await Conversation.findByPk(conversationId, {
        include: [{ model: Restaurant }]
      });

      if (!conversation) {
        throw new AppError(404, 'NOT_FOUND', 'Hội thoại không tồn tại');
      }

      // Xác thực quyền xem (User hoặc Owner của Restaurant)
      if (conversation.userId !== userId && conversation.restaurant.ownerId !== userId) {
        throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền xem hội thoại này');
      }

      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }
};
