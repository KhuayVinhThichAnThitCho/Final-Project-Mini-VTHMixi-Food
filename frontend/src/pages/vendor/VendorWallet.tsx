import React from 'react';
import { Wallet, ArrowDownCircle, TrendingUp, Calendar, Download, Building } from 'lucide-react';

export const VendorWallet: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Ví & Doanh Thu</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1">Sổ quản lý tài chính và rút tiền</p>
        </div>
      </div>

      {/* Wallet Info - Bank Book Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: The "Sổ Tiết Kiệm" */}
        <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] p-0 relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#BF3A20] opacity-10 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform"></div>
          
          <div className="p-6 border-b-4 border-saigon-neutral-text bg-[#F4F1EA] flex justify-between items-center">
            <h2 className="font-serif font-black text-2xl uppercase text-[#BF3A20] tracking-widest flex items-center gap-2">
              <Building size={28} /> Sổ Tài Khoản Quán
            </h2>
          </div>
          
          <div className="p-8">
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-saigon-neutral-subText mb-2">Số Dư Khả Dụng</h3>
            <p className="font-mono text-5xl font-black text-[#BF3A20] mb-4 tracking-tighter">
              12.450.000 đ
            </p>
            <div className="inline-block px-3 py-1 bg-[#FDE8E8] border-2 border-[#BF3A20] text-[#BF3A20] text-[10px] font-mono font-bold uppercase shadow-[2px_2px_0_0_rgba(191,58,32,1)]">
              Đang tạm giữ chờ đối soát: 1.240.000 đ
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="w-full flex justify-center items-center gap-2 bg-[#BF3A20] text-white px-6 py-4 font-mono font-black text-lg uppercase tracking-widest border-4 border-[#8A2512] shadow-[4px_4px_0_0_rgba(138,37,18,1)] transition-all hover:bg-[#A32D15] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
              <ArrowDownCircle size={24} /> Rút Tiền Về Ngân Hàng
            </button>
          </div>
        </div>

        {/* Right: The "Báo Cáo" */}
        <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] p-6 relative">
          <div className="absolute top-0 right-0 bg-[#C98F0A] text-white font-mono font-black text-xs px-3 py-1 border-b-4 border-l-4 border-saigon-neutral-text">
            BẢN SAO KÊ
          </div>
          <h3 className="text-xl font-black uppercase border-b-4 border-saigon-neutral-text pb-4 mb-6 flex items-center gap-2 mt-2">
            <TrendingUp size={24} className="text-[#C98F0A]" /> Báo Cáo Tuần Này
          </h3>
          
          <div className="space-y-4 font-mono">
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-saigon-neutral-text">
              <span className="text-sm font-bold uppercase">Tổng doanh thu</span>
              <span className="font-black text-xl text-saigon-primary">8.500.000 đ</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-saigon-neutral-text">
              <span className="text-sm font-bold uppercase">Số đơn hoàn thành</span>
              <span className="font-black text-xl">142 Đơn</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-saigon-neutral-text">
              <span className="text-sm font-bold uppercase">Đơn bị hủy</span>
              <span className="font-black text-xl text-[#BF3A20]">3 Đơn</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-saigon-neutral-text">
              <span className="text-sm font-bold uppercase">Chiết khấu sàn (10%)</span>
              <span className="font-black text-xl text-[#C98F0A]">-850.000 đ</span>
            </div>
          </div>
          
          <button className="mt-8 w-full flex justify-center items-center gap-2 px-6 py-4 bg-[#F4F1EA] border-4 border-saigon-neutral-text font-mono font-black uppercase tracking-widest hover:bg-[#E8D8C6] transition-colors shadow-[4px_4px_0_0_rgba(30,25,21,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            <Download size={20} /> Xuất Báo Cáo CSV
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] mt-10">
        <div className="p-5 border-b-4 border-saigon-neutral-text bg-[#F4F1EA] flex justify-between items-center">
          <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-2">
            <Calendar size={24} /> Lịch Sử Giao Dịch
          </h3>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#FEFCF9]">
              <tr className="border-b-4 border-dashed border-saigon-neutral-text font-mono text-[10px] sm:text-xs uppercase text-saigon-neutral-text">
                <th className="py-4 px-6 font-black tracking-widest">Mã GD & Thời Gian</th>
                <th className="py-4 px-6 font-black tracking-widest">Loại GD</th>
                <th className="py-4 px-6 font-black tracking-widest">Số Tiền</th>
                <th className="py-4 px-6 font-black tracking-widest">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-saigon-neutral-text">
              <tr className="hover:bg-[#F4F1EA] transition-colors group">
                <td className="py-4 px-6">
                  <p className="font-mono font-black text-lg text-saigon-neutral-text">#TXN-102</p>
                  <p className="text-[10px] font-mono font-bold text-saigon-neutral-subText">15:30 22/05/2026</p>
                </td>
                <td className="py-4 px-6 font-serif font-bold text-lg">Rút tiền về Vietcombank</td>
                <td className="py-4 px-6 font-mono font-black text-xl text-[#BF3A20]">-5.000.000 đ</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-emerald-800 text-emerald-800 bg-[#FEFCF9] shadow-[2px_2px_0_0_rgba(6,78,59,1)] inline-block">
                    THÀNH CÔNG
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F4F1EA] transition-colors group">
                <td className="py-4 px-6">
                  <p className="font-mono font-black text-lg text-saigon-neutral-text">#TXN-101</p>
                  <p className="text-[10px] font-mono font-bold text-saigon-neutral-subText">23:59 21/05/2026</p>
                </td>
                <td className="py-4 px-6 font-serif font-bold text-lg">Cộng doanh thu ngày 21/05</td>
                <td className="py-4 px-6 font-mono font-black text-xl text-emerald-700">+1.150.000 đ</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-emerald-800 text-emerald-800 bg-[#FEFCF9] shadow-[2px_2px_0_0_rgba(6,78,59,1)] inline-block">
                    THÀNH CÔNG
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorWallet;
