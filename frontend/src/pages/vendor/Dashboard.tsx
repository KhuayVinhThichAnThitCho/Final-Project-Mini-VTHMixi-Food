import React, { useState } from 'react';
import Sidebar from '../../components/organisms/Sidebar';
import VendorOverview from './VendorOverview';
import VendorMenu from './VendorMenu';
import VendorOrders from './VendorOrders';
import VendorSettings from './VendorSettings';
import VendorPromotions from './VendorPromotions';
import VendorWallet from './VendorWallet';
import VendorReviews from './VendorReviews';
import VendorChat from './VendorChat';
import VendorCopilot from './VendorCopilot';

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('overview');

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return <VendorOverview />;
      case 'orders':
        return <VendorOrders />;
      case 'menu':
        return <VendorMenu />;
      case 'promotions':
        return <VendorPromotions />;
      case 'wallet':
        return <VendorWallet />;
      case 'reviews':
        return <VendorReviews />;
      case 'chat':
        return <VendorChat />;
      case 'copilot':
        return <VendorCopilot />;
      case 'settings':
        return <VendorSettings />;
      default:
        return <VendorOverview />;
    }
  };

  return (
    <div className="flex bg-slate-50 h-screen text-gray-800 font-sans overflow-hidden">
      {/* Menu Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} isVendor={true} />

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto relative z-10 h-full w-full bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
