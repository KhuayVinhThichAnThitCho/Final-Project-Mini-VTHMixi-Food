import React from 'react';
import { Home, ShoppingBag, Settings, LogOut, Wallet, Store } from 'lucide-react';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu = 'dashboard', onMenuChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Đơn Hàng', icon: ShoppingBag },
    { id: 'menu', label: 'Thực Đơn', icon: Store },
    { id: 'wallet', label: 'Ví & Doanh Thu', icon: Wallet },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-saigon-neutral-surface border-r-2 border-saigon-neutral-text h-screen flex flex-col justify-between sticky top-0">
      
      {/* Header Sidebar */}
      <div>
        <div className="p-4 border-b border-saigon-neutral-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif font-black text-saigon-primary tracking-wide">
              QUẢN LÝ QUÁN
            </span>
            <span className="text-[10px] font-mono text-saigon-neutral-subText">
              HỆ THỐNG VENDOR
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange?.(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold border-2 transition-all ${
                  isActive
                    ? 'bg-saigon-primary text-saigon-neutral-surface border-saigon-neutral-text shadow-retro-sm translate-x-[1px] translate-y-[1px]'
                    : 'border-transparent text-saigon-neutral-subText hover:bg-saigon-neutral-bg hover:text-saigon-neutral-text'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar / Logout */}
      <div className="p-3 border-t border-saigon-neutral-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-saigon-primary hover:bg-[#BF3A20]/5 border-2 border-transparent transition-all">
          <LogOut size={16} />
          <span>Đăng Xuất</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
