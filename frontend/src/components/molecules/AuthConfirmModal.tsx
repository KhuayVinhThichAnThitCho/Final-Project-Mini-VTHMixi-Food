import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AlertCircle, LogIn, X } from 'lucide-react';

export const AuthConfirmModal: React.FC = () => {
  const navigate = useNavigate();
  const { showAuthModal, authModalRedirectPath, setShowAuthModal } = useAuthStore();

  if (!showAuthModal) return null;

  const handleConfirm = () => {
    setShowAuthModal(false);
    if (authModalRedirectPath) {
      sessionStorage.setItem('redirectAfterLogin', authModalRedirectPath);
    }
    navigate('/login', {
      state: {
        from: authModalRedirectPath || window.location.pathname,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="card-retro bg-[#FEFCF9] max-w-sm w-full border-2 border-neutral-900 p-6 flex flex-col gap-5 relative animate-zoom-in shadow-retro-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3 select-none">
          <div className="w-12 h-12 rounded-full bg-[#BF3A20]/10 border border-[#BF3A20]/30 flex items-center justify-center text-[#BF3A20]">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="font-display italic text-lg font-bold text-[#2C1A0E]">
              Yêu Cầu Đăng Nhập
            </h3>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
              [ Tính năng thành viên ]
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-neutral-700 text-center font-body leading-relaxed">
          Bạn cần đăng nhập tài khoản để thực hiện thêm món vào giỏ hàng và mua sắm tại GrabFood Mini.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setShowAuthModal(false)}
            className="flex-1 py-2 px-4 border-2 border-neutral-900 bg-white hover:bg-neutral-100 font-bold font-mono text-xs shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            ĐỂ SAU
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-4 border-2 border-neutral-900 bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-bold font-mono text-xs shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn size={13} />
            ĐĂNG NHẬP
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirmModal;
