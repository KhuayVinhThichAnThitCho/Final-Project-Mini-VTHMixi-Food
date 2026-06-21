import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ShoppingBag,
  Tag,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Sparkles,
  Package,
  Truck,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
export type NotificationType = 'order' | 'promo' | 'system' | 'review';

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string; // relative string, e.g. "2 phút trước"
  isRead: boolean;
  actionUrl?: string;
  meta?: {
    orderStatus?: 'pending' | 'preparing' | 'shipping' | 'delivered';
    promoCode?: string;
    discount?: string;
  };
}

// ─── Mock Notifications ──────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Đơn hàng đang được giao',
    message: 'Tài xế Minh Tùng đang trên đường giao đơn #DH2024 của bạn. Dự kiến 15 phút nữa.',
    time: '3 phút trước',
    isRead: false,
    actionUrl: '/checkout',
    meta: { orderStatus: 'shipping' },
  },
  {
    id: 'n2',
    type: 'promo',
    title: '🎉 Voucher mới dành cho bạn!',
    message: 'Nhập mã HUNGRY30 để được giảm 30% cho đơn hàng tiếp theo. Hạn dùng: hôm nay.',
    time: '1 giờ trước',
    isRead: false,
    actionUrl: '/menu',
    meta: { promoCode: 'HUNGRY30', discount: '30%' },
  },
  {
    id: 'n3',
    type: 'order',
    title: 'Đơn hàng đã hoàn thành ✓',
    message: 'Đơn #DH2023 – Bún Bò Huế Mệ Loan đã được giao thành công. Cảm ơn bạn đã tin tưởng!',
    time: '2 giờ trước',
    isRead: true,
    actionUrl: '/checkout',
    meta: { orderStatus: 'delivered' },
  },
  {
    id: 'n4',
    type: 'promo',
    title: 'Flash Sale – Chỉ còn 2 tiếng!',
    message: 'Giảm đến 50% tất cả món từ Phở Thìn Lò Đúc. Đặt ngay trước 12:00!',
    time: '4 giờ trước',
    isRead: true,
    actionUrl: '/restaurants',
    meta: { discount: '50%' },
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Chào mừng bạn trở lại!',
    message: 'Bạn có 500 điểm tích luỹ chưa sử dụng. Dùng ngay để được giảm giá đơn hàng.',
    time: 'Hôm qua',
    isRead: true,
    actionUrl: '/profile',
  },
  {
    id: 'n6',
    type: 'order',
    title: 'Đang chuẩn bị món',
    message: 'Nhà hàng Cơm Tấm Thuận Kiều đang chuẩn bị đơn #DH2022 của bạn.',
    time: 'Hôm qua',
    isRead: true,
    meta: { orderStatus: 'preparing' },
  },
];

// ─── Tab Config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'order', label: 'Đơn hàng' },
  { id: 'promo', label: 'Khuyến mãi' },
] as const;

type TabId = 'all' | 'order' | 'promo';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTypeIcon = (noti: UserNotification) => {
  switch (noti.type) {
    case 'order':
      if (noti.meta?.orderStatus === 'shipping') return <Truck size={14} className="text-blue-500" />;
      if (noti.meta?.orderStatus === 'delivered') return <CheckCircle2 size={14} className="text-green-500" />;
      if (noti.meta?.orderStatus === 'preparing') return <Clock size={14} className="text-amber-500" />;
      return <Package size={14} className="text-[#BF3A20]" />;
    case 'promo':
      return <Tag size={14} className="text-purple-500" />;
    case 'system':
      return <Sparkles size={14} className="text-[#E9C46A]" />;
    default:
      return <Info size={14} className="text-blue-400" />;
  }
};

const getOrderStatusBadge = (status?: string) => {
  switch (status) {
    case 'shipping':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[9px] font-mono font-bold uppercase">
          <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
          Đang giao
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded text-[9px] font-mono font-bold uppercase">
          Đã giao
        </span>
      );
    case 'preparing':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[9px] font-mono font-bold uppercase">
          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          Chuẩn bị
        </span>
      );
    default:
      return null;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
