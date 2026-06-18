import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/redux/store';
import Sidebar from '../../components/organisms/Sidebar';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';

export const ManagerDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const { user } = useSelector((state: RootState) => state.auth);

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return <ManagerOverview />;
      case 'approvals':
        return <ManagerApprovals />;
      case 'accounts':
        return (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#E8D8C6] rounded-xl bg-[#FEFCF9] animate-fade-in mt-8">
            <h2 className="text-2xl font-display italic font-bold text-[#7A5235] mb-2">Quản Lý Tài Khoản</h2>
            <p className="text-[#9E6E4A] font-body text-sm">Tính năng đang được phát triển. Vui lòng quay lại sau!</p>
          </div>
        );
      default:
        return <ManagerOverview />;
    }
  };

  return (
    <div className="flex bg-[#FAF7F3] texture-paper h-screen text-gray-800 font-sans overflow-hidden">
      {/* Menu Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} role="manager" />

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto relative z-10 h-full w-full custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
