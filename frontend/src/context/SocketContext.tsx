import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import ConfirmModal from '../components/molecules/ConfirmModal';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated, accessToken, clearAuth } = useAuthStore(); // Lấy thông tin user đăng nhập và clearAuth

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    // Chỉ kết nối Socket khi người dùng đã đăng nhập thành công
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Kết nối tới Socket Server của Backend
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: accessToken
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Kết nối WebSocket thành công, socketID:', newSocket.id);
      
      // Đăng ký định danh userId online trên server
      newSocket.emit('register_user', user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Đã ngắt kết nối WebSocket.');
    });

    newSocket.on('notification', (data: any) => {
      console.log('🔔 Nhận thông báo hệ thống:', data);
      if (data && data.title && data.message) {
        // 1. Lưu thông báo vào localStorage để hiển thị trong Notification Bell
        try {
          const stored = localStorage.getItem('user_notifications');
          const customNotis = stored ? JSON.parse(stored) : [];
          const newNoti = {
            id: 'custom_' + Date.now(),
            type: 'system',
            title: data.title,
            message: data.message,
            time: 'Vừa xong',
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          customNotis.unshift(newNoti);
          localStorage.setItem('user_notifications', JSON.stringify(customNotis));
          
          // Bắn event để thông báo cho UserNotificationPanel reload lại danh sách
          window.dispatchEvent(new Event('new_notification'));
        } catch (err) {
          console.error('Lỗi lưu thông báo vào localStorage:', err);
        }

        // 2. Hiển thị Popup Modal
        setNotificationModal({
          isOpen: true,
          title: data.title,
          message: data.message,
        });
      }
    });

    setSocket(newSocket);

    // Dọn dẹp kết nối khi component unmount hoặc user logout
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const handleConfirmNotification = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      {notificationModal.isOpen && (
        <ConfirmModal
          isOpen={notificationModal.isOpen}
          title={notificationModal.title}
          message={notificationModal.message}
          confirmText="Đăng Nhập Lại"
          cancelText="Đóng"
          icon="info"
          onConfirm={handleConfirmNotification}
          onCancel={handleConfirmNotification}
        />
      )}
    </SocketContext.Provider>
  );
};

export default SocketContext;
