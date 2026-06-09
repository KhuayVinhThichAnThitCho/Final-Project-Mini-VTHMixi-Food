import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

/**
 * Custom Hook lắng nghe sự kiện WebSocket từ Backend.
 * 
 * @param event Tên sự kiện (ví dụ: 'notification', 'order_status_update')
 * @param callback Hàm xử lý dữ liệu nhận được
 */
export const useSocket = (event: string, callback: (data: any) => void) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Lắng nghe sự kiện
    socket.on(event, callback);

    // Dọn dẹp sự kiện lắng nghe cũ tránh bị lặp lại (duplicate listeners)
    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);

  return {
    socket,
  };
};

export default useSocket;
