import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { Op } from 'sequelize';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123456';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // Middleware xác thực socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Xóa Bearer nếu có
      const tokenValue = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      jwt.verify(tokenValue, ACCESS_TOKEN_SECRET, (err: any, decoded: any) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        
        // Gắn thông tin user vào socket
        socket.data.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Người dùng kết nối Socket: ${socket.id} (User ID: ${socket.data.user.id})`);

    // Tham gia phòng chat của 1 conversation cụ thể
    socket.on('join_room', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`🚪 Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Rời phòng chat
    socket.on('leave_room', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`🚪 Socket ${socket.id} left room: ${conversationId}`);
    });

    // Nhận và gửi tin nhắn
    socket.on('send_message', async (data: { conversationId: string; senderType: 'USER' | 'VENDOR'; text?: string; imageUrl?: string }) => {
      try {
        const { conversationId, senderType, text, imageUrl } = data;

        // Lưu tin nhắn vào DB
        const newMessage = await Message.create({
          conversationId,
          senderType,
          text,
          imageUrl
        });

        // Cập nhật lastMessageAt cho Conversation
        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { id: conversationId } }
        );

        // Phát tin nhắn cho tất cả người dùng trong phòng (bao gồm cả người gửi để xác nhận)
        io.to(conversationId).emit('receive_message', newMessage);

        // AUTO-REPLY LỖI MỖI NGÀY MỚI
        if (senderType === 'USER') {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const vendorMessageToday = await Message.findOne({
            where: {
              conversationId,
              senderType: 'VENDOR',
              createdAt: {
                [Op.gte]: startOfToday
              }
            }
          });

          if (!vendorMessageToday) {
            const autoReply = await Message.create({
              conversationId,
              senderType: 'VENDOR',
              text: 'Chào bạn, chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong ngày hôm nay nhé.'
            });

            await Conversation.update(
              { lastMessageAt: new Date() },
              { where: { id: conversationId } }
            );

            io.to(conversationId).emit('receive_message', autoReply);
          }
        }

      } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn qua socket:', error);
        socket.emit('error', { message: 'Không thể gửi tin nhắn' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Người dùng ngắt kết nối Socket: ${socket.id}`);
    });
  });

  return io;
};
