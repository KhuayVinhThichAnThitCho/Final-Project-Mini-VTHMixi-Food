import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import ConfirmModal from '../molecules/ConfirmModal';


interface HeaderProps {
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[#FEFCF9] border-b border-[#E8D8C6] shadow-saigon-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        
        {/* Left: Logo "GrabFood Mini" */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-display italic font-bold text-2xl text-[#BF3A20] tracking-wide select-none">
            GrabFood Mini
          </span>
        </div>


        {/* Right: Search + Cart + Login */}
        <div className="flex items-center gap-3">

          {/* Search Button */}
          <button
            onClick={() => navigate('/search')}
            className="hidden sm:flex items-center gap-1.5 text-neutral-600 hover:text-[#BF3A20] border-2 border-neutral-300 hover:border-[#BF3A20] bg-white rounded-sm px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-sm"
            title="Tìm kiếm"
          >
            <Search size={13} strokeWidth={1.5} />
            <span>Tìm kiếm</span>
          </button>
          {/* Mobile search icon only */}
          <button
            onClick={() => navigate('/search')}
            className="sm:hidden flex items-center justify-center w-8 h-8 border-2 border-neutral-300 hover:border-[#BF3A20] bg-white rounded-sm text-neutral-600 hover:text-[#BF3A20] transition-all"
            title="Tìm kiếm"
          >
            <Search size={14} strokeWidth={1.5} />
          </button>

          {/* Pill-shaped Cart Button */}
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

                  
                  <div className="border-t border-dashed border-neutral-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setIsDropdownOpen(false);
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
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Đăng Xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmText="Đăng Xuất"
        cancelText="Hủy"
        icon="logout"
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
          navigate('/');
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Header;
