import React from 'react';
import { ShoppingBag, MapPin, Menu, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';

interface NavbarProps {
  onMenuToggle?: () => void;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, cartCount = 0 }) => {
  return (
    <header className="sticky top-0 bg-saigon-neutral-surface border-b-2 border-saigon-neutral-text z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Nút Hamburger menu trên Mobile */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-1.5 border border-saigon-neutral-text/20 hover:bg-saigon-neutral-bg lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="bg-saigon-primary text-saigon-neutral-surface text-lg font-serif font-black px-2.5 py-0.5 border-2 border-saigon-neutral-text rotate-[-2deg] shadow-retro-sm">
              GRABFOOD
            </span>
            <span className="font-serif italic font-bold text-saigon-secondary text-sm hidden sm:inline">
              Mini
            </span>
          </div>
        </div>

        {/* Địa chỉ giao nhận */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-saigon-neutral-bg border border-saigon-neutral-border px-3 py-1.5">
          <MapPin size={14} className="text-saigon-primary" />
          <span className="font-semibold text-saigon-neutral-text">Chợ Bến Thành, Quận 1, Sài Gòn</span>
        </div>

        {/* Cụm chức năng */}
        <div className="flex items-center gap-4">
          {/* Smart Cart AI */}
          <Link to="/smart-cart" className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm">
            <Sparkles size={16} />
            <span className="hidden sm:inline text-sm font-bold">Trợ lý Mua sắm</span>
          </Link>

          {/* Giỏ hàng */}
          <Link to="/cart" className="relative p-2 hover:bg-saigon-neutral-bg transition-colors border border-transparent hover:border-saigon-neutral-border rounded-sm">
            <ShoppingBag size={20} className="text-saigon-neutral-text" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-saigon-primary text-saigon-neutral-surface text-[10px] font-mono font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-saigon-neutral-text">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login button */}
          <div className="flex items-center gap-2">
            <Button variant="retro" className="text-xs py-1 px-3">
              <span className="flex items-center gap-1">
                <User size={12} />
                Đăng Nhập
              </span>
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
