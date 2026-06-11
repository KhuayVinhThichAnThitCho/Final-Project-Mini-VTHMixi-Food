import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, Clock, XCircle, ChevronRight, Printer } from 'lucide-react';

export const VendorOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data
  const orders = [
    { id: 'ORD-9482', time: '10:45 23/05/2026', items: ['2x Hủ tiếu mì sườn', '1x Cà phê sữa đá'], total: 108000, status: 'PENDING', customer: 'Nguyễn Văn A' },
    { id: 'ORD-9481', time: '10:30 23/05/2026', items: ['3x Xí quách tô đặc biệt'], total: 90000, status: 'COMPLETED', customer: 'Trần Thị B' },
    { id: 'ORD-9480', time: '09:15 23/05/2026', items: ['1x Hủ tiếu mì sườn'], total: 55000, status: 'CANCELLED', customer: 'Lê Văn C' },
    { id: 'ORD-9479', time: '08:45 23/05/2026', items: ['2x Cà phê sữa đá'], total: 50000, status: 'PREPARING', customer: 'Phạm D' },
    { id: 'ORD-9483', time: '11:05 23/05/2026', items: ['1x Mì xào giòn hải sản', '1x Trà đá'], total: 65000, status: 'PENDING', customer: 'Hoàng Thị E' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Quản Lý Đơn Hàng</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1">Theo dõi và xử lý đơn hàng của quán</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[4px_4px_0_0_rgba(30,25,21,1)] font-mono font-bold uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(30,25,21,1)] transition-all">
          <Printer size={18} /> In Biên Lai
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#F4F1EA] p-4 border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)]">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-saigon-neutral-text" size={20} />
          <input 
            type="text" 
            placeholder="Tìm mã đơn hàng hoặc tên khách..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none pl-12 pr-4 py-3 font-mono text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)] placeholder-neutral-400"
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FEFCF9] border-4 border-saigon-neutral-text font-mono font-bold uppercase hover:bg-[#E8D8C6] transition-colors">
            <Clock size={18} /> Hôm Nay
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FEFCF9] border-4 border-saigon-neutral-text font-mono font-bold uppercase hover:bg-[#E8D8C6] transition-colors">
            <Filter size={18} /> Trạng Thái
          </button>
        </div>
      </div>

      {/* Grid of Order Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {orders.map(order => {
          let ticketBorder = "border-saigon-neutral-text";
          let badgeColor = "bg-[#FEFCF9] text-saigon-neutral-text border-saigon-neutral-text";
          let badgeText = "";
          let actionBtn = null;

          if (order.status === 'PENDING') {
            ticketBorder = "border-[#BF3A20]";
            badgeColor = "bg-[#BF3A20] text-white border-[#BF3A20]";
            badgeText = "CHỜ DUYỆT";
            actionBtn = (
              <button className="w-full mt-4 py-3 bg-[#BF3A20] text-white font-mono font-black uppercase tracking-widest border-2 border-[#8A2512] shadow-[2px_2px_0_0_rgba(138,37,18,1)] hover:bg-[#A32D15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                Nhận Đơn Ngay
              </button>
            );
          } else if (order.status === 'PREPARING') {
            ticketBorder = "border-[#C98F0A]";
            badgeColor = "bg-[#C98F0A] text-white border-[#C98F0A]";
            badgeText = "ĐANG CHUẨN BỊ";
            actionBtn = (
              <button className="w-full mt-4 py-3 bg-[#C98F0A] text-white font-mono font-black uppercase tracking-widest border-2 border-[#966905] shadow-[2px_2px_0_0_rgba(150,105,5,1)] hover:bg-[#B37E07] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                Giao Hàng
              </button>
            );
          } else if (order.status === 'COMPLETED') {
            ticketBorder = "border-emerald-700";
            badgeColor = "bg-emerald-700 text-white border-emerald-700";
            badgeText = "HOÀN THÀNH";
          } else if (order.status === 'CANCELLED') {
            ticketBorder = "border-neutral-500";
            badgeColor = "bg-neutral-500 text-white border-neutral-500";
            badgeText = "ĐÃ HỦY";
          }

          return (
            <div key={order.id} className={`bg-[#FEFCF9] border-4 ${ticketBorder} p-0 flex flex-col relative shadow-[8px_8px_0_0_rgba(30,25,21,1)] group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_0_rgba(30,25,21,1)] transition-all`}>
              {/* Ticket Header */}
              <div className="p-4 border-b-4 border-dashed border-saigon-neutral-text bg-[#F4F1EA] flex justify-between items-center relative">
                {/* Jagged Edge effect top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=')] -mt-2"></div>
                
                <div>
                  <h3 className="font-mono font-black text-xl tracking-widest">{order.id}</h3>
                  <p className="font-mono text-[10px] text-saigon-neutral-subText">{order.time}</p>
                </div>
                <div className={`px-2 py-1 font-mono text-[10px] font-black uppercase border-2 ${badgeColor}`}>
                  {badgeText}
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-4 flex-grow">
                <p className="font-serif font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-saigon-neutral-text inline-block"></span>
                  {order.customer}
                </p>
                <ul className="space-y-2 mt-4 font-mono text-sm border-l-2 border-saigon-neutral-text pl-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ticket Footer */}
              <div className="p-4 border-t-4 border-saigon-neutral-text bg-[#F4F1EA] mt-auto">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-saigon-neutral-subText">Tổng cộng</span>
                  <span className="font-mono font-black text-2xl text-[#BF3A20]">{order.total.toLocaleString('vi-VN')} đ</span>
                </div>
                {actionBtn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorOrders;
