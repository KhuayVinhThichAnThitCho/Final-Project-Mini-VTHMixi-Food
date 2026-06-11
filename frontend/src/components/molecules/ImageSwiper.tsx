import React, { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

interface ImageSwiperProps {
  images: string[];
  altText?: string;
}

export const ImageSwiper: React.FC<ImageSwiperProps> = ({ images, altText = 'Món ăn' }) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Nếu không có ảnh hoặc danh sách rỗng
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-neutral-200 border-2 border-neutral-900 flex items-center justify-center font-mono text-xs text-neutral-500/40">
        [ Không có hình ảnh hiển thị ]
      </div>
    );
  }

  return (
    <div className="w-full select-none space-y-3">
      {/* ── Ảnh chính ── */}
      <div className="card-retro p-1 bg-white overflow-hidden">
        <Swiper
          onSwiper={setMainSwiper}
          modules={[FreeMode]}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-72 md:h-[380px]"
        >
          {images.map((imgUrl, index) => (
            <SwiperSlide key={index} className="w-full h-full">
              <img
                src={imgUrl || 'https://placehold.co/600x600/FAF7F3/2C1A0E?text=Sài+Gòn+90s'}
                alt={`${altText} - ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(altText)}`;
                }}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Thumbnail strip bên dưới (4 ảnh 1 hàng, khít hoàn toàn với chiều rộng ảnh chính) ── */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4 w-full mx-0">
          {images.slice(0, 4).map((imgUrl, index) => (
            <div
              key={index}
              onClick={() => {
                if (mainSwiper) {
                  mainSwiper.slideTo(index);
                }
              }}
              className={`
                aspect-square overflow-hidden border-2 cursor-pointer transition-all duration-150
                ${activeIndex === index
                  ? 'border-[#BF3A20] opacity-100 scale-[1.03]'
                  : 'border-neutral-300 opacity-60 hover:opacity-90 hover:border-neutral-500'
                }
              `}
            >
              <img
                src={imgUrl}
                alt={`thumb-${index + 1}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/100x100/FEFCF9/BF3A20?text=${index + 1}`;
                }}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Tên nhà hàng bên dưới ── */}
      <p className="text-center text-xs font-mono uppercase tracking-widest text-neutral-400 pt-1 select-none">
        ✿ {altText} ✿
      </p>
    </div>
  );
};

export default ImageSwiper;

