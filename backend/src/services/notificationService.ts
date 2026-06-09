import { socketConfig } from '../config/socket';
import { sendMail } from '../config/mailer';

export const notificationService = {
  /**
   * Gửi thông báo realtime qua kết nối WebSocket (Socket.io)
   * 
   * @param userId ID người dùng nhận thông báo (User hoặc Vendor)
   * @param event Tên sự kiện Socket (ví dụ: 'new_order', 'order_status_update')
   * @param data Nội dung thông báo
   */
  sendRealtime: (userId: string, event: string, data: any): boolean => {
    try {
      const io = socketConfig.getIO();
      const socketId = socketConfig.getUserSocketId(userId);

      if (socketId) {
        // Người dùng đang online: Gửi trực tiếp qua WebSocket
        io.to(socketId).emit(event, data);
        console.log(`📡 Đã gửi thông báo realtime event "${event}" tới user: ${userId}`);
        return true;
      }
      
      console.log(`💤 User ${userId} hiện đang offline. Không thể gửi thông báo realtime.`);
      return false;
    } catch (error) {
      console.error('❌ Gặp lỗi khi gửi thông báo realtime qua Socket:', error);
      return false;
    }
  },

  /**
   * Gửi thông báo hệ thống kép: Vừa bắn realtime qua Socket (nếu online), vừa gửi email lưu trữ
   */
  sendSystemNotification: async (
    userId: string,
    email: string,
    title: string,
    message: string
  ): Promise<void> => {
    // 1. Gửi qua WebSocket
    notificationService.sendRealtime(userId, 'notification', {
      title,
      message,
      timestamp: new Date(),
    });

    // 2. Gửi qua Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F3; color: #2C1A0E;">
        <h2 style="color: #BF3A20;">${title}</h2>
        <p>${message}</p>
        <hr style="border: 1px dashed #E8D8C6;" />
        <p style="font-size: 12px; color: #5C3A22;">Đây là email tự động từ hệ thống GrabFood Mini. Vui lòng không phản hồi.</p>
      </div>
    `;
    await sendMail(email, title, emailHtml);
  },
};

export default notificationService;
