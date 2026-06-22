import React from 'react';
import { Star, Clock } from 'lucide-react';
import { RestaurantData } from '../../utils/mockData';

interface RestaurantCardProps {
  restaurant: RestaurantData;
  onClick?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card-retro bg-[#FEFCF9] flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-saigon-card-hover cursor-pointer group transition-all duration-200"
    >
      <div>
        {/* Aspect Ratio 16:9 Image Container with sepia(8%) filter */}
        <div className="aspect-video w-full bg-neutral-100 border border-neutral-900 overflow-hidden relative mb-4">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://placehold.co/600x400/FEFCF9/BF3A20?text=${encodeURIComponent(restaurant.name)}`;
            }}
            className="w-full h-full object-cover filter sepia-[8%] saturate-[110%] brightness-[98%] group-hover:scale-105 transition-all duration-300"
          />
          
          {/* Open / Closed Status Badge */}
          <div className="absolute top-2 left-2 z-10">
            {restaurant.isOpen ? (
              <span className="inline-flex items-center gap-1 bg-[#FEFCF9] text-emerald-800 text-[9px] font-mono font-black px-2 py-0.5 border border-emerald-300 rounded-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ĐANG MỞ CỬA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 text-[9px] font-mono font-black px-2 py-0.5 border border-neutral-300 rounded-sm">
                ĐÃ ĐÓNG CỬA
              </span>
            )}
          </div>
        </div>

        {/* Restaurant Name - font-display italic */}
        <h3 className="text-lg font-display italic font-bold mb-1.5 text-neutral-900 group-hover:text-[#BF3A20] transition-colors leading-snug">
          {restaurant.name}
        </h3>

        {/* Address */}
        <p className="text-xs text-neutral-500 line-clamp-1 mb-3 font-body">
          {restaurant.address}
        </p>
      </div>

      {/* Card Footer: Delivery Time, Fee & Star Rating */}
      <div className="border-t border-dashed border-neutral-200 pt-3 mt-4 flex items-center justify-between text-[11px] text-neutral-600">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 font-medium font-body">
            <Clock size={12} className="text-neutral-400" />
            {restaurant.deliveryTime}
          </span>
          <span className="font-mono text-neutral-500 font-bold">
            Ship: {Number(restaurant.deliveryFee).toLocaleString('vi-VN')}đ
          </span>
        </div>

        {/* Monospace Rating Badge with Star icon in #C98F0A */}
        <div className="flex items-center gap-1 font-mono font-bold bg-[#E9C46A]/20 px-2 py-0.5 border border-secondary-300 rounded-sm text-neutral-900">
          <Star size={12} fill="#C98F0A" className="text-[#C98F0A]" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
