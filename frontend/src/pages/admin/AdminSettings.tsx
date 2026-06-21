import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Percent, CreditCard, Image, Bell,
  Save, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  Plus, Trash2, Edit2, Eye, EyeOff, Upload, Clock, Send, Power
} from 'lucide-react';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const backendBase = apiBaseUrl.replace('/api/v1', '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ─── Section Card ──────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon: Icon, title, subtitle, badge, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-neutral-50/60 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-primary-600 flex items-center justify-center border border-primary-700 flex-shrink-0">
          <Icon size={18} strokeWidth={1.5} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-neutral-900">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-300">
                {badge}
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-neutral-400 mt-0.5">{subtitle}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t-2 border-neutral-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
};

// ─── Fee Settings Section ──────────────────────────────────────
const FeeSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const platformFee = configs.find(c => c.key === 'platform_fee')?.value ?? 5;
  const minOrder = configs.find(c => c.key === 'min_order_amount')?.value ?? 20000;

  const [fee, setFee] = useState<number>(platformFee);
  const [min, setMin] = useState<number>(minOrder);

  useEffect(() => {
    setFee(platformFee);
    setMin(minOrder);
  }, [platformFee, minOrder]);

  return (
    <div className="space-y-5">
      {/* Platform fee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
            Phí nền tảng (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={50} step={0.5}
              value={fee}
              onChange={e => setFee(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-900 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <span className="font-mono text-sm text-neutral-500 flex-shrink-0">%</span>
          </div>
          <p className="font-mono text-[10px] text-neutral-400 mt-1">Phí thu trên mỗi đơn hàng hoàn thành</p>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
            Đơn hàng tối thiểu
          </label>
          <input
            type="number" min={0} step={1000}
            value={min}
            onChange={e => setMin(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-900 focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p className="font-mono text-[10px] text-neutral-400 mt-1">Hiện tại: {formatVND(min)}</p>
        </div>

      </div>

      {/* Preview */}
      <div className="bg-neutral-50 border border-neutral-200 p-3 flex gap-6 flex-wrap">
        <div className="font-mono text-xs text-neutral-500">
          Đơn <span className="font-bold text-neutral-800">100.000đ</span>
          {' → '}phí nền tảng: <span className="font-bold text-primary-600">{formatVND(100000 * fee / 100)}</span>
        </div>
      </div>

      <button
        onClick={() => onSave([
          { key: 'platform_fee', value: fee },
          { key: 'min_order_amount', value: min },
        ])}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm disabled:opacity-50 transition-all"
      >
        <Save size={14} />
        {isSaving ? 'Đang lưu...' : 'Lưu cấu hình phí'}
      </button>
    </div>
  );
};

// ─── Payment Methods Section ───────────────────────────────────
const PaymentSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const methods = configs.find(c => c.key === 'payment_methods')?.value ?? { COD: true, WALLET: true, POINTS: true };
  const [enabled, setEnabled] = useState(methods);
  const methodsStr = JSON.stringify(methods);

  useEffect(() => {
    setEnabled(methods);
  }, [methodsStr]);

  const PAYMENT_INFO = [
    { key: 'COD', label: 'Tiền mặt (COD)', desc: 'Thanh toán khi nhận hàng', icon: '💵' },
    { key: 'WALLET', label: 'Ví điện tử', desc: 'Thanh toán qua ví tài khoản', icon: '👛' },
    { key: 'POINTS', label: 'Điểm thưởng', desc: 'Dùng điểm tích lũy để thanh toán', icon: '⭐' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAYMENT_INFO.map(p => (
          <label
            key={p.key}
            className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
              enabled[p.key] ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-neutral-50'
            }`}
          >
            <input
              type="checkbox"
              checked={!!enabled[p.key]}
              onChange={e => setEnabled((prev: any) => ({ ...prev, [p.key]: e.target.checked }))}
              className="mt-0.5 accent-primary-600"
            />
            <div>
              <p className="font-body text-sm font-semibold text-neutral-900">{p.icon} {p.label}</p>
              <p className="font-mono text-xs text-neutral-500 mt-0.5">{p.desc}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                enabled[p.key] ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-600 border-red-200'
              }`}>
                {enabled[p.key] ? 'Đang bật' : 'Đã tắt'}
              </span>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={() => onSave([{ key: 'payment_methods', value: enabled }])}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm disabled:opacity-50 transition-all"
      >
        <Save size={14} />
        {isSaving ? 'Đang lưu...' : 'Lưu phương thức thanh toán'}
      </button>
    </div>
  );
};

