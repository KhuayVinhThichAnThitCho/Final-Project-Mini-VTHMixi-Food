import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon } from 'lucide-react';

export const VendorMenu: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const menuItems = [
    { id: 'M01', name: 'Hủ tiếu mì sườn', category: 'Món chính', price: 55000, isAvailable: true, image: 'https://placehold.co/100x100/F0E9DE/BF3A20?text=Hu+Tieu' },
    { id: 'M02', name: 'Xí quách tô đặc biệt', category: 'Món thêm', price: 30000, isAvailable: false, image: 'https://placehold.co/100x100/F0E9DE/BF3A20?text=Xi+Quach' },
    { id: 'M03', name: 'Cà phê sữa đá', category: 'Đồ uống', price: 25000, isAvailable: true, image: 'https://placehold.co/100x100/F0E9DE/BF3A20?text=Cafe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Quản Lý Thực Đơn</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1">Tạo và chỉnh sửa món ăn, danh mục</p>
        </div>
        <button className="flex items-center gap-2 bg-[#BF3A20] text-white px-6 py-3 font-mono font-bold uppercase tracking-widest border-4 border-[#8A2512] shadow-[4px_4px_0_0_rgba(138,37,18,1)] transition-all hover:bg-[#A32D15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          <Plus size={20} /> Thêm Món Mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#F4F1EA] p-4 border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)]">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-saigon-neutral-text" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm món ăn..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none pl-12 pr-4 py-3 font-mono text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)] placeholder-neutral-400"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#FEFCF9] border-4 border-saigon-neutral-text font-mono font-bold uppercase hover:bg-[#E8D8C6] transition-colors">
          <Filter size={18} /> Lọc Danh Mục
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F4F1EA]">
              <tr className="border-b-4 border-saigon-neutral-text font-mono text-[10px] sm:text-xs uppercase text-saigon-neutral-text">
                <th className="py-4 px-6 font-black tracking-widest w-24">Ảnh</th>
                <th className="py-4 px-6 font-black tracking-widest">Tên Món</th>
                <th className="py-4 px-6 font-black tracking-widest">Danh Mục</th>
                <th className="py-4 px-6 font-black tracking-widest">Giá Bán</th>
                <th className="py-4 px-6 font-black tracking-widest text-center">Trạng Thái</th>
                <th className="py-4 px-6 font-black tracking-widest text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-saigon-neutral-border">
              {menuItems.map(item => (
                <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="w-14 h-14 bg-neutral-200 border-2 border-saigon-neutral-text relative overflow-hidden shadow-[2px_2px_0_0_rgba(30,25,21,1)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0_0_rgba(30,25,21,1)] transition-all">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-serif font-bold text-lg text-saigon-neutral-text">{item.name}</td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-mono font-bold uppercase bg-[#E8D8C6] px-2 py-1 border-2 border-saigon-neutral-text">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 price-text font-black text-xl text-saigon-primary">{item.price.toLocaleString('vi-VN')} đ</td>
                  <td className="py-4 px-6 text-center">
                    {/* Retro Switch Toggle */}
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-[10px] font-mono font-black uppercase ${item.isAvailable ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        {item.isAvailable ? 'CÒN HÀNG' : 'HẾT HÀNG'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
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

export default VendorMenu;
