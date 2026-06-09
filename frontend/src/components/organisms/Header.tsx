import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';


interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery = '', setSearchQuery, cartCount = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[#FEFCF9] border-b border-[#E8D8C6] shadow-saigon-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        
        {/* Left: Logo "GrabFood Mini" */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-display italic font-bold text-2xl text-[#BF3A20] tracking-wide select-none">
            GrabFood Mini
          </span>
        </div>

        {/* Middle: Search Bar */}
        <div className="flex-grow max-w-md relative hidden md:block">
          <div className="flex items-center bg-[#F0E9DE] rounded-lg px-3 py-1.5 border border-transparent focus-within:border-primary-600 transition-colors">
            <Search size={18} strokeWidth={1.5} className="text-neutral-500 mr-2" />
            <input
              type="text"
              placeholder="Tìm món ngon, quán xá, hẻm nhỏ Sài Gòn..."
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Cart Pill & Login / Account */}
        <div className="flex items-center gap-4">
          {/* Pill-shaped Cart Button (#BF3A20) */}
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 bg-[#BF3A20] hover:bg-[#D44B2F] text-white rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            <span>{cartCount > 0 ? `${cartCount} món` : 'Giỏ hàng'}</span>
          </button>

          {isAuthenticated ? (
            <div className="relative">
              {/* Dropdown Toggle Button */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn-retro text-xs py-1.5 px-4 bg-secondary-300 hover:bg-secondary-200 transition-colors flex items-center gap-1.5 cursor-pointer font-bold border-2 border-neutral-900 shadow-retro-sm"
              >
                <span>Tài Khoản</span>
                <span className="text-[9px] font-mono select-none">▼</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro py-1.5 z-50 rounded-sm font-mono text-xs">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-[#BF3A20]/5 hover:text-[#BF3A20] font-semibold transition-colors flex items-center gap-2"
                  >
                    <User size={13} strokeWidth={1.5} />
                    <span>Hồ Sơ Của Bạn</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/favorites');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-[#BF3A20]/5 hover:text-[#BF3A20] font-semibold transition-colors flex items-center gap-2"
                  >
                    <Heart size={13} strokeWidth={1.5} fill="#BF3A20" className="text-[#BF3A20]" />
                    <span>Quán Ruột Yêu Thích</span>
                  </button>
                  
                  <div className="border-t border-dashed border-neutral-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-[#BF3A20] hover:bg-[#BF3A20]/5 font-bold transition-colors flex items-center gap-2"
                  >
                    <LogOut size={13} strokeWidth={1.5} />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="btn-retro text-xs py-1.5 px-4 bg-secondary-300 hover:bg-secondary-200 transition-colors"
            >
              Đăng Nhập
            </button>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Header;