// ─── Banner Section (Multi-banner CRUD) ────────────────────────
const BannerSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const rawBanner = configs.find(c => c.key === 'homepage_banner')?.value ?? [];
  // Convert single object to array for backward compatibility
  const initialBanners = Array.isArray(rawBanner) 
    ? rawBanner 
    : Object.keys(rawBanner).length > 0 
      ? [{ id: 'banner_default', ...rawBanner }] 
      : [];

  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  const rawBannerStr = JSON.stringify(rawBanner);
  useEffect(() => {
    if (rawBanner) {
      setBanners(Array.isArray(rawBanner) 
        ? rawBanner 
        : Object.keys(rawBanner).length > 0 
          ? [{ id: 'banner_default', ...rawBanner }] 
          : []);
    }
  }, [rawBannerStr]);

  const handleAdd = () => {
    setEditingBanner({
      id: 'banner_' + Date.now(),
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
    });
  };

  const handleEdit = (banner: any) => {
    setEditingBanner({ ...banner });
  };

  const handleDelete = (id: string) => {
    const nextBanners = banners.filter(b => b.id !== id);
    setBanners(nextBanners);
    onSave([{ key: 'homepage_banner', value: nextBanners }]);
  };

  const handleSaveForm = () => {
    if (!editingBanner) return;
    let nextBanners;
    const exists = banners.some(b => b.id === editingBanner.id);
    if (exists) {
      nextBanners = banners.map(b => b.id === editingBanner.id ? editingBanner : b);
    } else {
      nextBanners = [...banners, editingBanner];
    }
    setBanners(nextBanners);
    setEditingBanner(null);
    onSave([{ key: 'homepage_banner', value: nextBanners }]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBanner) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBanner((prev: any) => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleBannerStatus = (id: string, currentStatus: boolean) => {
    const nextBanners = banners.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b);
    setBanners(nextBanners);
    onSave([{ key: 'homepage_banner', value: nextBanners }]);
  };

  return (
    <div className="space-y-6">
      {editingBanner ? (
        /* Form chỉnh sửa hoặc thêm mới */
        <div className="bg-[#FEFCF9] border-2 border-neutral-900 p-6 space-y-4 shadow-retro-sm">
          <h3 className="font-display italic text-lg text-neutral-900 border-b border-neutral-200 pb-2">
            {banners.some(b => b.id === editingBanner.id) ? 'Cập Nhật Banner' : 'Thêm Mới Banner'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">Tiêu đề banner</label>
              <input
                value={editingBanner.title}
                onChange={e => setEditingBanner((f: any) => ({ ...f, title: e.target.value }))}
                placeholder="GrabFood Mini"
                className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">Phụ đề</label>
              <input
                value={editingBanner.subtitle}
                onChange={e => setEditingBanner((f: any) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Đặt đồ ăn ngon, giao tận nơi"
                className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">Hình ảnh Banner (File upload)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-neutral-300 hover:border-neutral-900 cursor-pointer bg-neutral-50 transition-colors">
                  <Upload size={14} className="text-neutral-500" />
                  <span className="font-mono text-xs text-neutral-600 font-bold uppercase">Chọn file ảnh</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {editingBanner.imageUrl && (
                  <span className="font-mono text-[10px] text-green-600 font-bold uppercase bg-green-50 px-2 py-1 border border-green-200">Đã chọn ảnh</span>
                )}
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">Đường dẫn liên kết (Link URL)</label>
              <input
                value={editingBanner.linkUrl}
                onChange={e => setEditingBanner((f: any) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editingBanner.isActive}
              onChange={e => setEditingBanner((f: any) => ({ ...f, isActive: e.target.checked }))}
              className="accent-primary-600 w-4 h-4"
            />
            <span className="font-body text-sm text-neutral-700 font-bold">Kích hoạt hiển thị</span>
          </label>

          {/* Live Preview */}
          {editingBanner.imageUrl && (
            <div className="border-2 border-dashed border-neutral-300 p-4 bg-neutral-50">
              <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">Live Preview</p>
              <div className="relative h-32 bg-neutral-900 overflow-hidden border border-neutral-200 rounded">
                <img src={getImageUrl(editingBanner.imageUrl)} alt="Preview" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/60 via-[#BF3A20]/40 to-[#2C1A0E]/60 z-10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 p-4 space-y-2">
                  {editingBanner.title && <p className="font-display italic text-lg font-bold text-white drop-shadow-md">{editingBanner.title}</p>}
                  {editingBanner.subtitle && <p className="font-body text-xs text-[#FEFCF9]/90 max-w-md">{editingBanner.subtitle}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end border-t border-neutral-200 pt-4">
            <button
              onClick={() => setEditingBanner(null)}
              className="px-4 py-2 border-2 border-neutral-200 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 text-neutral-600"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveForm}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm"
            >
              <Save size={14} />
              {isSaving ? 'Đang lưu...' : 'Lưu Banner'}
            </button>
          </div>
        </div>
      ) : (
        /* Danh sách Banners (CRUD grid) */
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-neutral-900 pb-2">
            <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest font-bold">Danh sách Banners ({banners.length})</p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-green-700 hover:bg-green-500 shadow-retro-sm active:translate-y-0.5 transition-all"
            >
              <Plus size={12} /> Thêm Banner mới
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-neutral-200 text-center bg-neutral-50">
              <p className="font-mono text-xs text-neutral-400">Chưa có banner nào được thêm. Hệ thống sẽ hiển thị ảnh mặc định Sài Gòn xưa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner, i) => (
                <div key={banner.id || i} className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-sm overflow-hidden flex flex-col justify-between">
                  {/* Banner Preview */}
                  <div className="relative h-24 bg-neutral-950 overflow-hidden">
                    {banner.imageUrl ? (
                      <img src={getImageUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 font-mono text-[10px] text-neutral-500">Không có ảnh</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/50 via-[#BF3A20]/30 to-[#2C1A0E]/50 z-10" />
                    <div className="absolute inset-0 flex flex-col justify-center p-3 z-20">
                      <p className="font-display italic text-sm font-bold text-white drop-shadow truncate">{banner.title || '—'}</p>
                      <p className="font-body text-[10px] text-[#FEFCF9]/80 truncate">{banner.subtitle || '—'}</p>
                    </div>
                    {/* Status Badge */}
                    <button
                      onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                      className={`absolute top-2 right-2 z-30 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase border-2 flex items-center gap-1 shadow-retro-sm ${
                        banner.isActive 
                          ? 'bg-green-600 border-green-700 text-white hover:bg-green-500' 
                          : 'bg-neutral-200 border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {banner.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                      {banner.isActive ? 'Đang bật' : 'Đang tắt'}
                    </button>
                  </div>

                  {/* Info and actions */}
                  <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-neutral-400 truncate max-w-[150px]" title={banner.linkUrl}>
                      🔗 {banner.linkUrl ? banner.linkUrl.replace(/^https?:\/\//, '') : 'Không có link'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-1 bg-white border border-neutral-300 text-neutral-600 hover:border-neutral-900"
                        title="Sửa banner"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-1 bg-white border border-red-200 text-red-600 hover:border-red-600"
                        title="Xóa banner"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── System Notice Section (CRUD with history) ────────────────
const NOTICE_TYPES = [
  { value: 'info', label: 'Thông tin', color: 'bg-blue-100 text-blue-700 border-blue-300', dotColor: 'bg-blue-500' },
  { value: 'warning', label: 'Cảnh báo', color: 'bg-secondary-100 text-secondary-800 border-secondary-300', dotColor: 'bg-amber-500' },
  { value: 'success', label: 'Thành công', color: 'bg-green-100 text-green-700 border-green-300', dotColor: 'bg-green-500' },
  { value: 'error', label: 'Lỗi / Bảo trì', color: 'bg-red-100 text-red-700 border-red-300', dotColor: 'bg-red-500' },
];

const NoticeSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const rawNotice = configs.find(c => c.key === 'system_notice')?.value;
  // Backward compatibility: convert legacy single object to array
  const initialNotices = rawNotice
    ? Array.isArray(rawNotice)
      ? rawNotice
      : rawNotice.message
        ? [{ id: 'notice_legacy', ...rawNotice, createdAt: new Date().toISOString() }]
        : []
    : [];

  const [notices, setNotices] = useState<any[]>(initialNotices);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);

  // Sync from server
  const rawStr = JSON.stringify(rawNotice);
  useEffect(() => {
    if (rawNotice) {
      setNotices(
        Array.isArray(rawNotice)
          ? rawNotice
          : rawNotice.message
            ? [{ id: 'notice_legacy', ...rawNotice, createdAt: new Date().toISOString() }]
            : []
      );
    }
  }, [rawStr]);

  const handleAdd = () => {
    setEditingNotice({
      id: 'notice_' + Date.now(),
      message: '',
      type: 'info',
      isActive: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleEdit = (notice: any) => {
    setEditingNotice({ ...notice });
  };

  const handleDelete = (id: string) => {
    const next = notices.filter(n => n.id !== id);
    setNotices(next);
    onSave([{ key: 'system_notice', value: next }]);
  };

  const handleSaveForm = (andActivate: boolean) => {
    if (!editingNotice || !editingNotice.message.trim()) return;
    const saving = { ...editingNotice, isActive: andActivate ? true : editingNotice.isActive };

    let next: any[];
    const exists = notices.some(n => n.id === saving.id);
    if (exists) {
      next = notices.map(n => n.id === saving.id ? saving : n);
    } else {
      next = [saving, ...notices];
    }

    // If activating this notice, deactivate all others
    if (saving.isActive) {
      next = next.map(n => n.id === saving.id ? n : { ...n, isActive: false });
    }

    // Keep max 20 notices
    if (next.length > 20) next = next.slice(0, 20);

    setNotices(next);
    setEditingNotice(null);
    onSave([{ key: 'system_notice', value: next }]);
  };

  const toggleNoticeActive = (id: string, currentActive: boolean) => {
    let next: any[];
    if (!currentActive) {
      // Activating this one → deactivate all others
      next = notices.map(n => ({ ...n, isActive: n.id === id }));
    } else {
      // Just deactivating this one
      next = notices.map(n => n.id === id ? { ...n, isActive: false } : n);
    }
    setNotices(next);
    onSave([{ key: 'system_notice', value: next }]);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const currentType = editingNotice ? NOTICE_TYPES.find(t => t.value === editingNotice.type) : null;

  return (
    <div className="space-y-6">
      {editingNotice ? (
        /* ─── Form soạn / sửa thông báo ─── */
        <div className="bg-[#FEFCF9] border-2 border-neutral-900 p-6 space-y-4 shadow-retro-sm">
          <h3 className="font-display italic text-lg text-neutral-900 border-b border-neutral-200 pb-2">
            {notices.some(n => n.id === editingNotice.id) ? 'Cập Nhật Thông Báo' : 'Soạn Thông Báo Mới'}
          </h3>

          <div>
            <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
              Nội dung thông báo
            </label>
            <textarea
              rows={3}
              value={editingNotice.message}
              onChange={e => setEditingNotice((f: any) => ({ ...f, message: e.target.value }))}
              placeholder="Ví dụ: Hệ thống sẽ bảo trì từ 23:00 - 01:00 ngày 20/06..."
              className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Loại thông báo</label>
            <div className="flex flex-wrap gap-2">
              {NOTICE_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setEditingNotice((f: any) => ({ ...f, type: t.value }))}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all ${
                    editingNotice.type === t.value ? t.color + ' border-current' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {editingNotice.message && (
            <div className={`flex items-start gap-3 p-3 border-2 ${currentType?.color}`}>
              <Bell size={14} className="flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm">{editingNotice.message}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end border-t border-neutral-200 pt-4">
            <button
              onClick={() => setEditingNotice(null)}
              className="px-4 py-2 border-2 border-neutral-200 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 text-neutral-600"
            >
              Hủy
            </button>
            <button
              onClick={() => handleSaveForm(false)}
              disabled={isSaving || !editingNotice.message.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-neutral-800 hover:bg-neutral-600 shadow-retro-sm disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              onClick={() => handleSaveForm(true)}
              disabled={isSaving || !editingNotice.message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm disabled:opacity-50"
            >
              <Send size={14} />
              {isSaving ? 'Đang phát...' : 'Lưu & Phát ngay'}
            </button>
          </div>
        </div>
      ) : (
        /* ─── Danh sách lịch sử thông báo ─── */
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-neutral-900 pb-2">
            <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest font-bold">
              Lịch sử thông báo ({notices.length})
            </p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-green-700 hover:bg-green-500 shadow-retro-sm active:translate-y-0.5 transition-all"
            >
              <Plus size={12} /> Soạn thông báo mới
            </button>
          </div>

          {notices.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-neutral-200 text-center bg-neutral-50">
              <Bell size={24} className="mx-auto text-neutral-300 mb-2" />
              <p className="font-mono text-xs text-neutral-400">Chưa có thông báo nào. Nhấn "Soạn thông báo mới" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notices.map((notice: any, i: number) => {
                const typeInfo = NOTICE_TYPES.find(t => t.value === notice.type) || NOTICE_TYPES[0];
                return (
                  <div
                    key={notice.id || i}
                    className={`bg-[#FEFCF9] border-2 ${
                      notice.isActive ? 'border-green-500 shadow-retro-sm' : 'border-neutral-200'
                    } p-4 flex items-start gap-4 transition-all`}
                  >
                    {/* Status dot */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${notice.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-300'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {notice.isActive && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-green-100 text-green-700 border border-green-300">
                            ● Đang phát
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 ml-auto">
                          <Clock size={10} />
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>
                      <p className="font-body text-sm text-neutral-800 line-clamp-2">{notice.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleNoticeActive(notice.id, notice.isActive)}
                        title={notice.isActive ? 'Tắt phát' : 'Bật phát'}
                        className={`p-1.5 border font-mono text-[9px] font-bold uppercase flex items-center gap-1 transition-all ${
                          notice.isActive
                            ? 'bg-green-600 border-green-700 text-white hover:bg-green-500'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:border-neutral-400'
                        }`}
                      >
                        <Power size={12} />
                      </button>
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-1.5 bg-white border border-neutral-300 text-neutral-600 hover:border-neutral-900 transition-all"
                        title="Sửa"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 bg-white border border-red-200 text-red-600 hover:border-red-600 transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-system-configs'],
    queryFn: () => adminApi.getSystemConfigs(),
  });

  const configs: any[] = (data as any)?.data || [];

  const saveMutation = useMutation({
    mutationFn: (updates: { key: string; value: any }[]) =>
      adminApi.batchUpdateConfigs(updates),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-configs'] });
      queryClient.invalidateQueries({ queryKey: ['system-notice-public'] });
      setToast({ msg: (res as any)?.message || 'Đã lưu cấu hình thành công!', type: 'success' });
      setTimeout(() => setToast(null), 4000);
    },
    onError: (err: any) => {
      setToast({ msg: err?.message || 'Có lỗi xảy ra khi lưu.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    },
  });

  const handleSave = (updates: { key: string; value: any }[]) => {
    saveMutation.mutate(updates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-07</p>
          <h1 className="font-display italic text-3xl text-neutral-900">Cấu Hình Hệ Thống</h1>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-neutral-200 font-mono text-xs text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3 border-2 shadow-retro font-mono text-xs font-bold transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-red-50 border-red-400 text-red-700'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
            : <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          }
          <p>{toast.msg}</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <p className="font-body text-sm font-semibold text-red-700">Không tải được cấu hình</p>
            <p className="font-mono text-xs text-red-500 mt-0.5">Kiểm tra kết nối backend và thử làm mới.</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto px-3 py-1.5 border border-red-300 text-red-600 font-mono text-xs hover:bg-red-100">
            Thử lại
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 border-2 border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* A-07-1: Phí nền tảng */}
          <SectionCard
            icon={Percent}
            title="Cấu hình Phí nền tảng"
            subtitle="Phí thu trên đơn hàng, giá trị tối thiểu"
            badge="Phí"
          >
            <FeeSection configs={configs} onSave={handleSave} isSaving={saveMutation.isPending} />
          </SectionCard>

          {/* A-07-2: Phương thức thanh toán */}
          <SectionCard
            icon={CreditCard}
            title="Phương thức Thanh toán"
            subtitle="Bật/tắt các phương thức thanh toán trên toàn nền tảng"
            badge="Thanh toán"
          >
            <PaymentSection configs={configs} onSave={handleSave} isSaving={saveMutation.isPending} />
          </SectionCard>

          {/* A-07-3: Banner trang chủ */}
          <SectionCard
            icon={Image}
            title="Banner Trang chủ"
            subtitle="Cấu hình banner hiển thị trên trang chủ cho người dùng"
            badge="Banner"
            defaultOpen={false}
          >
            <BannerSection configs={configs} onSave={handleSave} isSaving={saveMutation.isPending} />
          </SectionCard>

          {/* A-07-4: Thông báo hệ thống */}
          <SectionCard
            icon={Bell}
            title="Thông báo Hệ thống"
            subtitle="Phát thông báo khẩn cấp hoặc bảo trì đến toàn bộ người dùng"
            badge="Thông báo"
            defaultOpen={false}
          >
            <NoticeSection configs={configs} onSave={handleSave} isSaving={saveMutation.isPending} />
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
