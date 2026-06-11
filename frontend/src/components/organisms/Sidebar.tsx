import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Settings, LogOut, Wallet, Store, Tag, MessageSquare, MessageCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

interface SidebarProps {
  activeMenu?: string;
  onMenuClick?: (menu: string) => void;
  isVendor?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu = 'overview', onMenuClick, isVendor = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    <aside className="w-64 bg-[#F4F1EA] border-r-4 border-saigon-neutral-text flex flex-col h-full overflow-y-auto texture-paper shadow-[4px_0_0_0_rgba(30,25,21,1)] relative z-20">
      <div className="p-6 border-b-4 border-saigon-neutral-text bg-[#FEFCF9]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-[#BF3A20] text-[#FEFCF9] flex items-center justify-center border-2 border-saigon-neutral-text shadow-retro-sm">
            <Store size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none uppercase text-saigon-neutral-text">
              {isVendor ? 'Quán Ăn' : 'Khách Hàng'}
            </h2>
            <p className="text-[10px] font-mono font-bold text-[#BF3A20] tracking-widest uppercase">GrabFood Mini</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-mono font-bold uppercase tracking-wider text-sm transition-all duration-200 border-2 ${
                isActive 
                  ? 'bg-[#C98F0A] text-saigon-neutral-bg border-saigon-neutral-text shadow-retro translate-x-[-2px] translate-y-[-2px]' 
                  : 'bg-transparent text-saigon-neutral-text border-transparent hover:border-saigon-neutral-text hover:bg-[#FEFCF9] hover:shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#FEFCF9]' : 'text-[#BF3A20]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-4 border-saigon-neutral-text bg-[#FEFCF9]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-[#BF3A20] font-mono font-bold uppercase text-sm border-2 border-[#BF3A20] hover:bg-[#BF3A20] hover:text-[#FEFCF9] transition-colors shadow-retro-sm active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
        >
          <LogOut size={18} />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
