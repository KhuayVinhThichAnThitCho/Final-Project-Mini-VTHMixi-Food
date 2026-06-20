import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, Bell, Info, AlertTriangle, CheckCircle, XCircle, Sparkles, Ticket } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import ConfirmModal from '../molecules/ConfirmModal';
import UserNotificationPanel from '../molecules/UserNotificationPanel';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';


interface HeaderProps {
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [hasNewNoti, setHasNewNoti] = useState(false);
  const [isUserNotiOpen, setIsUserNotiOpen] = useState(false);
  // Hiển thị badge thông báo chưa đọc cho user (mock: luôn có 2 chưa đọc khi mới login)
  const [userUnreadCount] = useState(2);

  const { data: noticeData, error: noticeError } = useQuery({
    queryKey: ['system-notice-public'],
    queryFn: () => api.get('/system/notice'),
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
  });

  const notice = (noticeData as any)?.data;

  useEffect(() => {
    console.log("🔔 Header SystemNotice Query:", { noticeData, noticeError, notice });
  }, [noticeData, noticeError, notice]);

  useEffect(() => {
    if (notice && notice.isActive && notice.message) {
      const lastRead = localStorage.getItem('lastReadSystemNotice');
      if (lastRead !== notice.message) {
        setHasNewNoti(true);
      } else {
        setHasNewNoti(false);
      }
    } else {
      setHasNewNoti(false);
    }
  }, [notice]);

  const handleOpenNoti = () => {
    setIsNotiOpen(!isNotiOpen);
    setIsDropdownOpen(false);
    setIsUserNotiOpen(false);
    if (notice && notice.message) {
      localStorage.setItem('lastReadSystemNotice', notice.message);
      setHasNewNoti(false);
    }
  };

  const handleOpenUserNoti = () => {
    setIsUserNotiOpen(!isUserNotiOpen);
    setIsNotiOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[9999] h-16 bg-[#FEFCF9] border-b border-[#E8D8C6] shadow-saigon-sm">
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



          {/* Smart Cart Assistant Button */}
          {isAuthenticated && user?.role === 'user' && (
            <button
              onClick={() => navigate('/smart-cart')}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Sparkles size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Trợ lý Mua sắm</span>
            </button>
          )}

          {/* Pill-shaped Cart Button */}
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 bg-[#BF3A20] hover:bg-[#D44B2F] text-white rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            <span>{cartCount > 0 ? `${cartCount} món` : 'Giỏ hàng'}</span>
          </button>

          {/* Manager / Admin Button */}
          {isAuthenticated && (user?.role === 'manager' || user?.role === 'admin') && (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/manager/dashboard')}
              className="btn-retro text-xs py-1.5 px-4 bg-secondary-100 hover:bg-secondary-200 transition-colors flex items-center gap-1.5 cursor-pointer font-bold border-2 border-neutral-900 shadow-retro-sm"
            >
              {user.role === 'admin' ? 'Trang Admin' : 'Trang Quản Lý'}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              {/* Dropdown Toggle Button */}
              <button 
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsNotiOpen(false);
                }}
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
                      navigate('/my-vouchers');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-[#BF3A20]/5 hover:text-[#BF3A20] font-semibold transition-colors flex items-center gap-2"
                  >
                    <Ticket size={13} strokeWidth={1.5} />
                    <span>Kho Voucher Của Bạn</span>
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

          {/* System Notification Bell */}
          <div className="relative">
            <button
              onClick={handleOpenNoti}
              className="relative flex items-center justify-center w-8 h-8 border-2 border-neutral-900 hover:border-[#BF3A20] bg-white rounded-sm text-neutral-850 hover:text-[#BF3A20] transition-all cursor-pointer shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              title="Thông báo hệ thống"
            >
              <Info size={14} strokeWidth={1.8} />
              {hasNewNoti && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white animate-pulse" />
              )}
            </button>

            {isNotiOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro z-[60] rounded-sm font-body text-xs overflow-hidden">
                <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between font-mono font-bold uppercase tracking-wider text-neutral-700">
                  <span>📢 Thông báo hệ thống</span>
                </div>
                <div className="p-3 max-h-64 overflow-y-auto space-y-2.5">
                  {notice && notice.isActive && notice.message ? (
                    <div className={`p-3 border rounded-sm flex gap-2.5 items-start ${
                      notice.type === 'warning' ? 'bg-amber-50 border-amber-200 text-neutral-800' :
                      notice.type === 'error' ? 'bg-red-50 border-red-200 text-neutral-800' :
                      notice.type === 'success' ? 'bg-green-50 border-green-200 text-neutral-800' :
                      'bg-blue-50 border-blue-200 text-neutral-800'
                    }`}>
                      <span className="mt-0.5 flex-shrink-0">
                        {notice.type === 'warning' ? <AlertTriangle size={14} className="text-amber-600" /> :
                         notice.type === 'error' ? <XCircle size={14} className="text-red-600" /> :
                         notice.type === 'success' ? <CheckCircle size={14} className="text-green-600" /> :
                         <Info size={14} className="text-blue-600" />}
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          {notice.type === 'warning' ? 'Cảnh báo' :
                           notice.type === 'error' ? 'Hệ thống bảo trì' :
                           notice.type === 'success' ? 'Thành công' :
                           'Tin tức'}
                        </p>
                        <p className="text-xs leading-normal">{notice.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-neutral-400 font-mono">
                      <p className="text-lg mb-1">📭</p>
                      <p>Không có thông báo mới.</p>
                      {noticeError && (
                        <p className="text-[10px] text-red-500 mt-2 bg-red-50 border border-red-200 p-2 rounded-sm select-all">
                          Lỗi: {(noticeError as any)?.message || noticeError.toString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Personal Notification Bell – chỉ hiện khi đã đăng nhập */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={handleOpenUserNoti}
                className="relative flex items-center justify-center w-8 h-8 border-2 border-neutral-900 hover:border-[#BF3A20] bg-white rounded-sm text-neutral-850 hover:text-[#BF3A20] transition-all cursor-pointer shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                title="Thông báo của bạn"
                id="user-notification-bell"
              >
                <Bell size={14} strokeWidth={1.8} />
                {userUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#BF3A20] text-white text-[8px] font-mono font-bold rounded-full border border-white flex items-center justify-center px-0.5 animate-bounce">
                    {userUnreadCount}
                  </span>
                )}
              </button>

              <UserNotificationPanel
                isOpen={isUserNotiOpen}
                onClose={() => setIsUserNotiOpen(false)}
              />
            </div>
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
