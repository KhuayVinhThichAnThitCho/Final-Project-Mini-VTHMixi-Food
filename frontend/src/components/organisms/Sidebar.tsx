import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Settings, LogOut, Wallet, Store, Tag, MessageSquare, MessageCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import ConfirmModal from '../molecules/ConfirmModal';

interface SidebarProps {
  activeMenu?: string;
  onMenuClick?: (menu: string) => void;
  isVendor?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu = 'overview', onMenuClick, isVendor = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (id: string) => {
    if (onMenuClick) {
      onMenuClick(id);
    } else {
      // Logic điều hướng nếu không dùng onMenuClick
    }
  };

  const menuItems = isVendor ? [
    { id: 'overview', label: 'Tổng Quan', icon: Home },
    { id: 'orders', label: 'Đơn Hàng', icon: ShoppingBag },
    { id: 'menu', label: 'Thực Đơn', icon: Store },
    { id: 'promotions', label: 'Khuyến Mãi', icon: Tag },
    { id: 'wallet', label: 'Ví & Doanh Thu', icon: Wallet },
    { id: 'reviews', label: 'Đánh Giá', icon: MessageSquare },
    { id: 'chat', label: 'Tin Nhắn', icon: MessageCircle },
    { id: 'settings', label: 'Cài Đặt Quán', icon: Settings },
  ] : [
    { id: 'profile', label: 'Hồ Sơ', icon: Home },
    { id: 'orders', label: 'Lịch Sử Đơn', icon: ShoppingBag },
    { id: 'wallet', label: 'Ví Tiền', icon: Wallet },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside className={`w-72 flex-shrink-0 flex flex-col h-full overflow-y-auto relative z-20 transition-all duration-300 ${
      isVendor 
        ? 'bg-white/90 backdrop-blur-xl border-r border-gray-100 shadow-modern-xl'
        : 'bg-[#F4F1EA] border-r-4 border-saigon-neutral-text texture-paper shadow-[4px_0_0_0_rgba(30,25,21,1)]'
    }`}>
      <div className={`p-6 ${isVendor ? 'border-b border-gray-100/50 bg-transparent' : 'border-b-4 border-saigon-neutral-text bg-[#FEFCF9]'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className={`w-10 h-10 flex items-center justify-center ${
            isVendor 
              ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl shadow-modern-glow'
              : 'bg-[#BF3A20] text-[#FEFCF9] border-2 border-saigon-neutral-text shadow-retro-sm'
          }`}>
            <Store size={24} />
          </div>
          <div>
            <h2 className={`font-black text-xl tracking-tight leading-none uppercase ${isVendor ? 'text-gray-800' : 'text-saigon-neutral-text'}`}>
              {isVendor ? 'Quán Ăn' : 'Khách Hàng'}
            </h2>
            <p className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isVendor ? 'text-primary-600' : 'text-[#BF3A20]'}`}>GrabFood Mini</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-mono font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                isVendor 
                  ? isActive
                    ? 'bg-primary-50/80 text-primary-700 rounded-xl shadow-sm'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl'
                  : isActive 
                    ? 'border-2 bg-[#C98F0A] text-saigon-neutral-bg border-saigon-neutral-text shadow-retro translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-2 bg-transparent text-saigon-neutral-text border-transparent hover:border-saigon-neutral-text hover:bg-[#FEFCF9] hover:shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              <Icon size={18} className={
                isVendor 
                  ? (isActive ? 'text-primary-600' : 'text-gray-400')
                  : (isActive ? 'text-[#FEFCF9]' : 'text-[#BF3A20]')
              } />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-4 ${isVendor ? 'border-t border-gray-100/50 bg-transparent' : 'border-t-4 border-saigon-neutral-text bg-[#FEFCF9]'}`}>
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-mono font-bold uppercase text-sm transition-all duration-300 ${
            isVendor
              ? 'bg-red-50/50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700'
              : 'bg-transparent text-[#BF3A20] border-2 border-[#BF3A20] hover:bg-[#BF3A20] hover:text-[#FEFCF9] shadow-retro-sm active:translate-y-[2px] active:translate-x-[2px] active:shadow-none'
          }`}
        >
          <LogOut size={18} />
          Đăng Xuất
        </button>
      </div>
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Đăng Xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmText="Đăng Xuất"
        cancelText="Hủy"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
