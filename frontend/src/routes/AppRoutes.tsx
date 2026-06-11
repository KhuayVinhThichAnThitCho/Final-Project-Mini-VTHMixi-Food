import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Mock các Pages (sẽ được tách nhỏ ra các file riêng biệt trong thư mục src/pages)
import Home from '../pages/guest/Home';
import RestaurantDetail from '../pages/guest/RestaurantDetail';
import RestaurantList from '../pages/guest/RestaurantList';
import VendorDashboard from '../pages/vendor/Dashboard';
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import ForgotPassword from '../pages/guest/ForgotPassword';
import ProductDetail from '../pages/guest/ProductDetail';
import Cart from '../pages/guest/Cart';
import Profile from '../pages/user/Profile';
import CheckoutTracking from '../pages/user/CheckoutTracking';
import Favorites from '../pages/user/Favorites';
import MenuCatalog from '../pages/guest/MenuCatalog';
import SearchPage from '../pages/guest/Search';

const OrderHistory = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Lịch Sử Đơn Hàng</h2></div>;
const AdminDashboard = () => <div className="p-8 text-center"><h2 className="text-2xl font-serif">Admin Dashboard</h2></div>;

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Các route công khai (Dành cho tất cả khách hàng) */}
      <Route path="/" element={<Home />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/menu-items/:id" element={<ProductDetail />} />
      <Route path="/menu" element={<MenuCatalog />} />
      <Route path="/search" element={<SearchPage />} />

      {/* 2. Các route cần đăng nhập (Vai trò: USER) */}
      <Route element={<PrivateRoute allowedRoles={['USER', 'VENDOR', 'MANAGER', 'ADMIN']} />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<CheckoutTracking />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/orders/history" element={<OrderHistory />} />
        <Route path="/cart" element={<Cart />} />
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
