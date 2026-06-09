import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

// Lưu danh sách người dùng đang online (ánh xạ userId -> socketId)
const onlineUsers = new Map<string, string>();

export const socketConfig = {
  /**
   * Khởi tạo Socket.io Server gắn liền với HTTP Server chính
   */
  initialize: (server: HttpServer): SocketIOServer => {
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
      },
    });

    console.log('⚡ Cổng WebSocket Socket.io đã được khởi tạo thành công!');

    // Lắng nghe sự kiện kết nối từ Client
    io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client mới đã kết nối: ${socket.id}`);

      // Sự kiện đăng ký định danh người dùng online (User/Vendor đăng nhập)
      socket.on('register_user', (userId: string) => {
        onlineUsers.set(userId, socket.id);
        console.log(`👤 Người dùng ${userId} đã đăng ký Socket với ID: ${socket.id}`);
      });

      // Sự kiện ngắt kết nối
      socket.on('disconnect', () => {
        // Tìm và xóa user khỏi danh sách online
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            console.log(`🔌 Client ${userId} đã ngắt kết nối.`);
            break;
          }
        }
      });
    });

    return io;
  },

  /**
   * Lấy socketId của một User cụ thể đang online
   */
  getUserSocketId: (userId: string): string | undefined => {
    return onlineUsers.get(userId);
  },

  /**
   * Trả về instance Socket.io Server để gửi thông báo ở các file khác
   */
  getIO: (): SocketIOServer => {
    if (!io) {
      throw new Error('Socket.io chưa được khởi tạo! Vui lòng gọi initialize trước.');
    }
    return io;
  },
};

export default socketConfig;
