import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Mock các Pages (sẽ được tách nhỏ ra các file riêng biệt trong thư mục src/pages)
import Home from '../pages/guest/Home';
import RestaurantDetail from '../pages/guest/RestaurantDetail';
import VendorDashboard from '../pages/vendor/Dashboard';

// Mock trang Đăng nhập / Đăng ký đơn giản
const Login = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Đăng Nhập</h2></div>;
const Register = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Đăng Ký</h2></div>;
const OrderHistory = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Lịch Sử Đơn Hàng</h2></div>;
const AdminDashboard = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Admin Dashboard</h2></div>;

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Các route công khai (Dành cho tất cả khách hàng) */}
      <Route path="/" element={<Home />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2. Các route cần đăng nhập (Vai trò: USER) */}
      <Route element={<PrivateRoute allowedRoles={['USER', 'VENDOR', 'MANAGER', 'ADMIN']} />}>
        <Route path="/orders/history" element={<OrderHistory />} />
      </Route>

      {/* 3. Các route dành riêng cho Vendor (Chủ quán ăn) */}
      <Route element={<PrivateRoute allowedRoles={['VENDOR', 'ADMIN']} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      </Route>

      {/* 4. Các route dành riêng cho Admin / Manager */}
      <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Route mặc định: 404 hoặc chuyển về Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
