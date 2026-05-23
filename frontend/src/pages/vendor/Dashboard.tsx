import React, { useState } from 'react';
import Sidebar from '../../components/organisms/Sidebar';
import BadgeStamp from '../../components/atoms/BadgeStamp';

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="flex bg-saigon-neutral-bg min-h-screen text-saigon-neutral-text font-sans">
      {/* Menu Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main Content Area */}
      <main className="flex-grow p-8">
        
        {/* Header Dashboard */}
        <header className="flex justify-between items-center mb-8 border-b-2 border-saigon-neutral-text pb-4">
          <div>
            <h1 className="text-3xl font-bold">Thống Kê Quán Ăn</h1>
            <p className="text-xs font-mono text-saigon-neutral-subText">Hôm nay: Ngày 23 Tháng 05 Năm 2026</p>
          </div>
          
          <BadgeStamp text="Đang mở cửa" variant="success" />
        </header>

        {/* Thống kê nhanh */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-retro">
            <h3 className="text-xs font-mono font-black text-saigon-neutral-subText uppercase mb-2">
              Doanh Thu Ngày
            </h3>
            <p className="price-text text-2xl font-bold text-saigon-primary">
              1.240.000 đ
            </p>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-300 rounded">
              +15% so với hôm qua
            </span>
          </div>

          <div className="card-retro">
            <h3 className="text-xs font-mono font-black text-saigon-neutral-subText uppercase mb-2">
              Đơn hàng mới
            </h3>
            <p className="text-2xl font-bold text-saigon-neutral-text">
              18 Đơn
            </p>
            <span className="text-[10px] font-mono text-saigon-primary bg-[#BF3A20]/5 px-1 py-0.5 border border-saigon-primary/30 rounded">
              3 Đơn chưa xử lý
            </span>
          </div>

          <div className="card-retro">
            <h3 className="text-xs font-mono font-black text-saigon-neutral-subText uppercase mb-2">
              Món ăn bán chạy nhất
            </h3>
            <p className="text-lg font-bold text-saigon-neutral-text truncate">
              Hủ tiếu mì sườn
            </p>
            <span className="text-[10px] font-mono text-saigon-neutral-subText">
              Đã bán 34 bát hôm nay
            </span>
          </div>
        </section>

        {/* Danh sách đơn hàng gần đây */}
        <section className="card-retro">
          <h2 className="text-xl font-bold border-b border-saigon-neutral-border pb-3 mb-4">
            Đơn Hàng Gần Đây
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-saigon-neutral-text font-mono text-xs uppercase text-saigon-neutral-subText">
                  <th className="py-2">Mã Đơn</th>
                  <th className="py-2">Chi Tiết Món</th>
                  <th className="py-2">Tổng Tiền</th>
                  <th className="py-2">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saigon-neutral-border">
                <tr>
                  <td className="py-3 font-mono font-bold">#ORD-9482</td>
                  <td className="py-3">2x Hủ tiếu mì sườn, 1x Cà phê sữa đá</td>
                  <td className="py-3 price-text font-bold text-saigon-primary">108.000 đ</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 text-xs font-mono font-black border border-saigon-primary text-saigon-primary bg-[#BF3A20]/5 rounded">
                      PENDING
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold">#ORD-9481</td>
                  <td className="py-3">3x Xí quách tô đặc biệt</td>
                  <td className="py-3 price-text font-bold text-saigon-primary">90.000 đ</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 text-xs font-mono font-black border border-emerald-700 text-emerald-700 bg-emerald-50 rounded">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
