import React, { useState } from 'react';
import { Star, MessageSquare, Reply, AlertTriangle } from 'lucide-react';

export const VendorReviews: React.FC = () => {
  const reviews = [
    { id: 'REV-01', user: 'Nguyễn Văn A', item: 'Hủ tiếu mì sườn', rating: 5, date: '22/05/2026', content: 'Mì ngon, sườn mềm, nước dùng rất đậm đà. Sẽ ủng hộ quán dài dài.', reply: null },
    { id: 'REV-02', user: 'Trần Thị B', item: 'Xí quách tô đặc biệt', rating: 4, date: '21/05/2026', content: 'Ngon nhưng nước dùng hơi mặn một chút.', reply: 'Cảm ơn bạn đã góp ý. Quán sẽ điều chỉnh lại công thức ạ.' },
    { id: 'REV-03', user: 'Lê Văn C', item: 'Cà phê sữa đá', rating: 1, date: '20/05/2026', content: 'Cà phê bị chua, uống không ngon.', reply: null },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Quản Lý Đánh Giá</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1 flex items-center gap-2">
            <MessageSquare size={16} /> Theo dõi và phản hồi đánh giá của khách hàng
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)] text-center py-8 relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#C98F0A]"></div>
          <p className="text-sm font-mono font-bold uppercase tracking-widest text-saigon-neutral-subText">Đánh Giá Trung Bình</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-5xl font-black text-saigon-primary">4.8</span>
            <div className="flex text-[#C98F0A]">
              <Star size={28} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)] text-center py-8 relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-saigon-neutral-text"></div>
          <p className="text-sm font-mono font-bold uppercase tracking-widest text-saigon-neutral-subText">Tổng Đánh Giá</p>
          <p className="text-5xl font-black text-saigon-neutral-text mt-4 tracking-tighter">1,248</p>
        </div>
        <div className="bg-[#FDE8E8] border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)] text-center py-8 relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#BF3A20]"></div>
          <p className="text-sm font-mono font-bold uppercase tracking-widest text-saigon-neutral-subText">Chưa Phản Hồi</p>
          <p className="text-5xl font-black text-[#BF3A20] mt-4 tracking-tighter">12</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mt-10">
        <h3 className="font-black text-2xl uppercase border-b-4 border-saigon-neutral-text pb-4 flex items-center gap-3">
          <MessageSquare size={24} /> Đánh Giá Mới Nhất
        </h3>
        
        {reviews.map(review => (
          <div key={review.id} className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[6px_6px_0_0_rgba(30,25,21,1)] p-0 relative flex flex-col md:flex-row transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(30,25,21,1)] group">
            {/* Left Col - Rating & Meta */}
            <div className="p-6 border-b-4 md:border-b-0 md:border-r-4 border-dashed border-saigon-neutral-text bg-[#F4F1EA] md:w-64 shrink-0 flex flex-col justify-center items-center md:items-start text-center md:text-left">
              <div className="flex text-[#C98F0A] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-neutral-300'} />
                ))}
              </div>
              <span className="font-bold text-lg text-saigon-neutral-text uppercase">{review.user}</span>
              <span className="text-xs font-mono text-saigon-neutral-subText mt-1 font-bold">{review.date}</span>
              <span className="text-[10px] font-mono font-black uppercase bg-[#E8D8C6] px-2 py-1 border-2 border-saigon-neutral-text mt-3 text-center w-full truncate" title={review.item}>
                {review.item}
              </span>
            </div>
            
            {/* Right Col - Content & Actions */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <p className="text-saigon-neutral-text text-lg italic font-serif mb-6 leading-relaxed">
                "{review.content}"
              </p>

              {/* Reply Section */}
              {review.reply ? (
                <div className="bg-[#E8F5E9] p-4 border-4 border-emerald-800 relative shadow-[4px_4px_0_0_rgba(6,78,59,1)]">
                  <span className="absolute -top-3 left-4 bg-emerald-800 text-white px-2 py-0.5 text-[10px] font-mono font-black uppercase">Phản hồi của quán</span>
                  <p className="text-emerald-900 font-bold mt-1">{review.reply}</p>
                </div>
              ) : (
                <div className="flex gap-4 border-t-2 border-dashed border-saigon-neutral-border pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-saigon-primary text-white text-sm font-mono font-black uppercase tracking-widest border-4 border-[#8A2512] shadow-[4px_4px_0_0_rgba(138,37,18,1)] hover:bg-[#A32D15] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all">
                    <Reply size={18} /> Trả Lời
                  </button>
                  {review.rating <= 3 && (
                    <button className="flex items-center gap-2 px-4 py-3 bg-[#FEFCF9] text-neutral-600 border-4 border-saigon-neutral-text shadow-[4px_4px_0_0_rgba(30,25,21,1)] hover:border-[#BF3A20] hover:text-[#BF3A20] text-sm font-mono font-black uppercase transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
                      <AlertTriangle size={18} /> Báo Cáo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorReviews;
