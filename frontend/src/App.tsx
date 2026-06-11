import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';
import AuthConfirmModal from './components/molecules/AuthConfirmModal';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <AuthConfirmModal />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
