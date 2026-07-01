import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed z-[9999] top-4 right-4 flex flex-col gap-3 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((toast) => {
          let iconColor = 'text-[#C98F0A]'; // default accent yellow
          let borderAccent = 'border-l-4 border-l-[#C98F0A]';
          let IconComponent = Info;
          
          if (toast.type === 'success') {
            iconColor = 'text-green-600';
            borderAccent = 'border-l-4 border-l-green-600';
            IconComponent = CheckCircle;
          } else if (toast.type === 'error') {
            iconColor = 'text-[#BF3A20]'; // Saigon red
            borderAccent = 'border-l-4 border-l-[#BF3A20]';
            IconComponent = XCircle;
          } else if (toast.type === 'warning') {
            iconColor = 'text-[#C98F0A]'; // Saigon yellow
            borderAccent = 'border-l-4 border-l-[#C98F0A]';
            IconComponent = AlertTriangle;
          } else if (toast.type === 'info') {
            iconColor = 'text-blue-500';
            borderAccent = 'border-l-4 border-l-blue-500';
            IconComponent = Info;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-sm rounded-sm animate-toast-in w-full ${borderAccent}`}
              role="alert"
            >
              <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                <IconComponent size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-bold text-neutral-900 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-900 transition-colors p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
