import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, TrendingUp, Star, Truck, ToggleLeft, ToggleRight,
  Loader2, RefreshCcw, ArrowRight, Zap
} from 'lucide-react';
import shipperApi from '../../services/shipperApi';
import useAuth from '../../hooks/useAuth';

interface OverviewProps {
  onNavigate: (menu: string) => void;
}

const ShipperOverview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const { user, refetchMe } = useAuth();
  const [earnings, setEarnings] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [isOnline, setIsOnline] = useState((user as any)?.isOnline ?? false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [earningsRes, deliveriesRes] = await Promise.all([
        shipperApi.getMyEarnings(),
        shipperApi.getMyDeliveries(),
      ]);
      if (earningsRes?.success) setEarnings(earningsRes.data);
      const allOrders = deliveriesRes?.data || [];
      const active = allOrders.find((o: any) => o.status === 'delivering');
      setActiveOrder(active || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setIsOnline((user as any)?.isOnline ?? false); }, [user]);

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const res = await shipperApi.toggleOnline(!isOnline);
      if (res?.success) {
        setIsOnline(res.data.isOnline);
        if (refetchMe) await refetchMe();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingOnline(false);
    }
  };

  const iconColors = [
    { bg: 'bg-primary-50', text: 'text-primary-600' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  const StatCard = ({ icon: Icon, label, value, sub, colorIdx = 0 }: any) => {
    const c = iconColors[colorIdx % iconColors.length];
    return (
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm hover:shadow-modern transition-all duration-300 group overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center`}>
              <Icon size={17} className={c.text} strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
          {sub && <p className="text-sm text-gray-400 mt-1.5">{sub}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Xin chào, {user?.name?.split(' ').slice(-1)[0]} 👋
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Hãy bật hoạt động để bắt đầu nhận đơn vận chuyển hôm nay!
          </p>
        </div>
        <button
          onClick={fetchData}
          className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-modern-sm hover:shadow-modern hover:bg-gray-50 transition-all duration-200 text-gray-600"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Online Toggle Banner */}
      <div className={`bg-white border rounded-2xl p-5 shadow-modern-sm transition-all duration-300 ${
        isOnline ? 'border-emerald-200' : 'border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isOnline ? (
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-semibold text-sm shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Đang Online
              </span>
            ) : (
              <span className="px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-full font-semibold text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Ngoại Tuyến
              </span>
            )}
            <div>
              <p className="font-semibold text-gray-800 text-sm lg:text-base">
                {isOnline ? 'Sẵn sàng nhận đơn' : 'Bật online để giao hàng'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isOnline ? 'Hệ thống đang tìm đơn hàng khả dụng gần bạn' : 'Bật online để bắt đầu đi giao hàng'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-modern-sm transition-all duration-200 disabled:opacity-60 cursor-pointer ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {togglingOnline
              ? <Loader2 size={14} className="animate-spin" />
              : isOnline ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {isOnline ? 'Tắt Online' : 'Bật Online'}
          </button>
        </div>
      </div>

      {/* Active order alert */}
      {activeOrder && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">Bạn đang có đơn đang giao!</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Mã đơn: #{activeOrder.id?.slice(-8).toUpperCase()} — Khách: {activeOrder.user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('active')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all duration-200 cursor-pointer"
          >
            Đến Đơn Đang Giao <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Package}
              label="Đơn Hôm Nay"
              value={earnings?.today?.orders ?? 0}
              sub={`${(earnings?.today?.earnings ?? 0).toLocaleString('vi-VN')}đ`}
              colorIdx={0}
            />
            <StatCard
              icon={TrendingUp}
              label="Thu Nhập Hôm Nay"
              value={`${(earnings?.today?.earnings ?? 0).toLocaleString('vi-VN')}đ`}
              sub="Phí giao hàng"
              colorIdx={1}
            />
            <StatCard
              icon={Truck}
              label="Tổng Đơn Giao"
              value={earnings?.total?.orders ?? 0}
              sub={`${(earnings?.total?.earnings ?? 0).toLocaleString('vi-VN')}đ tổng`}
              colorIdx={2}
            />
            <StatCard
              icon={Star}
              label="Đánh Giá Shipper"
              value={earnings?.avgRating ? `${earnings.avgRating} ⭐` : '—'}
              sub="Điểm từ khách hàng"
              colorIdx={3}
            />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => onNavigate('available')}
              className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-6 shadow-modern hover:shadow-modern-md transition-all duration-300 text-left flex items-center justify-between cursor-pointer group overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <p className="font-bold text-base lg:text-lg">Xem Đơn Hàng Sẵn Có</p>
                <p className="text-primary-100 text-sm mt-1">Đơn hàng chờ tài xế đến nhận và giao</p>
              </div>
              <div className="relative z-10 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ArrowRight size={20} />
              </div>
            </button>
            <button
              onClick={() => onNavigate('earnings')}
              className="relative bg-gradient-to-br from-amber-400 to-amber-500 text-gray-900 rounded-2xl p-6 shadow-modern hover:shadow-modern-md transition-all duration-300 text-left flex items-center justify-between cursor-pointer group overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <p className="font-bold text-base lg:text-lg">Thống Kê Thu Nhập</p>
                <p className="text-amber-900/70 text-sm mt-1">Báo cáo lịch sử & biểu đồ doanh thu</p>
              </div>
              <div className="relative z-10 w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp size={20} className="text-amber-900" />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipperOverview;
