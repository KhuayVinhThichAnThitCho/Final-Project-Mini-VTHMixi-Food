import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Clock, TrendingUp,
  LogOut, ChevronRight, Truck,
  Bell, Menu
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import ShipperOverview from './ShipperOverview';
import ShipperAvailableOrders from './ShipperAvailableOrders';
import ShipperActiveOrder from './ShipperActiveOrder';
import ShipperHistory from './ShipperHistory';
import ShipperEarnings from './ShipperEarnings';

const menuItems = [
  { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
  { id: 'available', label: 'Đơn Có Sẵn', icon: Package },
  { id: 'active', label: 'Đang Giao', icon: Truck },
  { id: 'history', label: 'Lịch Sử', icon: Clock },
  { id: 'earnings', label: 'Thu Nhập', icon: TrendingUp },
];

const ShipperDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview': return <ShipperOverview onNavigate={setActiveMenu} />;
      case 'available': return <ShipperAvailableOrders onNavigate={setActiveMenu} />;
      case 'active': return <ShipperActiveOrder />;
      case 'history': return <ShipperHistory />;
      case 'earnings': return <ShipperEarnings />;
      default: return <ShipperOverview onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-800 overflow-hidden font-body relative texture-paper">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#2C1A0E]/55 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex-shrink-0 flex flex-col h-screen
        bg-neutral-900 border-r-4 border-neutral-950
        shadow-[4px_0_0_0_rgba(26,16,8,1)]
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b-2 border-neutral-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary-600 flex items-center justify-center border-2 border-secondary-300 shadow-retro-sm flex-shrink-0">
              <Truck size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display italic text-lg leading-none text-secondary-300">GrabFood</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-widest uppercase">Shipper Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipper info */}
        <div className="px-4 py-3 mx-3 mt-3 border-2 border-neutral-950 bg-[#3D2314] shadow-retro-sm rounded-sm text-[#F5EFE6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 border border-secondary-300 flex items-center justify-center text-sm font-bold text-white shadow-retro-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="min-w-0 font-mono">
              <p className="font-bold text-xs text-secondary-300 truncate uppercase tracking-wide">{user?.name || 'Shipper'}</p>
              <p className="text-[9px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 border-l-4 ${
                  isActive
                    ? 'bg-primary-600 text-white border-secondary-300 shadow-[inset_0_1px_0_rgba(233,196,106,0.2)]'
                    : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-600'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} className={isActive ? 'text-secondary-300' : 'text-neutral-500'} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-secondary-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t-2 border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-primary-400 font-mono font-bold uppercase text-xs border border-primary-800 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-[#FEFCF9] border-b-2 border-neutral-900">
          <button
            className="lg:hidden text-neutral-700 hover:text-neutral-900 border-2 border-neutral-900 p-1 bg-[#F5EFE6] shadow-retro-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <h1 className="font-heading font-bold text-neutral-900 text-base lg:text-lg">
            {menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F5EFE6] border-2 border-neutral-900 flex items-center justify-center cursor-pointer hover:bg-neutral-200 shadow-retro-sm transition">
              <Bell size={16} className="text-neutral-700" strokeWidth={1.5} />
            </div>
            <div className="w-8 h-8 bg-primary-600 border-2 border-neutral-900 flex items-center justify-center text-xs font-bold text-white shadow-retro-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ShipperDashboard;
