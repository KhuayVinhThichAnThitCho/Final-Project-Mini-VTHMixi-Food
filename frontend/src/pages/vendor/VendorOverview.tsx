import React from 'react';
import BadgeStamp from '../../components/atoms/BadgeStamp';
import { TrendingUp, ShoppingBag, Award, Clock } from 'lucide-react';

export const VendorOverview: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <header className="flex justify-between items-center border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-saigon-neutral-text tracking-tight">Thống Kê Quán Ăn</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1 flex items-center gap-2">
            <Clock size={16} /> Hôm nay: Ngày 23 Tháng 05 Năm 2026
          </p>
        </div>
        <div className="rotate-3">
          <BadgeStamp text="Đang mở cửa" variant="success" />
        </div>
      </header>

      {/* Thống kê nhanh - Ticket Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket 1 */}
        <div className="relative bg-[#FEFCF9] border-4 border-saigon-neutral-text p-6 shadow-[6px_6px_0_0_rgba(30,25,21,1)] overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-saigon-primary opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-mono font-black text-saigon-neutral-text uppercase tracking-widest border-b-2 border-saigon-primary inline-block pb-1">
              Doanh Thu Ngày
            </h3>
            <TrendingUp className="text-saigon-primary" size={24} />
          </div>
          <p className="font-mono text-3xl font-black text-saigon-primary mb-2">
            1.240.000 đ
          </p>
          <div className="inline-block px-2 py-1 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 text-[10px] font-mono font-bold uppercase shadow-[2px_2px_0_0_rgba(6,78,59,1)]">
            +15% so với hôm qua
          </div>
        </div>

        {/* Ticket 2 */}
        <div className="relative bg-[#FEFCF9] border-4 border-saigon-neutral-text p-6 shadow-[6px_6px_0_0_rgba(30,25,21,1)] overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#C98F0A] opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-mono font-black text-saigon-neutral-text uppercase tracking-widest border-b-2 border-[#C98F0A] inline-block pb-1">
              Đơn hàng mới
            </h3>
            <ShoppingBag className="text-[#C98F0A]" size={24} />
          </div>
          <p className="font-mono text-3xl font-black text-saigon-neutral-text mb-2">
            18 Đơn
          </p>
          <div className="inline-block px-2 py-1 bg-[#FDE8E8] border-2 border-saigon-primary text-saigon-primary text-[10px] font-mono font-bold uppercase shadow-[2px_2px_0_0_rgba(191,58,32,1)]">
            3 Đơn chưa xử lý
          </div>
        </div>

        {/* Ticket 3 */}
        <div className="relative bg-[#FEFCF9] border-4 border-saigon-neutral-text p-6 shadow-[6px_6px_0_0_rgba(30,25,21,1)] overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-600 opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-mono font-black text-saigon-neutral-text uppercase tracking-widest border-b-2 border-emerald-600 inline-block pb-1">
              Món bán chạy nhất
            </h3>
            <Award className="text-emerald-600" size={24} />
          </div>
          <p className="font-serif text-xl font-bold text-saigon-neutral-text truncate mb-2">
            Hủ tiếu mì sườn
          </p>
          <div className="inline-block px-2 py-1 bg-[#F4F1EA] border-2 border-saigon-neutral-text text-saigon-neutral-text text-[10px] font-mono font-bold uppercase shadow-[2px_2px_0_0_rgba(30,25,21,1)]">
            Đã bán 34 bát hôm nay
          </div>
        </div>
      </section>

      {/* Danh sách đơn hàng gần đây */}
      <section className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)]">
        <div className="p-5 border-b-4 border-saigon-neutral-text bg-[#F4F1EA] flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-wider">
            Đơn Hàng Gần Đây
          </h2>
          <button className="px-3 py-1 border-2 border-saigon-neutral-text font-mono text-xs font-bold uppercase hover:bg-saigon-primary hover:text-white transition-colors">
            Xem Tất Cả
          </button>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#FEFCF9]">
              <tr className="border-b-4 border-dashed border-saigon-neutral-text font-mono text-xs uppercase text-saigon-neutral-text">
                <th className="py-4 px-6 font-black tracking-widest">Mã Đơn</th>
                <th className="py-4 px-6 font-black tracking-widest">Chi Tiết Món</th>
                <th className="py-4 px-6 font-black tracking-widest">Tổng Tiền</th>
                <th className="py-4 px-6 font-black tracking-widest">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-saigon-neutral-text">
              <tr className="hover:bg-[#F4F1EA] transition-colors group">
                <td className="py-4 px-6 font-mono font-bold text-lg">#ORD-9482</td>
                <td className="py-4 px-6 font-semibold">2x Hủ tiếu mì sườn, 1x Cà phê sữa đá</td>
                <td className="py-4 px-6 font-mono font-bold text-saigon-primary text-lg">108.000 đ</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-saigon-primary text-saigon-primary bg-[#FEFCF9] shadow-[2px_2px_0_0_rgba(191,58,32,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0_0_rgba(191,58,32,1)] transition-all inline-block">
                    PENDING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F4F1EA] transition-colors group">
                <td className="py-4 px-6 font-mono font-bold text-lg">#ORD-9481</td>
                <td className="py-4 px-6 font-semibold">3x Xí quách tô đặc biệt</td>
                <td className="py-4 px-6 font-mono font-bold text-emerald-700 text-lg">90.000 đ</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-emerald-800 text-emerald-800 bg-[#FEFCF9] shadow-[2px_2px_0_0_rgba(6,78,59,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0_0_rgba(6,78,59,1)] transition-all inline-block">
                    COMPLETED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default VendorOverview;