interface UserNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserNotificationPanel: React.FC<UserNotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  
  const loadNotifications = (): UserNotification[] => {
    try {
      const stored = localStorage.getItem('user_notifications');
      const customNotis: UserNotification[] = stored ? JSON.parse(stored) : [];
      return [...customNotis, ...MOCK_NOTIFICATIONS];
    } catch (e) {
      console.error(e);
      return MOCK_NOTIFICATIONS;
    }
  };

  const updateStoredNotificationRead = (id: string, isRead: boolean) => {
    try {
      const stored = localStorage.getItem('user_notifications');
      if (!stored) return;
      const customNotis: UserNotification[] = JSON.parse(stored);
      const updated = customNotis.map(n => n.id === id ? { ...n, isRead } : n);
      localStorage.setItem('user_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const updateAllStoredNotificationsRead = () => {
    try {
      const stored = localStorage.getItem('user_notifications');
      if (!stored) return;
      const customNotis: UserNotification[] = JSON.parse(stored);
      const updated = customNotis.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('user_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [notifications, setNotifications] = useState<UserNotification[]>(loadNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark all as read when panel opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        updateAllStoredNotificationsRead();
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Listen for real-time notifications saved to localStorage
  useEffect(() => {
    const handleNewNoti = () => {
      setNotifications(loadNotifications());
    };
    window.addEventListener('new_notification', handleNewNoti);
    return () => window.removeEventListener('new_notification', handleNewNoti);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'order') return n.type === 'order';
    if (activeTab === 'promo') return n.type === 'promo' || n.type === 'system';
    return true;
  });

  const handleNotificationClick = (noti: UserNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );
    updateStoredNotificationRead(noti.id, true);
    if (noti.actionUrl) {
      navigate(noti.actionUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FEFCF9] border-2 border-neutral-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-[60] rounded-sm overflow-hidden font-body"
      style={{ animation: 'slideDownFade 0.18s ease-out' }}
    >
      {/* Panel Header */}
      <div className="bg-[#FAF7F3] border-b-2 border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={15} strokeWidth={2} className="text-[#BF3A20]" />
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-800">
            Thông báo
          </span>
          {unreadCount > 0 && (
            <span className="bg-[#BF3A20] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 rounded transition-colors"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-white">
        {TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? notifications.filter((n) => !n.isRead).length
              : tab.id === 'order'
              ? notifications.filter((n) => n.type === 'order' && !n.isRead).length
              : notifications.filter((n) => (n.type === 'promo' || n.type === 'system') && !n.isRead).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-[11px] font-mono font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#BF3A20] border-b-2 border-[#BF3A20] -mb-px'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-[#BF3A20] text-white text-[8px] font-bold rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2">📭</div>
            <p className="font-mono text-xs text-neutral-400">Không có thông báo nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredNotifications.map((noti) => (
              <button
                key={noti.id}
                onClick={() => handleNotificationClick(noti)}
                className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-[#FAF7F3] transition-colors group ${
                  !noti.isRead ? 'bg-[#FFF9F7]' : ''
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 border ${
                    !noti.isRead
                      ? 'bg-[#BF3A20]/10 border-[#BF3A20]/20'
                      : 'bg-neutral-100 border-neutral-200'
                  }`}
                >
                  {getTypeIcon(noti)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs leading-snug truncate ${
                        !noti.isRead ? 'font-bold text-neutral-800' : 'font-semibold text-neutral-600'
                      }`}
                    >
                      {noti.title}
                    </p>
                    {!noti.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#BF3A20] mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
                    {noti.message}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-mono text-neutral-400">{noti.time}</span>
                    {noti.meta?.orderStatus && getOrderStatusBadge(noti.meta.orderStatus)}
                    {noti.meta?.promoCode && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[9px] font-mono font-bold">
                        {noti.meta.promoCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                {noti.actionUrl && (
                  <ChevronRight
                    size={14}
                    className="flex-shrink-0 mt-1 text-neutral-300 group-hover:text-neutral-500 transition-colors"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 px-4 py-2.5 bg-white flex items-center justify-between">
        <button
          onClick={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            updateAllStoredNotificationsRead();
          }}
          className="text-[10px] font-mono text-neutral-400 hover:text-[#BF3A20] transition-colors"
        >
          Đánh dấu tất cả đã đọc
        </button>
        <button
          onClick={() => {
            navigate('/orders/history');
            onClose();
          }}
          className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#BF3A20] hover:underline transition-colors"
        >
          <ShoppingBag size={10} />
          Xem lịch sử
        </button>
      </div>

      <style>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8D8C6; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default UserNotificationPanel;
