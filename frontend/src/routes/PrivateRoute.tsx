import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface PrivateRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập: Redirect về trang Login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Nếu có yêu cầu về phân quyền và vai trò của user không khớp: Redirect về Home
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Thỏa mãn điều kiện: Cho phép render component con bên trong
  return <Outlet />;
};

export default PrivateRoute;
