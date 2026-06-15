import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

// ─── Config theo type ─────────────────────────────────────────
const TYPE_CONFIG = {
  info: {
    bg: 'bg-blue-600',
    border: 'border-blue-700',
    text: 'text-white',
    icon: Info,
    label: 'Thông báo',
  },
  warning: {
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    text: 'text-neutral-900',
    icon: AlertTriangle,
    label: 'Cảnh báo',
  },
  success: {
    bg: 'bg-green-600',
    border: 'border-green-700',
    text: 'text-white',
    icon: CheckCircle,
    label: 'Thông báo',
  },
  error: {
    bg: 'bg-red-600',
    border: 'border-red-700',
    text: 'text-white',
    icon: XCircle,
    label: '⚠️ Hệ thống',
  },
};

const SystemNoticeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ['system-notice-public'],
    queryFn: () => api.get('/system/notice'),
    // Refresh mỗi 30 giây để nhận thông báo mới từ admin nhanh hơn
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
  });

  const notice = (data as any)?.data;

  // Không hiển thị nếu: không có notice, đã đóng, hoặc không active
  if (!notice || !notice.isActive || !notice.message || dismissed) {
    return null;
  }

  const cfg = TYPE_CONFIG[notice.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`w-full ${cfg.bg} ${cfg.border} border-b-2 ${cfg.text} relative z-50`}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {/* Icon */}
        <Icon size={15} strokeWidth={2} className="flex-shrink-0 opacity-90" />

        {/* Label */}
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-75 flex-shrink-0">
          {cfg.label}
        </span>

        {/* Divider */}
        <span className="opacity-40 flex-shrink-0">|</span>

        {/* Message */}
        <p className="font-body text-sm flex-1 leading-snug">
          {notice.message}
        </p>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/10 rounded transition-all"
          aria-label="Đóng thông báo"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SystemNoticeBanner;
