import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <section className="relative min-h-[500px] flex items-center justify-center text-center px-4 overflow-hidden bg-neutral-950">
      
      {/* Blurred Saigon street food background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-[1.5px]"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80')" 
        }}
      ></div>

      {/* Warm vintage gradient overlay (nâu/đỏ gạch) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/80 via-[#BF3A20]/60 to-[#2C1A0E]/80 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-10"></div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-secondary-300 text-neutral-900 text-[10px] font-mono font-bold px-3 py-1 border border-neutral-900 uppercase tracking-widest rotate-[-1.5deg] shadow-retro-sm mx-auto select-none">
          <Sparkles size={10} />
          Mở hẻm ẩm thực xưa
        </div>

        {/* Playfair Display Italic, text-3xl (responsive up to text-5xl for desktop) */}
        <h1 className="text-3xl md:text-5xl font-display italic font-bold text-white leading-tight drop-shadow-lg">
          Từ bếp nhà đến tay bạn —<br />
          <span className="text-secondary-300">nhanh như xe ôm đường Bùi Viện</span>
        </h1>

        {/* Be Vietnam Pro, off-white/85% */}
        <p className="text-[#FEFCF9]/85 font-body text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Hương vị nguyên bản từ gầm cầu, đầu hẻm, góc chợ Sài Gòn xưa. Những món ăn mang cả hồn thành phố đang chờ bạn đặt.
        </p>

        {/* Search Bar in Hero */}
        <div className="flex max-w-md mx-auto border-2 border-neutral-900 shadow-retro bg-[#FEFCF9] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-retro-sm transition-all mt-8">
          <input
            type="text"
            placeholder="Nhập tên món ăn hẻm nhỏ hoặc quán ngon..."
            className="w-full bg-transparent px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-[#BF3A20] text-white px-5 flex items-center justify-center border-l-2 border-neutral-900 hover:bg-[#D44B2F] transition-colors">
            <Search size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
