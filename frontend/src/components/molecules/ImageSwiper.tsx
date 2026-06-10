import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageSwiperProps {
  images: string[];
  altText?: string;
}

export const ImageSwiper: React.FC<ImageSwiperProps> = ({ images, altText = 'Món ăn' }) => {
  // Nếu không có ảnh hoặc danh sách rỗng
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-neutral-200 border-2 border-neutral-900 flex items-center justify-center font-mono text-xs text-neutral-500/40">
        [ Không có hình ảnh hiển thị ]
      </div>
    );
  }

  return (
    <div className="w-full card-retro p-1 relative overflow-hidden bg-white select-none">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        className="h-64 md:h-80 food-image"
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
  );
};

export default ImageSwiper;
