import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';
import AuthConfirmModal from './components/molecules/AuthConfirmModal';
import SystemNoticeBanner from './components/molecules/SystemNoticeBanner';
import { SocketProvider } from './context/SocketContext';
import { ChatWidget } from './components/chat/ChatWidget';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <BrowserRouter>
          {/* Thông báo hệ thống — hiện trên đầu tất cả các trang */}
          <SystemNoticeBanner />
          <AppRoutes />
          <AuthConfirmModal />
          <ChatWidget />
        </BrowserRouter>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
