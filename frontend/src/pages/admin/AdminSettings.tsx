import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Percent, CreditCard, Image, Bell,
  Save, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
  const freeDelivery = configs.find(c => c.key === 'free_delivery_threshold')?.value ?? 150000;

  const [fee, setFee] = useState<number>(platformFee);
  const [min, setMin] = useState<number>(minOrder);
  const [freeThreshold, setFreeThreshold] = useState<number>(freeDelivery);

  useEffect(() => {
    setFee(platformFee);
    setMin(minOrder);
    setFreeThreshold(freeDelivery);
  }, [platformFee, minOrder, freeDelivery]);

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

        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
            Ngưỡng miễn phí giao hàng
          </label>
          <input
            type="number" min={0} step={1000}
            value={freeThreshold}
            onChange={e => setFreeThreshold(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-900 focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p className="font-mono text-[10px] text-neutral-400 mt-1">Hiện tại: {formatVND(freeThreshold)}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-neutral-50 border border-neutral-200 p-3 flex gap-6 flex-wrap">
        <div className="font-mono text-xs text-neutral-500">
          Đơn <span className="font-bold text-neutral-800">100.000đ</span>
          {' → '}phí nền tảng: <span className="font-bold text-primary-600">{formatVND(100000 * fee / 100)}</span>
        </div>
        <div className="font-mono text-xs text-neutral-500">
          Đơn {' ≥ '}<span className="font-bold text-neutral-800">{formatVND(freeThreshold)}</span>
          {' → '}
          <span className="font-bold text-green-600">Miễn phí ship</span>
        </div>
      </div>

      <button
        onClick={() => onSave([
          { key: 'platform_fee', value: fee },
          { key: 'min_order_amount', value: min },
          { key: 'free_delivery_threshold', value: freeThreshold },
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

// ─── Banner Section ────────────────────────────────────────────
const BannerSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const banner = configs.find(c => c.key === 'homepage_banner')?.value ?? {};
  const [form, setForm] = useState({
    title: banner.title ?? '',
    subtitle: banner.subtitle ?? '',
    imageUrl: banner.imageUrl ?? '',
    linkUrl: banner.linkUrl ?? '',
    isActive: banner.isActive ?? true,
  });

  const bannerVal = configs.find(c => c.key === 'homepage_banner')?.value;
  const bannerValStr = JSON.stringify(bannerVal);

  useEffect(() => {
    if (bannerVal) setForm(bannerVal);
  }, [bannerValStr]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Tiêu đề banner</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="GrabFood Mini"
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Phụ đề</label>
          <input
            value={form.subtitle}
            onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
            placeholder="Đặt đồ ăn ngon, giao tận nơi"
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">URL hình ảnh</label>
          <input
            value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">URL liên kết</label>
          <input
            value={form.linkUrl}
            onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
            placeholder="https://..."
            className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
          className="accent-primary-600 w-4 h-4"
        />
        <span className="font-body text-sm text-neutral-700">Kích hoạt banner trang chủ</span>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
          form.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-neutral-100 text-neutral-500 border-neutral-300'
        }`}>
          {form.isActive ? 'Đang hiện' : 'Đang ẩn'}
        </span>
      </label>

      {/* Preview */}
      {(form.title || form.subtitle) && (
        <div className="border-2 border-dashed border-neutral-300 p-4 bg-neutral-50">
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">Preview</p>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Banner preview" className="w-full h-24 object-cover mb-2 border border-neutral-200" />
          )}
          <p className="font-display italic text-lg text-neutral-900">{form.title}</p>
          <p className="font-body text-sm text-neutral-500">{form.subtitle}</p>
        </div>
      )}

      <button
        onClick={() => onSave([{ key: 'homepage_banner', value: form }])}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm disabled:opacity-50 transition-all"
      >
        <Save size={14} />
        {isSaving ? 'Đang lưu...' : 'Lưu cấu hình banner'}
      </button>
    </div>
  );
};

// ─── System Notice Section ─────────────────────────────────────
const NoticeSection: React.FC<{
  configs: any[];
  onSave: (updates: { key: string; value: any }[]) => void;
  isSaving: boolean;
}> = ({ configs, onSave, isSaving }) => {
  const notice = configs.find(c => c.key === 'system_notice')?.value ?? {};
  const [form, setForm] = useState({
    message: notice.message ?? '',
    type: notice.type ?? 'info',
    isActive: notice.isActive ?? false,
  });

  const noticeVal = configs.find(c => c.key === 'system_notice')?.value;
  const noticeValStr = JSON.stringify(noticeVal);

  useEffect(() => {
    if (noticeVal) setForm(noticeVal);
  }, [noticeValStr]);

  const TYPES = [
    { value: 'info', label: 'Thông tin', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'warning', label: 'Cảnh báo', color: 'bg-secondary-100 text-secondary-800 border-secondary-300' },
    { value: 'success', label: 'Thành công', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'error', label: 'Lỗi / Bảo trì', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  const currentType = TYPES.find(t => t.value === form.type);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
          Nội dung thông báo
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Ví dụ: Hệ thống sẽ bảo trì từ 23:00 - 01:00 ngày 20/06..."
          className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm focus:outline-none focus:border-primary-500 resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Loại thông báo</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setForm(f => ({ ...f, type: t.value }))}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all ${
                form.type === t.value ? t.color + ' border-current' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
          className="accent-primary-600 w-4 h-4"
        />
        <span className="font-body text-sm text-neutral-700">Phát thông báo này đến toàn bộ người dùng</span>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
          form.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-neutral-100 text-neutral-500 border-neutral-300'
        }`}>
          {form.isActive ? 'Đang phát' : 'Đang tắt'}
        </span>
      </label>

      {/* Preview */}
      {form.message && (
        <div className={`flex items-start gap-3 p-3 border-2 ${currentType?.color}`}>
          <Bell size={14} className="flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm">{form.message}</p>
        </div>
      )}

      <button
        onClick={() => onSave([{ key: 'system_notice', value: form }])}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-primary-700 hover:bg-primary-500 shadow-retro-sm disabled:opacity-50 transition-all"
      >
        <Save size={14} />
        {isSaving ? 'Đang lưu...' : 'Lưu & Phát thông báo'}
      </button>
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
            subtitle="Phí thu trên đơn hàng, giá trị tối thiểu, ngưỡng miễn phí giao hàng"
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
