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
      const res = await shipperApi.toggleOnline();
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

  const StatCard = ({ icon: Icon, label, value, sub }: any) => (
    <div className="border-2 border-neutral-900 p-5 bg-[#FEFCF9] shadow-retro-sm flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 bg-[#FAF7F3] border border-neutral-900 flex items-center justify-center shadow-retro-sm">
          <Icon size={16} className="text-neutral-700" strokeWidth={1.5} />
        </div>
      </div>
      <div>
        <p className="text-xl font-mono font-bold text-neutral-900 leading-none">{value}</p>
        {sub && <p className="text-[10px] font-mono text-neutral-400 mt-1">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading italic font-bold text-2xl lg:text-3xl text-neutral-900">
            Xin chào, {user?.name?.split(' ').slice(-1)[0]} 👋
          </h1>
          <p className="text-xs lg:text-sm text-neutral-500 mt-1">
            Hãy bật hoạt động để bắt đầu nhận đơn vận chuyển hôm nay!
          </p>
        </div>
        <button
          onClick={fetchData}
          className="w-9 h-9 border-2 border-neutral-900 bg-[#FEFCF9] hover:bg-neutral-100 shadow-retro-sm flex items-center justify-center transition text-neutral-700"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Online Toggle Banner */}
      <div className={`border-2 border-neutral-900 transition-all duration-300 p-5 shadow-retro ${
        isOnline
          ? 'bg-[#E8F5E9] selection:bg-[#2D7A4F] selection:text-white'
          : 'bg-[#FEFCF9]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 border-2 border-neutral-900 flex items-center justify-center shadow-retro-sm transition-all ${
              isOnline ? 'bg-[#2D7A4F]/20' : 'bg-[#FAF7F3]'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#2D7A4F] animate-pulse' : 'bg-neutral-400'}`} />
            </div>
            <div>
              <p className="font-mono font-bold text-neutral-900 text-sm lg:text-base">
                {isOnline ? '🟢 ĐANG ONLINE — SẴN SÀNG NHẬN ĐƠN' : '⚫ ĐANG NGOẠI TUYẾN (OFFLINE)'}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isOnline ? 'Hệ thống đang tìm đơn hàng khả dụng gần bạn' : 'Bật online để bắt đầu đi giao hàng'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-neutral-900 font-mono font-bold uppercase text-xs shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 cursor-pointer ${
              isOnline
                ? 'bg-[#2D7A4F] text-white hover:bg-[#25633F]'
                : 'bg-[#FAF0D2] text-neutral-800 hover:bg-[#F3DC9E]'
            }`}
          >
            {togglingOnline
              ? <Loader2 size={14} className="animate-spin" />
              : isOnline ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {isOnline ? 'TẮT ONLINE' : 'BẬT ONLINE'}
          </button>
        </div>
      </div>

      {/* Active order alert */}
      {activeOrder && (
        <div className="bg-[#FAF0D2] border-2 border-neutral-900 shadow-retro p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-neutral-900 bg-[#C98F0A]/20 flex items-center justify-center shadow-retro-sm">
              <Zap size={18} className="text-neutral-900" />
            </div>
            <div>
              <p className="font-heading font-bold text-neutral-900 text-sm">Bạn đang có đơn đang giao!</p>
              <p className="text-xs text-neutral-600 font-mono mt-0.5">
                Mã đơn: #{activeOrder.id?.slice(-8).toUpperCase()} — Khách: {activeOrder.user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('active')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-neutral-900 bg-[#BF3A20] text-white font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#D44B2F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            ĐẾN ĐƠN ĐANG GIAO <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={36} className="animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Package}
              label="Đơn Hôm Nay"
              value={earnings?.today?.orders ?? 0}
              sub={`${(earnings?.today?.earnings ?? 0).toLocaleString('vi-VN')}đ`}
            />
            <StatCard
              icon={TrendingUp}
              label="Thu Nhập Hôm Nay"
              value={`${(earnings?.today?.earnings ?? 0).toLocaleString('vi-VN')}đ`}
              sub="Phí giao hàng"
            />
            <StatCard
              icon={Truck}
              label="Tổng Đơn Giao"
              value={earnings?.total?.orders ?? 0}
              sub={`${(earnings?.total?.earnings ?? 0).toLocaleString('vi-VN')}đ tổng`}
            />
            <StatCard
              icon={Star}
              label="Đánh Giá Shipper"
              value={earnings?.avgRating ? `${earnings.avgRating} ⭐` : '—'}
              sub="Điểm từ khách hàng"
            />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => onNavigate('available')}
              className="border-2 border-neutral-900 bg-[#BF3A20] text-white p-5 shadow-retro hover:shadow-retro-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <p className="font-heading font-bold text-base lg:text-lg">Xem Đơn Hàng Sẵn Có</p>
                <p className="text-red-100 text-xs mt-1">Đơn hàng chờ tài xế đến nhận và giao</p>
              </div>
              <div className="w-10 h-10 bg-white/20 border border-white/40 flex items-center justify-center shadow-retro-sm group-hover:scale-105 transition-transform">
                <ArrowRight size={20} />
              </div>
            </button>
            <button
              onClick={() => onNavigate('earnings')}
              className="border-2 border-neutral-900 bg-[#E9C46A] text-neutral-900 p-5 shadow-retro hover:shadow-retro-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <p className="font-heading font-bold text-base lg:text-lg">Thống Kê Thu Nhập</p>
                <p className="text-neutral-700 text-xs mt-1">Báo cáo lịch sử & biểu đồ doanh thu</p>
              </div>
              <div className="w-10 h-10 bg-neutral-950/10 border border-neutral-950/20 flex items-center justify-center shadow-retro-sm group-hover:scale-105 transition-transform">
                <TrendingUp size={20} className="text-neutral-800" />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipperOverview;
