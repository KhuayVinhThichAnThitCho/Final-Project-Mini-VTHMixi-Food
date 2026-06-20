import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminVendors from './AdminVendors';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminActivityLog from './AdminActivityLog';
import AdminVouchers from './AdminVouchers';

type AdminMenu = 'dashboard' | 'users' | 'vendors' | 'products' | 'orders' | 'vouchers' | 'analytics' | 'settings' | 'activity-log';

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':  return <AdminOverview />;
      case 'users':      return <AdminUsers />;
      case 'vendors':    return <AdminVendors />;
      case 'products':   return <AdminProducts />;
      case 'orders':     return <AdminOrders />;
      case 'vouchers':   return <AdminVouchers />;
      case 'analytics':  return <AdminAnalytics />;
      case 'settings':   return <AdminSettings />;
      case 'activity-log': return <AdminActivityLog />;
      default:           return <AdminOverview />;
    }
  };

  return (
    <div className="flex bg-neutral-50 min-h-screen font-body">
      {/* Sidebar */}
      <AdminSidebar activeMenu={activeMenu} onMenuClick={(m) => setActiveMenu(m as AdminMenu)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#FEFCF9] border-b-2 border-neutral-200 px-8 py-4 flex items-center justify-between shadow-saigon-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>GrabFood Mini</span>
            <span>›</span>
            <span>Admin</span>
            <span>›</span>
            <span className="text-neutral-700 font-bold capitalize">{activeMenu}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-neutral-500">Server đang hoạt động</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
