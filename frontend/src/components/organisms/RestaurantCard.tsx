import React from 'react';
import { Star, MapPin } from 'lucide-react';
import BadgeStamp from '../atoms/BadgeStamp';

export interface RestaurantData {
  id: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  address: string;
  rating: number;
  tags?: string[];
}

interface RestaurantCardProps {
  restaurant: RestaurantData;
  onClick?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card-retro flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
    >
      <div>
        {/* Banner/Logo nhà hàng */}
        <div className="h-44 bg-saigon-neutral-border border border-saigon-neutral-text overflow-hidden relative mb-4">
          {restaurant.bannerUrl ? (
            <img
              src={restaurant.bannerUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-saigon-neutral-subText/30 font-mono text-xs">
              [Hình ảnh quán ăn]
            </div>
          )}

          {/* Tem nhãn nổi bật */}
          {restaurant.rating >= 4.5 && (
            <div className="absolute top-2 left-2 z-10">
              <BadgeStamp text="Bán chạy" variant="primary" />
            </div>
          )}
        </div>

        {/* Tên & Thể loại */}
        <h3 className="text-xl font-bold mb-1.5 group-hover:text-saigon-primary transition-colors">
          {restaurant.name}
        </h3>

        {/* Nhãn tag thể loại món ăn */}
        {restaurant.tags && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-saigon-neutral-text/20 bg-saigon-neutral-bg text-saigon-neutral-subText"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thông tin chân card: Địa chỉ & Đánh giá */}
      <div className="border-t border-dashed border-saigon-neutral-border pt-3 mt-4 flex items-center justify-between text-xs text-saigon-neutral-subText">
        <div className="flex items-center gap-1 max-w-[70%]">
          <MapPin size={12} className="flex-shrink-0 text-saigon-primary" />
          <span className="truncate">{restaurant.address}</span>
        </div>

        <div className="flex items-center gap-0.5 font-mono font-bold bg-[#E9C46A]/20 px-1.5 py-0.5 border border-saigon-secondary/30 rounded-sm">
          <Star size={12} fill="#C98F0A" className="text-saigon-secondary" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
