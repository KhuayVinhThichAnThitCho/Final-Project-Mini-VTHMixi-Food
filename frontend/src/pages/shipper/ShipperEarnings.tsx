import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, TrendingUp, Star, Package, DollarSign } from 'lucide-react';
import shipperApi from '../../services/shipperApi';

const ShipperEarnings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipperApi.getMyEarnings();
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500">
      <Loader2 size={36} className="animate-spin text-primary-600" />
      <p className="font-mono font-bold uppercase text-xs tracking-wider">Đang tải báo cáo thu nhập...</p>
    </div>
  );

  const maxEarning = data?.chartData
    ? Math.max(...data.chartData.map((d: any) => d.earnings), 1)
    : 1;

  const periodData = data?.[period] || { earnings: 0, orders: 0 };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-800">
      <div>
        <h1 className="font-heading italic font-bold text-2xl lg:text-3xl text-neutral-900">Thu Nhập Của Tôi</h1>
        <p className="text-xs lg:text-sm text-neutral-500 mt-1">Báo cáo thống kê chi tiết phí vận chuyển tích lũy</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 p-1 border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro-sm w-fit rounded-sm">
        {(['today', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 font-mono font-bold uppercase text-xs transition-all duration-150 cursor-pointer ${
              period === p
                ? 'bg-[#BF3A20] text-white border border-neutral-900 shadow-retro-sm'
                : 'text-neutral-500 hover:text-neutral-950 bg-transparent border border-transparent'
            }`}
          >
            {p === 'today' ? 'Hôm Nay' : p === 'week' ? 'Tuần Này' : 'Tháng Này'}
          </button>
        ))}
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="col-span-1 sm:col-span-2 border-2 border-neutral-900 bg-[#BF3A20] text-white p-6 shadow-retro flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-red-100 text-xs font-mono font-bold uppercase tracking-wider">
            <DollarSign size={16} strokeWidth={1.5} /> Báo cáo thu nhập
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-bold font-mono text-white">
              {periodData.earnings.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-red-200 text-xs mt-1.5">{periodData.orders} chuyến giao hoàn thành</p>
          </div>
        </div>

        <div className="border-2 border-neutral-900 bg-[#FEFCF9] p-6 shadow-retro flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Star size={16} className="text-[#C98F0A]" strokeWidth={1.5} /> Điểm trung bình
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-neutral-900 font-mono">
              {data?.avgRating ? `${data.avgRating} ⭐` : '—'}
            </p>
            <p className="text-neutral-400 text-[10px] uppercase font-mono mt-1.5">Khách đánh giá</p>
          </div>
        </div>
      </div>

      {/* Total stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-neutral-900 bg-[#FEFCF9] p-5 shadow-retro-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Package size={14} strokeWidth={1.5} /> Tổng đơn hoàn tất
          </div>
          <p className="text-xl font-bold text-neutral-900 font-mono">{data?.total?.orders ?? 0}</p>
          <p className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">Đã vận chuyển</p>
        </div>
        <div className="border-2 border-neutral-900 bg-[#FEFCF9] p-5 shadow-retro-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <TrendingUp size={14} strokeWidth={1.5} /> Tổng doanh thu ví
          </div>
          <p className="text-xl font-bold text-[#BF3A20] font-mono">
            {(data?.total?.earnings ?? 0).toLocaleString('vi-VN')}đ
          </p>
          <p className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">Tích lũy trọn đời</p>
        </div>
      </div>

      {/* Chart 7 ngày */}
      {data?.chartData && (
        <div className="border-2 border-neutral-900 bg-[#FEFCF9] p-6 shadow-retro">
          <h3 className="font-heading font-bold text-neutral-900 text-sm lg:text-base mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#BF3A20]" strokeWidth={1.5} /> Phân tích doanh thu 7 ngày qua
          </h3>
          <div className="flex items-end gap-2 h-44 border-b border-neutral-300 pb-2">
            {data.chartData.map((d: any, i: number) => {
              const height = maxEarning > 0 ? (d.earnings / maxEarning) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  {d.earnings > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 text-white text-[9px] font-mono px-2 py-1 shadow-retro rounded-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                      {d.earnings.toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  <div className="w-full flex items-end h-32">
                    <div
                      className="w-full border-2 border-neutral-900 bg-[#E9C46A] shadow-retro-sm transition-all duration-500 min-h-[4px] hover:bg-[#C98F0A]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-tight text-center leading-none mt-1">{d.date.split(',')[0]}</p>
                  <p className="text-[9px] font-mono text-neutral-400 font-bold leading-none">{d.orders} đơn</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperEarnings;
