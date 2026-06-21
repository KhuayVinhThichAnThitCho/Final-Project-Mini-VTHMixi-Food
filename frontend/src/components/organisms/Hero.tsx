import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreMenu?: () => void;
  bannerConfig?: any | null; // Can be a single object or an array of objects
}

export const Hero: React.FC<HeroProps> = ({ searchQuery, setSearchQuery, onExploreMenu, bannerConfig }) => {
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const backendBase = apiBaseUrl.replace('/api/v1', '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Convert bannerConfig to list of active banners
  const rawBanners = bannerConfig ? (Array.isArray(bannerConfig) ? bannerConfig : [bannerConfig]) : [];
  const activeBanners = rawBanners.filter((b: any) => b.isActive && b.imageUrl);

  const hasBanners = activeBanners.length > 0;

  if (hasBanners) {
    return (
      <section className="relative min-h-[500px] flex flex-col justify-between items-center text-center overflow-hidden bg-neutral-950">
        {/* Background Swiper Slider */}
        <div className="absolute inset-0 z-0">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={activeBanners.length > 1}
            pagination={activeBanners.length > 1 ? { clickable: true } : false}
            loop={activeBanners.length > 1}
            className="w-full h-full"
          >
            {activeBanners.map((banner: any, index: number) => {
              const bgImage = getImageUrl(banner.imageUrl);
              return (
                <SwiperSlide key={banner.id || `slide-${index}`} className="relative w-full h-full min-h-[500px]">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                  ></div>
                  
                  {/* Warm vintage gradient overlay (nâu/đỏ gạch) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/60 via-[#BF3A20]/40 to-[#2C1A0E]/60 pointer-events-none z-10"></div>
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-10"></div>

                  {/* Hero Content inside slide */}
                  <div className="relative z-20 flex flex-col justify-center items-center h-full min-h-[500px] max-w-3xl mx-auto px-4 pt-16 pb-36 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-secondary-300 text-neutral-900 text-[10px] font-mono font-bold px-3 py-1 border border-neutral-900 uppercase tracking-widest rotate-[-1.5deg] shadow-retro-sm mx-auto mb-6 select-none">
                      <Sparkles size={10} />
                      Mở hẻm ẩm thực xưa
                    </div>

                    <h1 className="text-3xl md:text-5xl font-display italic font-bold text-white leading-tight drop-shadow-lg mb-4">
                      {banner.title || 'Từ bếp nhà đến tay bạn —'}
                    </h1>

                    <p className="text-[#FEFCF9]/85 font-body text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-4">
                      {banner.subtitle || 'Hương vị nguyên bản Sài Gòn xưa'}
                    </p>

                    {banner.linkUrl && (
                      <div className="pt-2">
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs font-bold uppercase tracking-wider text-secondary-300 hover:text-white border-b-2 border-secondary-300 hover:border-white pb-0.5 transition-all"
                        >
                          Xem chi tiết sản phẩm →
                        </a>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Global Floating Elements (Search & CTA) overlaying the slides statically at the bottom */}
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 pb-12 mt-auto">
          {/* Search Bar in Hero */}
          <div className="flex max-w-md mx-auto border-2 border-neutral-900 shadow-retro bg-[#FEFCF9] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-retro-sm transition-all">
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

          {/* CTA Button to Explore Menu Catalog */}
          {onExploreMenu && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={onExploreMenu}
                className="btn-retro bg-[#E9C46A] hover:bg-[#F3DC9E] text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 border-2 border-neutral-900 shadow-retro cursor-pointer transition-all active:scale-95 flex items-center gap-2"
              >
                <span>🍽️ Khám Phá Thực Đơn Trọn Vẹn</span>
                <span className="animate-pulse">👉</span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Fallback default Saigon-retro hero banner
  return (
    <section className="relative min-h-[500px] flex items-center justify-center text-center px-4 overflow-hidden bg-neutral-950">
      {/* Blurred Saigon street food background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url('/home_banner.png')` }}
      ></div>

      {/* Warm vintage gradient overlay (nâu/đỏ gạch) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/60 via-[#BF3A20]/40 to-[#2C1A0E]/60 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-10"></div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-secondary-300 text-neutral-900 text-[10px] font-mono font-bold px-3 py-1 border border-neutral-900 uppercase tracking-widest rotate-[-1.5deg] shadow-retro-sm mx-auto select-none">
          <Sparkles size={10} />
          Mở hẻm ẩm thực xưa
        </div>

        <h1 className="text-3xl md:text-5xl font-display italic font-bold text-white leading-tight drop-shadow-lg">
          Từ bếp nhà đến tay bạn —<br />
          <span className="text-secondary-300">nhanh như xe ôm đường Bùi Viện</span>
        </h1>

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

        {/* CTA Button to Explore Menu Catalog */}
        {onExploreMenu && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={onExploreMenu}
              className="btn-retro bg-[#E9C46A] hover:bg-[#F3DC9E] text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 border-2 border-neutral-900 shadow-retro cursor-pointer transition-all active:scale-95 flex items-center gap-2"
            >
              <span>🍽️ Khám Phá Thực Đơn Trọn Vẹn</span>
              <span className="animate-pulse">👉</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
