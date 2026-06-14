import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag,
  BarChart3, LogOut, ChevronRight, Shield
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

interface AdminSidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
  { id: 'users', label: 'Quản Lý User', icon: Users },
  { id: 'vendors', label: 'Quản Lý Vendor', icon: Store },
  { id: 'products', label: 'Sản Phẩm', icon: Package },
  { id: 'orders', label: 'Đơn Hàng', icon: ShoppingBag },
  { id: 'analytics', label: 'Báo Cáo & Doanh Thu', icon: BarChart3 },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeMenu, onMenuClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-neutral-900 flex flex-col h-screen sticky top-0 overflow-y-auto border-r-4 border-neutral-950 shadow-[4px_0_0_0_rgba(26,16,8,1)]">
      {/* Logo */}
      <div className="p-6 border-b-2 border-neutral-800">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-primary-600 flex items-center justify-center border-2 border-secondary-300 shadow-retro-sm flex-shrink-0">
            <Shield size={20} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display italic text-lg leading-none text-secondary-300">
              GrabFood
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-widest uppercase">
                Admin Panel
              </span>
              <span className="bg-secondary-500 text-neutral-900 text-[8px] font-mono font-bold px-1 py-0.5 tracking-wider">
                v1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 border-l-4 ${
                isActive
                  ? 'bg-primary-600 text-white border-secondary-300 shadow-[inset_0_1px_0_rgba(233,196,106,0.2)]'
                  : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                className={isActive ? 'text-secondary-300' : 'text-neutral-500'}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-secondary-400" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-2 border-neutral-800">
        <div className="px-4 py-2 mb-3">
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Đăng nhập với tư cách</p>
          <p className="text-sm font-mono font-bold text-secondary-300 mt-0.5">Super Admin</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-primary-400 font-mono font-bold uppercase text-sm border border-primary-800 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
