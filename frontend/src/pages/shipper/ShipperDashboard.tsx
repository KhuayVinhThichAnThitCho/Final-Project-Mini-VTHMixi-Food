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
    <div className="flex bg-slate-50 h-screen overflow-hidden font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex-shrink-0 flex flex-col h-screen
        bg-white border-r border-gray-200 shadow-sm
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-modern-sm">
              <Truck size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none text-gray-800 tracking-tight">GrabFood</h2>
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Shipper Portal</span>
            </div>
          </div>
        </div>

        {/* Shipper info */}
        <div className="px-4 py-3 mx-3 mt-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-modern-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">{user?.name || 'Shipper'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-modern-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon size={18} strokeWidth={2} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-white/70" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-500 rounded-xl hover:bg-red-50 hover:text-primary-600 transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={2} />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-gray-800 text-base lg:text-lg">
            {menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
              <Bell size={16} className="text-gray-600" strokeWidth={2} />
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-modern-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ShipperDashboard;
