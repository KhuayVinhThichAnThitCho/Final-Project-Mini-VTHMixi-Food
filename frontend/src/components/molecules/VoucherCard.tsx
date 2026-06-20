import React from 'react';
import { Ticket, Truck, Clock, Check } from 'lucide-react';

export interface VoucherData {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  restaurantId?: string | null;
  restaurant?: {
    name: string;
    logo?: string | null;
  } | null;
}

interface VoucherCardProps {
  voucher: VoucherData;
  isCollected?: boolean;
  isUsed?: boolean;
  onCollect?: () => void;
  onUse?: () => void;
  loading?: boolean;
  compact?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  isCollected = false,
  isUsed = false,
  onCollect,
  onUse,
  loading = false,
  compact = false,
}) => {
  const isFreeship = voucher.code.toUpperCase().includes('SHIP') || voucher.code.toUpperCase().includes('FREE');
  const isRestaurant = !!voucher.restaurantId;

  // Quyết định màu sắc
  let themeColor = 'bg-[#BF3A20] text-white'; // Platform
  let badgeText = 'Toàn sàn';

  if (isFreeship) {
    themeColor = 'bg-[#2A9D8F] text-white'; // Freeship
    badgeText = 'Miễn phí vận chuyển';
  } else if (isRestaurant) {
    themeColor = 'bg-[#E9C46A] text-neutral-900'; // Restaurant
    badgeText = voucher.restaurant?.name || 'Nhà hàng';
  }

  const discountText =
    voucher.discountType === 'percentage'
      ? `${Number(voucher.discountValue)}%`
      : `${(Number(voucher.discountValue) / 1000)}k`;

  const minOrderText = `Đơn tối thiểu ${(Number(voucher.minOrderAmount) / 1000)}k`;
  const maxDiscountText =
    voucher.discountType === 'percentage' && voucher.maxDiscountAmount
      ? `Tối đa ${(Number(voucher.maxDiscountAmount) / 1000)}k`
      : null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (_) {
      return dateStr;
    }
  };

  const isExpired = new Date(voucher.endDate) < new Date();

  if (compact) {
    return (
      <div className="flex border-2 border-neutral-900 bg-white relative rounded-sm shadow-retro-sm overflow-hidden h-24 select-none animate-fade-in">
        {/* Left Side Tab */}
        <div className={`w-[28%] flex flex-col items-center justify-center text-center p-2 flex-shrink-0 ${themeColor}`}>
          {isFreeship ? <Truck size={20} /> : <Ticket size={20} />}
          <span className="font-mono font-black text-sm mt-0.5 tracking-tight">{discountText}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider opacity-90 leading-none mt-0.5">GIẢM</span>
        </div>

        {/* Vertical dotted cut stub line */}
        <div className="absolute left-[28%] top-0 bottom-0 border-l-2 border-dashed border-neutral-300 z-10">
          <div className="w-3.5 h-3.5 bg-neutral-50 rounded-full border-2 border-neutral-900 absolute -top-[9px] -left-[7px]" />
          <div className="w-3.5 h-3.5 bg-neutral-50 rounded-full border-2 border-neutral-900 absolute -bottom-[9px] -left-[7px]" />
        </div>

        {/* Right Side Content */}
        <div className="w-[72%] pl-4 pr-3 py-2 flex flex-col justify-between h-full bg-[#FEFCF9]">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-mono font-bold text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 px-1 py-0.5 rounded-sm select-all">
                {voucher.code}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 font-bold uppercase truncate max-w-[80px]">
                {badgeText}
              </span>
            </div>
            <p className="font-body font-bold text-xs text-neutral-900 mt-1 leading-tight">
              Giảm {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
            </p>
            <p className="text-[9px] font-mono font-semibold text-neutral-500 mt-0.5">
              {minOrderText} {maxDiscountText ? ` • ${maxDiscountText}` : ''}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-1 mt-1">
            <span className="text-[8px] font-mono text-neutral-400 flex items-center gap-0.5">
              <Clock size={8} /> HSD: {formatDate(voucher.endDate)}
            </span>
            {onUse && !isUsed && !isExpired && (
              <button
                onClick={(e) => { e.stopPropagation(); onUse(); }}
                className="text-[9px] font-mono font-bold text-[#BF3A20] hover:underline"
              >
                Dùng ngay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-2 border-neutral-900 bg-white relative rounded-sm shadow-retro overflow-hidden h-32 select-none hover:shadow-retro-md transition-shadow">
      {/* Left side */}
      <div className={`w-[25%] flex flex-col items-center justify-center text-center p-3 flex-shrink-0 ${themeColor}`}>
        {isFreeship ? (
          <Truck size={28} className="stroke-[1.5]" />
        ) : (
          <Ticket size={28} className="stroke-[1.5]" />
        )}
        <span className="font-mono font-black text-lg mt-1 leading-none tracking-tight">{discountText}</span>
        <span className="text-[9px] font-mono font-black uppercase tracking-widest opacity-85 mt-1">GIẢM</span>
      </div>

      {/* Ticket Cut Stub Separator */}
      <div className="absolute left-[25%] top-0 bottom-0 border-l-2 border-dashed border-neutral-300 z-10">
        <div className="w-4.5 h-4.5 bg-neutral-50 rounded-full border-2 border-neutral-900 absolute -top-[10px] -left-[9px]" />
        <div className="w-4.5 h-4.5 bg-neutral-50 rounded-full border-2 border-neutral-900 absolute -bottom-[10px] -left-[9px]" />
      </div>

      {/* Right side details */}
      <div className="w-[75%] pl-6 pr-4 py-3 flex flex-col justify-between h-full bg-[#FEFCF9]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-xs bg-neutral-100 border border-neutral-900 shadow-retro-sm text-neutral-850 px-2 py-0.5 rounded-sm select-all">
              {voucher.code}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider max-w-[120px] truncate">
              {isRestaurant ? `🏪 ${badgeText}` : `🎫 ${badgeText}`}
            </span>
          </div>
          
          <h4 className="font-body font-bold text-sm text-neutral-900 mt-2 leading-none">
            Mã giảm giá {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${Number(voucher.discountValue).toLocaleString('vi-VN')} đ`}
          </h4>
          
          <p className="text-[10px] font-mono font-bold text-[#7A5235] mt-1">
            {minOrderText} {maxDiscountText ? ` • ${maxDiscountText}` : ''}
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-dashed border-neutral-200 pt-2">
          <span className="text-[9px] font-mono text-neutral-450 flex items-center gap-1">
            <Clock size={10} /> Hạn sử dụng: {formatDate(voucher.endDate)}
          </span>

          {isUsed ? (
            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-sm select-none">
              Đã sử dụng
            </span>
          ) : isExpired ? (
            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-250 px-2.5 py-1 rounded-sm select-none">
              Hết hạn
            </span>
          ) : isCollected ? (
            <button
              onClick={onUse}
              className="px-4 py-1 text-[10px] font-mono font-bold border-2 border-neutral-900 bg-[#E9C46A] hover:bg-[#F2D17E] text-neutral-900 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1 rounded-sm"
            >
              <Check size={10} />
              Dùng ngay
            </button>
          ) : (
            <button
              onClick={onCollect}
              disabled={loading}
              className="px-4 py-1 text-[10px] font-mono font-bold border-2 border-neutral-900 bg-[#BF3A20] text-white hover:bg-[#D44B2F] shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 rounded-sm"
            >
              {loading ? 'Đang lưu...' : 'Lưu mã'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
