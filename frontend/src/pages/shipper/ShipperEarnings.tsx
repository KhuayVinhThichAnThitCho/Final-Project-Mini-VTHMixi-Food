import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Star, Package, DollarSign } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="bg-gray-200 rounded-2xl h-10 w-64 animate-pulse" />
      <div className="bg-gray-200 rounded-2xl h-36 animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-2xl h-28 animate-pulse" />
        <div className="bg-gray-200 rounded-2xl h-28 animate-pulse" />
      </div>
      <div className="bg-gray-200 rounded-2xl h-60 animate-pulse" />
    </div>
  );

  const maxEarning = data?.chartData
    ? Math.max(...data.chartData.map((d: any) => d.earnings), 1)
    : 1;

  const periodData = data?.[period] || { earnings: 0, orders: 0 };

  const periodLabels: Record<string, string> = {
    today: 'Hôm Nay',
    week: 'Tuần Này',
    month: 'Tháng Này',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Thu Nhập Của Tôi</h1>
        <p className="text-sm font-medium text-gray-500 mt-2">Báo cáo thống kê chi tiết phí vận chuyển tích lũy</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-full shadow-modern-sm w-fit">
        {(['today', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 font-semibold text-sm rounded-full transition-all duration-200 cursor-pointer ${
              period === p
                ? 'bg-primary-600 text-white shadow-modern-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="col-span-1 sm:col-span-2 relative bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-6 shadow-modern overflow-hidden flex flex-col justify-between gap-4">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative flex items-center gap-2 text-primary-100 text-xs font-semibold uppercase tracking-wider">
            <DollarSign size={16} strokeWidth={2} /> Báo cáo thu nhập — {periodLabels[period]}
          </div>
          <div className="relative">
            <p className="text-4xl lg:text-5xl font-bold text-white">
              {periodData.earnings.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-primary-200 text-sm mt-2">{periodData.orders} chuyến giao hoàn thành</p>
          </div>
        </div>

        <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm flex flex-col justify-between gap-4 overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50" />
          <div className="relative flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <Star size={16} className="text-amber-400" strokeWidth={2} /> Điểm trung bình
          </div>
          <div className="relative">
            <p className="text-3xl font-bold text-gray-800">
              {data?.avgRating ? `${data.avgRating} ⭐` : '—'}
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-2">Khách đánh giá</p>
          </div>
        </div>
      </div>

      {/* Total stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-modern-sm overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-40" />
          <div className="relative flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Package size={14} strokeWidth={2} className="text-blue-500" /> Tổng đơn hoàn tất
          </div>
          <p className="relative text-2xl font-bold text-gray-800">{data?.total?.orders ?? 0}</p>
          <p className="relative text-xs text-gray-400 mt-1">Đã vận chuyển</p>
        </div>
        <div className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-modern-sm overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-40" />
          <div className="relative flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp size={14} strokeWidth={2} className="text-primary-500" /> Tổng doanh thu
          </div>
          <p className="relative text-2xl font-bold text-primary-600">
            {(data?.total?.earnings ?? 0).toLocaleString('vi-VN')}đ
          </p>
          <p className="relative text-xs text-gray-400 mt-1">Tích lũy trọn đời</p>
        </div>
      </div>

      {/* Chart 7 ngày */}
      {data?.chartData && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm">
          <h3 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600" strokeWidth={2} />
            Phân tích doanh thu 7 ngày qua
          </h3>
          <div className="flex items-end gap-2 h-44 border-b border-gray-100 pb-2">
            {data.chartData.map((d: any, i: number) => {
              const height = maxEarning > 0 ? (d.earnings / maxEarning) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  {d.earnings > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 pointer-events-none shadow-modern">
                      {d.earnings.toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  <div className="w-full flex items-end h-32">
                    <div
                      className="w-full bg-primary-100 rounded-t-xl hover:bg-primary-500 transition-all duration-300 min-h-[4px] cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight text-center leading-none">{d.date.split(',')[0]}</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-none">{d.orders} đơn</p>
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
