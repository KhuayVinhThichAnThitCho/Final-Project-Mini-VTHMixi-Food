import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownCircle,
  TrendingUp,
  Building,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Plus,
  X,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  BarChart3,
  Flame,
  Star,
} from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface WalletData {
  balance: number;
  pendingBalance: number;
}

interface PeriodStat {
  orders: number;
  earnings: number;
}

interface ChartPoint {
  date: string;
  earnings: number;
  orders: number;
}

interface TopItem {
  id: string;
  name: string;
  price: number;
  soldCount: number;
}

interface RestaurantStats {
  totalRevenue: number;
  totalOrders: number;
  today: PeriodStat;
  week: PeriodStat;
  month: PeriodStat;
  chartData: ChartPoint[];
  topMenuItems: TopItem[];
  ordersByStatus: { status: string; count: number }[];
}

const formatMoney = (amount: number) =>
  Number(amount).toLocaleString('vi-VN');


type Period = 'today' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hôm Nay',
  week: 'Tuần Này',
  month: 'Tháng Này',
};

// ──────────────────────────────────────────────
// Mini bar chart (pure CSS / SVG-free)
// ──────────────────────────────────────────────
const BarChart: React.FC<{ data: ChartPoint[] }> = ({ data }) => {
  const maxEarning = Math.max(...data.map(d => d.earnings), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-2 pt-12 relative">
      {data.map((d, i) => {
        const heightPct = maxEarning > 0 ? (d.earnings / maxEarning) * 100 : 0;
        const isHovered = hovered === i;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-lg pointer-events-none">
                <p className="text-emerald-300">{formatMoney(d.earnings)}đ</p>
                <p className="text-gray-400">{d.orders} đơn</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
              </div>
            )}

            {/* Bar */}
            <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
              <div
                className="w-8 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  background: isHovered
                    ? 'linear-gradient(to top, #16a34a, #22c55e)'
                    : d.earnings > 0
                      ? 'linear-gradient(to top, #15803d, #4ade80)'
                      : '#e5e7eb',
                  boxShadow: isHovered ? '0 0 8px rgba(74,222,128,0.4)' : 'none',
                }}
              />
            </div>

            {/* Date label */}
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight text-center leading-tight">
              {d.date.split(',')[0]}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}> = ({ icon, label, value, sub, accent = 'from-primary-50 to-primary-100' }) => (
  <div className={`relative bg-gradient-to-br ${accent} rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-500" />
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 relative">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1 relative">{sub}</p>}
  </div>
);

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export const VendorWallet: React.FC = () => {
  const [walletData, setWalletData]       = useState<WalletData | null>(null);
  const [stats, setStats]                 = useState<RestaurantStats | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [period, setPeriod]               = useState<Period>('week');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing]       = useState(false);
  const [depositError, setDepositError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletRes, restRes] = await Promise.all([
        vendorApi.getWalletBalance(),
        vendorApi.getMyRestaurant(),
      ]);
      setWalletData(walletRes?.data || { balance: 0, pendingBalance: 0 });

      if (restRes?.data?.id) {
        const statsRes = await vendorApi.getVendorStats(restRes.data.id);
        setStats(statsRes?.data || null);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin ví.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      setDepositError('Số tiền nạp phải lớn hơn 0.');
      return;
    }
    setDepositing(true);
    setDepositError(null);
    try {
      const res = await vendorApi.depositWallet(Number(depositAmount));
      setWalletData(res?.data || walletData);
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (err: any) {
      setDepositError(err?.message || 'Nạp tiền thất bại.');
    } finally {
      setDepositing(false);
    }
  };

  // ─── Loading skeleton ───
  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-9 w-56 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-40 bg-gray-200 rounded-2xl" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-72 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchAll} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  // Derived values
  const totalRevenue    = stats?.totalRevenue  || 0;
  const totalOrders     = stats?.totalOrders   || 0;
  const platformFee     = totalRevenue * 0.1;
  const netRevenue      = totalRevenue * 0.9;
  const periodData      = stats?.[period] || { orders: 0, earnings: 0 };
  const completedOrders = stats?.ordersByStatus?.find(s => s.status === 'completed')?.count || 0;
  const cancelledOrders = stats?.ordersByStatus?.find(s => s.status === 'cancelled')?.count || 0;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-3">
            <BarChart3 size={32} className="text-primary-500" />
            Ví &amp; Doanh Thu
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1.5">
            Tổng quan tài chính và phân tích hiệu suất kinh doanh
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCcw size={16} /> Làm Mới
        </button>
      </div>

      {/* ── Wallet + Revenue Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-3xl">
        {/* Wallet Card */}
        <div className="lg:col-span-3 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-2xl p-4 overflow-hidden shadow-modern">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -left-3 -bottom-3 w-14 h-14 bg-white/5 rounded-full" />

          <div className="relative flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Building size={13} /> Ví Điện Tử Quán
          </div>

          <div className="relative mb-3">
            <p className="text-primary-200 text-xs font-semibold mb-0.5">Số Dư Khả Dụng</p>
            <p className="font-mono text-4xl font-bold text-white tracking-tight">
              {formatMoney(walletData?.balance || 0)}<span className="text-xl text-primary-300 ml-1">đ</span>
            </p>
            {(walletData?.pendingBalance || 0) > 0 && (
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-white/10 text-primary-100 text-xs font-semibold rounded-lg backdrop-blur-sm border border-white/10">
                ⏳ Tạm giữ: {formatMoney(walletData?.pendingBalance || 0)} đ
              </div>
            )}
          </div>

          <div className="relative flex gap-2">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary-700 rounded-lg font-bold text-xs shadow-modern-sm hover:bg-primary-50 active:scale-[0.98] transition-all"
            >
              <Plus size={13} /> Nạp Tiền
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold text-xs hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm">
              <ArrowDownCircle size={13} /> Rút Tiền
            </button>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-modern-sm p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            <TrendingUp size={14} className="text-amber-500" />
            Tổng Kết Kinh Doanh
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-500">Doanh thu gộp</span>
              <span className="font-mono font-bold text-base text-gray-900">{formatMoney(totalRevenue)}đ</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-500">Chiết khấu sàn (10%)</span>
              <span className="font-mono font-bold text-base text-red-500">-{formatMoney(platformFee)}đ</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-500">Đơn hoàn thành</span>
              <span className="font-bold text-base text-emerald-600">{completedOrders} đơn</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm font-semibold text-gray-500">Đơn bị hủy</span>
              <span className="font-bold text-base text-red-500">{cancelledOrders} đơn</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Thực Nhận</span>
              <span className="font-mono font-bold text-2xl text-primary-600">{formatMoney(netRevenue)}đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Period Selector + Quick Stats ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Phân Tích Theo Kỳ</h2>
          <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-full shadow-sm w-fit">
            {(['today', 'week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 font-semibold text-xs rounded-full transition-all duration-200 ${
                  period === p
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Big earning card */}
          <div className="sm:col-span-2 relative bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-4 overflow-hidden shadow-modern">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp size={14} /> Doanh Thu — {PERIOD_LABELS[period]}
            </div>
            <p className="relative text-4xl font-bold text-white mb-1">
              {formatMoney(periodData.earnings)}<span className="text-xl text-emerald-300 ml-1">đ</span>
            </p>
            <p className="relative text-emerald-200 text-sm">
              {periodData.orders} đơn hoàn thành
            </p>
          </div>

          {/* Quick stat grid */}
          <div className="grid grid-rows-2 gap-4">
            <StatCard
              icon={<CheckCircle2 size={14} className="text-emerald-500" />}
              label="Đơn hoàn thành"
              value={`${completedOrders}`}
              sub="Tổng cộng"
              accent="from-emerald-50 to-emerald-100"
            />
            <StatCard
              icon={<ShoppingBag size={14} className="text-blue-500" />}
              label="Tổng đơn"
              value={`${totalOrders}`}
              sub="Đã tiếp nhận"
              accent="from-blue-50 to-blue-100"
            />
          </div>
        </div>
      </div>

      {/* ── Bar Chart 7 ngày ── */}
      {stats?.chartData && stats.chartData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <BarChart3 size={20} className="text-primary-600" />
              Biểu Đồ Doanh Thu 7 Ngày Qua
            </h3>
            <span className="text-xs text-gray-400 font-medium">Hover để xem chi tiết</span>
          </div>
          <BarChart data={stats.chartData} />
        </div>
      )}

      {/* ── Top 5 món bán chạy ── */}
      {stats?.topMenuItems && stats.topMenuItems.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-modern-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Top Món Bán Chạy</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.topMenuItems.map((item, idx) => {
              const maxSold = stats.topMenuItems[0]?.soldCount || 1;
              const pct = maxSold > 0 ? (item.soldCount / maxSold) * 100 : 0;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <span className="text-xl w-7 shrink-0 text-center">
                    {medals[idx] || <Star size={16} className="text-gray-300" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-orange-600 w-16 text-right shrink-0">
                        {item.soldCount} bán
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-gray-900 text-sm">{formatMoney(item.price)}đ</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Status Breakdown ── */}
      {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag size={20} className="text-primary-500" />
            <h3 className="font-bold text-gray-800">Phân Bổ Trạng Thái Đơn Hàng</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.ordersByStatus.map(s => {
              const colorMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
                completed:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
                cancelled:  { bg: 'bg-red-50',      text: 'text-red-700',     icon: <XCircle size={16} className="text-red-400" /> },
                pending:    { bg: 'bg-amber-50',     text: 'text-amber-700',   icon: <Loader2 size={16} className="text-amber-500" /> },
                preparing:  { bg: 'bg-blue-50',      text: 'text-blue-700',    icon: <ShoppingBag size={16} className="text-blue-500" /> },
                delivering: { bg: 'bg-purple-50',    text: 'text-purple-700',  icon: <ArrowDownCircle size={16} className="text-purple-500" /> },
              };
              const c = colorMap[s.status] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: null };
              const labelMap: Record<string, string> = {
                completed: 'Hoàn thành', cancelled: 'Đã hủy', pending: 'Chờ duyệt',
                confirmed: 'Đã duyệt', preparing: 'Đang nấu', ready: 'Sẵn sàng',
                delivering: 'Đang giao',
              };
              return (
                <div key={s.status} className={`${c.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-1.5 mb-2">{c.icon}
                    <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>
                      {labelMap[s.status] || s.status}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${c.text}`}>{s.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Deposit Modal ── */}
      {showDepositModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !depositing && setShowDepositModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Pill handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">💳 Nạp Tiền Vào Ví</h2>
                <p className="text-xs text-gray-500 mt-0.5">Số dư hiện tại: <span className="font-mono font-bold text-primary-600">{formatMoney(walletData?.balance || 0)}đ</span></p>
              </div>
              <button onClick={() => !depositing && setShowDepositModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {depositError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {depositError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số Tiền Nạp (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0"
                    min={1000}
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3.5 text-gray-800 font-mono text-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ</span>
                </div>
                {depositAmount && Number(depositAmount) > 0 && (
                  <p className="text-sm text-primary-600 font-bold mt-2">
                    ≈ {formatMoney(Number(depositAmount))} VND
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chọn nhanh</p>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(String(amt))}
                      className={`px-2 py-2.5 border rounded-xl text-xs font-bold transition-all ${
                        depositAmount === String(amt)
                          ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {formatMoney(amt)}đ
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                disabled={depositing}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositing || !depositAmount || Number(depositAmount) <= 0}
                className="flex-2 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {depositing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {depositing ? 'Đang nạp...' : 'Xác Nhận Nạp Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorWallet;
