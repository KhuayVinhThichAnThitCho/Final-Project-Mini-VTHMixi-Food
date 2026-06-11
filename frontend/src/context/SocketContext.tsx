import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

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
  const { user, isAuthenticated, accessToken } = useAuthStore(); // Lấy thông tin user đăng nhập

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

    setSocket(newSocket);

    // Dọn dẹp kết nối khi component unmount hoặc user logout
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
