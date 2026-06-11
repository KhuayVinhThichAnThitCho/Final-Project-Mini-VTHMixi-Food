import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit2, Calendar, Scissors } from 'lucide-react';

export const VendorPromotions: React.FC = () => {
  // Sample data
  const promos = [
    { id: 'PRM-01', code: 'GIAM15K', discount: '15.000 đ', minOrder: '50.000 đ', expires: '30/06/2026', usage: '45/100', status: 'Active' },
    { id: 'PRM-02', code: 'FREESHIP', discount: '100% Phí ship', minOrder: '100.000 đ', expires: '15/05/2026', usage: '100/100', status: 'Expired' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Quản Lý Khuyến Mãi</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1 flex items-center gap-2">
            <Tag size={16} /> Tạo mã giảm giá để thu hút khách hàng
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#BF3A20] text-white px-6 py-3 font-mono font-bold uppercase tracking-widest border-4 border-[#8A2512] shadow-[4px_4px_0_0_rgba(138,37,18,1)] transition-all hover:bg-[#A32D15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          <Plus size={20} /> Tạo Mã Mới
        </button>
      </div>

      <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] overflow-hidden">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F4F1EA]">
              <tr className="border-b-4 border-dashed border-saigon-neutral-text font-mono text-[10px] sm:text-xs uppercase text-saigon-neutral-text">
                <th className="py-4 px-6 font-black tracking-widest">Mã Giảm Giá</th>
                <th className="py-4 px-6 font-black tracking-widest">Mức Giảm</th>
                <th className="py-4 px-6 font-black tracking-widest">Đơn Tối Thiểu</th>
                <th className="py-4 px-6 font-black tracking-widest text-center">Đã Dùng</th>
                <th className="py-4 px-6 font-black tracking-widest">Hạn Sử Dụng</th>
                <th className="py-4 px-6 font-black tracking-widest text-center">Trạng Thái</th>
                <th className="py-4 px-6 font-black tracking-widest text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-saigon-neutral-text relative">
              {/* Scissors icon for that voucher feel */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-evenly opacity-30 text-saigon-neutral-text overflow-hidden w-6 -ml-3 z-10 pointer-events-none">
                 <Scissors size={20} className="rotate-90" />
                 <Scissors size={20} className="rotate-90" />
                 <Scissors size={20} className="rotate-90" />
              </div>

              {promos.map(promo => (
                <tr key={promo.id} className="hover:bg-[#FDFBF7] transition-colors group relative">
                  <td className="py-6 px-6">
                    <span className="font-mono font-black text-xl text-[#BF3A20] select-all bg-[#FDE8E8] px-3 py-1 border-2 border-dashed border-[#BF3A20] shadow-[2px_2px_0_0_rgba(191,58,32,1)] inline-block group-hover:scale-105 transition-transform">
                      {promo.code}
                    </span>
                  </td>
                  <td className="py-6 px-6 font-bold text-xl text-saigon-neutral-text">{promo.discount}</td>
                  <td className="py-6 px-6 font-mono font-bold text-saigon-neutral-subText">{promo.minOrder}</td>
                  <td className="py-6 px-6 font-mono font-black text-lg text-center">{promo.usage}</td>
                  <td className="py-6 px-6">
                    <span className="flex items-center gap-2 font-mono text-xs font-bold bg-[#E8D8C6] px-2 py-1 border-2 border-saigon-neutral-text max-w-max">
                      <Calendar size={14} /> {promo.expires}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-3 py-1 text-[10px] font-mono font-black uppercase border-2 shadow-[2px_2px_0_0_rgba(30,25,21,1)] ${promo.status === 'Active' ? 'border-emerald-700 text-emerald-800 bg-[#D1FAE5]' : 'border-neutral-500 text-neutral-600 bg-neutral-200'}`}>
                      {promo.status === 'Active' ? 'Đang Hoạt Động' : 'Hết Hạn'}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-2 bg-[#FEFCF9] border-2 border-saigon-neutral-text shadow-[2px_2px_0_0_rgba(30,25,21,1)] text-blue-700 hover:bg-blue-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 bg-[#FEFCF9] border-2 border-saigon-neutral-text shadow-[2px_2px_0_0_rgba(30,25,21,1)] text-[#BF3A20] hover:bg-[#BF3A20]/10 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorPromotions;
