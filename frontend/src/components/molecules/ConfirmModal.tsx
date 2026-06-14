import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut, AlertTriangle, Info } from 'lucide-react';
import Button from '../atoms/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: 'logout' | 'alert' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác Nhận',
  cancelText = 'Hủy Bỏ',
  onConfirm,
  onCancel,
  icon = 'info',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setIsVisible(true);
    } else {
      timer = setTimeout(() => setIsVisible(false), 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'logout': return <LogOut size={24} />;
      case 'alert': return <AlertTriangle size={24} />;
      default: return <Info size={24} />;
    }
  };

  const modalContent = (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      <div 
        className={`bg-[#FEFCF9] texture-paper border-2 border-neutral-900 shadow-retro-lg max-w-sm w-full p-6 flex flex-col gap-5 relative transition-all duration-200 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3 select-none">
          <div className="w-12 h-12 rounded-full bg-[#BF3A20]/10 border border-[#BF3A20]/30 flex items-center justify-center text-[#BF3A20]">
            {renderIcon()}
          </div>
          <div>
            <h3 className="font-display italic text-lg font-bold text-[#2C1A0E]">
              {title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-neutral-700 text-center font-body leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-2 w-full">
          <Button 
            variant="retro" 
            onClick={onCancel}
            className="w-1/2 py-2 text-xs bg-neutral-200 text-neutral-800 border-neutral-400 hover:bg-neutral-300 shadow-none active:translate-x-0 active:translate-y-0"
          >
            {cancelText}
          </Button>
          <Button 
            variant="retro-primary" 
            onClick={onConfirm}
            className="w-1/2 py-2 text-xs bg-[#BF3A20] text-white hover:bg-[#A3301A]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
