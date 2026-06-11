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
      case 'settings':
        return <VendorSettings />;
      default:
        return <VendorOverview />;
    }
  };

  return (
    <div className="flex bg-[#FDFBF7] min-h-screen text-saigon-neutral-text font-sans texture-paper">
      {/* Menu Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} isVendor={true} />

      {/* Main Content Area */}
      <main className="flex-grow p-8 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
