import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Store, BarChart2, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

type Period = 'day' | 'week' | 'month' | 'year';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: '24 giờ' },
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year', label: 'Năm nay' },
];

// ─── Export Utility ────────────────────────────────────────────
const exportToExcel = (sheets: { name: string; data: any[] }[], fileName: string) => {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    // Style header row width
    const cols = Object.keys(data[0] || {}).map(() => ({ wch: 22 }));
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// ─── Export Button ─────────────────────────────────────────────
const ExportButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-green-800 hover:bg-green-600 shadow-retro-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
  >
    <FileSpreadsheet size={14} />
    Export Excel
    <Download size={12} />
  </button>
);

// ─── Simple Bar Chart ──────────────────────────────────────────
const SimpleBarChart: React.FC<{ data: any[]; valueKey: string; labelKey: string }> = ({ data, valueKey, labelKey }) => {
  if (!data || data.length === 0) return (
    <div className="h-48 flex items-center justify-center text-neutral-300 font-mono text-sm">
      Chưa có dữ liệu
    </div>
  );

  const values = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 h-52 px-2 border-b border-neutral-200 pb-2 overflow-x-auto custom-scrollbar">
      {data.map((item, i) => {
        const h = (Number(item[valueKey]) / max) * 100;
        return (
          <div key={i} className="w-10 sm:w-12 flex flex-col items-center gap-1 group h-full justify-end flex-shrink-0">
            <div className="relative w-full h-36 flex items-end">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                <div className="bg-neutral-900 text-white font-mono text-[10px] px-2 py-1 shadow-retro-sm whitespace-nowrap">
                  {valueKey === 'revenue' ? formatVND(Number(item[valueKey]) || 0) : `${item[valueKey]} lượt`}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900" />
              </div>
              {/* Bar */}
              <div
                className="w-full bg-[#BF3A20] hover:bg-[#D44B2F] border-2 border-neutral-950 shadow-retro-sm hover:-translate-y-[1px] transition-all duration-200"
                style={{ height: `${Math.max(h, 4)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-neutral-600 font-bold truncate w-full text-center leading-none mt-1">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Revenue Tab ───────────────────────────────────────────────
const RevenueTab: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue', period],
    queryFn: () => adminApi.getRevenueAnalytics(period),
  });

  const summary = (data as any)?.data?.summary;
  const chartData: any[] = (data as any)?.data?.revenueByTime || [];

  const handleExport = () => {
    // Sheet 1: Tổng quan
    const summarySheet = [
      {
        'Chỉ số': 'Tổng đơn hàng hoàn thành',
        'Giá trị': summary?.totalOrders || 0,
      },
      {
        'Chỉ số': 'Tổng doanh thu (VNĐ)',
        'Giá trị': summary?.totalRevenue || 0,
      },
      {
        'Chỉ số': 'User đang hoạt động',
        'Giá trị': summary?.totalUsers || 0,
      },
      {
        'Chỉ số': 'Nhà hàng hoạt động',
        'Giá trị': summary?.totalVendors || 0,
      },
      {
        'Chỉ số': 'Đơn đang chờ xử lý',
        'Giá trị': summary?.pendingOrders || 0,
      },
    ];

    // Sheet 2: Doanh thu theo thời gian
    const revenueSheet = chartData.map((row: any) => ({
      'Thời gian': row.period,
      'Số đơn hàng': Number(row.orderCount) || 0,
      'Doanh thu (VNĐ)': Number(row.revenue) || 0,
    }));

    exportToExcel(
      [
        { name: 'Tổng quan', data: summarySheet },
        { name: `Doanh thu (${PERIODS.find(p => p.value === period)?.label})`, data: revenueSheet.length ? revenueSheet : [{ 'Ghi chú': 'Chưa có dữ liệu trong kỳ này' }] },
      ],
      `BaoCaoDoanhThu_${period}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                period === p.value
                  ? 'bg-primary-600 text-white border-primary-700 shadow-retro-sm'
                  : 'bg-[#FEFCF9] text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <ExportButton onClick={handleExport} disabled={isLoading || !summary} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng đơn', value: summary?.totalOrders?.toLocaleString('vi-VN') || '0', icon: BarChart2, color: 'bg-secondary-600' },
          { label: 'Doanh Thu', value: formatVND(summary?.totalRevenue || 0), icon: TrendingUp, color: 'bg-primary-600' },
          { label: 'User Active', value: summary?.totalUsers?.toLocaleString() || '0', icon: Users, color: 'bg-neutral-700' },
          { label: 'Nhà hàng', value: summary?.totalVendors?.toLocaleString() || '0', icon: Store, color: 'bg-green-700' },
        ].map(card => (
          <div key={card.label} className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 shadow-saigon-card">
            <div className={`w-9 h-9 ${card.color} flex items-center justify-center mb-3 border border-neutral-200`}>
              <card.icon size={18} strokeWidth={1.5} className="text-white" />
            </div>
            <p className="font-mono text-lg font-bold text-neutral-900 leading-tight">{card.value}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-widest mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card">
        <div className="px-5 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-neutral-900">Biểu đồ Doanh thu</h3>
            <p className="font-mono text-xs text-neutral-400 mt-0.5">
              Doanh thu theo {PERIODS.find(p => p.value === period)?.label}
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400">{chartData.length} điểm dữ liệu</span>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="h-48 bg-neutral-100 animate-pulse" />
          ) : (
            <SimpleBarChart data={chartData} valueKey="revenue" labelKey="period" />
          )}
        </div>
        {/* Data table below chart */}
        {!isLoading && chartData.length > 0 && (
          <div className="border-t-2 border-neutral-100 overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  {['Thời gian', 'Số đơn', 'Doanh thu'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {chartData.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50/60">
                    <td className="px-4 py-2 font-mono text-xs text-neutral-600">{row.period}</td>
                    <td className="px-4 py-2 font-mono text-xs text-neutral-700">{Number(row.orderCount || 0).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono text-xs font-bold text-primary-600">{formatVND(Number(row.revenue || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Vendors Analytics Tab ─────────────────────────────────────
const VendorsTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendor-analytics'],
    queryFn: () => adminApi.getVendorAnalytics(),
  });

  const vendors: any[] = (data as any)?.data || [];

  const handleExport = () => {
    const sheet = vendors.map((v: any, i: number) => ({
      'Hạng': i + 1,
      'Tên nhà hàng': v.restaurant?.name || '—',
      'Địa chỉ': v.restaurant?.address || '—',
      'Rating': Number(v.restaurant?.ratingAvg || 0).toFixed(1),
      'Đơn hoàn thành': Number(v.completedOrders) || 0,
      'Tổng doanh thu (VNĐ)': Number(v.totalRevenue) || 0,
      'Trạng thái': v.restaurant?.status || '—',
    }));

    exportToExcel(
      [{ name: 'Top Vendor Doanh thu', data: sheet.length ? sheet : [{ 'Ghi chú': 'Chưa có dữ liệu' }] }],
      'BaoCaoVendor'
    );
  };

  return (
    <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card overflow-hidden">
      <div className="px-5 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
        <h3 className="font-heading font-bold text-neutral-900">Top Vendor — Doanh thu cao nhất</h3>
        <ExportButton onClick={handleExport} disabled={isLoading || vendors.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b-2 border-neutral-200">
              {['Hạng', 'Nhà hàng', 'Rating', 'Đơn hoàn thành', 'Tổng doanh thu', 'Status'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-neutral-100 animate-pulse" /></td>
                ))}</tr>
              ))
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-body text-sm text-neutral-400">
                  Chưa có dữ liệu doanh thu
                </td>
              </tr>
            ) : (
              vendors.map((v: any, i: number) => (
                <tr key={v.restaurantId} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`font-mono text-sm font-bold ${
                      i === 0 ? 'text-secondary-500' : i === 1 ? 'text-neutral-500' : i === 2 ? 'text-amber-700' : 'text-neutral-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-display italic text-sm text-neutral-900">{v.restaurant?.name || '—'}</p>
                    <p className="font-mono text-xs text-neutral-400 truncate max-w-36">{v.restaurant?.address}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-secondary-600">⭐ {Number(v.restaurant?.ratingAvg || 0).toFixed(1)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-neutral-700">{Number(v.completedOrders).toLocaleString('vi-VN')}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-primary-600">{formatVND(Number(v.totalRevenue || 0))}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 ${
                      v.restaurant?.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {v.restaurant?.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Users Analytics Tab ───────────────────────────────────────
const UsersTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: () => adminApi.getUserAnalytics(),
  });

  const stats = (data as any)?.data;
  const regByDay: any[] = stats?.registrationsByDay || [];

  const statItems = stats ? [
    { label: 'Tổng user', value: stats.totalUsers, color: 'bg-neutral-700' },
    { label: 'Đang hoạt động', value: stats.activeUsers, color: 'bg-green-700' },
    { label: 'Bị khóa', value: stats.bannedUsers, color: 'bg-red-700' },
    { label: 'Chờ xác thực', value: stats.pendingUsers, color: 'bg-secondary-600' },
    { label: 'Mới (30 ngày)', value: stats.newUsersLast30Days, color: 'bg-primary-600' },
  ] : [];

  const handleExport = () => {
    // Sheet 1: Tổng quan user
    const summarySheet = statItems.map(item => ({
      'Chỉ số': item.label,
      'Số lượng': item.value || 0,
    }));

    // Sheet 2: Đăng ký theo ngày (7 ngày)
    const regSheet = regByDay.map((row: any) => ({
      'Ngày': row.date,
      'Số đăng ký mới': Number(row.count) || 0,
    }));

    exportToExcel(
      [
        { name: 'Tổng quan User', data: summarySheet },
        { name: 'Đăng ký 7 ngày gần nhất', data: regSheet.length ? regSheet : [{ 'Ghi chú': 'Không có đăng ký trong 7 ngày qua' }] },
      ],
      'BaoCaoUser'
    );
  };

  return (
    <div className="space-y-6">
      {/* Export button row */}
      <div className="flex justify-end">
        <ExportButton onClick={handleExport} disabled={isLoading || !stats} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-neutral-100 border-2 border-neutral-200 animate-pulse" />)
        ) : (
          statItems.map(item => (
            <div key={item.label} className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 shadow-saigon-card">
              <div className={`w-2 h-8 ${item.color} mb-3`} />
              <p className="font-mono text-2xl font-bold text-neutral-900">{item.value?.toLocaleString('vi-VN') || 0}</p>
              <p className="font-body text-xs text-neutral-500 uppercase tracking-widest mt-1">{item.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Registrations by day chart */}
      {regByDay.length > 0 && (
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card">
          <div className="px-5 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
            <h3 className="font-heading font-bold text-neutral-900">Đăng ký mới — 7 ngày gần nhất</h3>
            <span className="font-mono text-xs text-neutral-400">{regByDay.length} ngày có dữ liệu</span>
          </div>
          <div className="p-5">
            <SimpleBarChart data={regByDay} valueKey="count" labelKey="date" />
          </div>
          {/* Table */}
          <div className="border-t-2 border-neutral-100">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {['Ngày', 'Số đăng ký mới'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {regByDay.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50/60">
                    <td className="px-4 py-2 font-mono text-xs text-neutral-600">{row.date}</td>
                    <td className="px-4 py-2 font-mono text-xs font-bold text-primary-600">{Number(row.count || 0).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && regByDay.length === 0 && (
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-8 text-center">
          <p className="font-body text-sm text-neutral-400">Chưa có đăng ký mới trong 7 ngày qua</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminAnalytics: React.FC = () => {
  const [tab, setTab] = useState<'revenue' | 'vendors' | 'users'>('revenue');

  const tabs = [
    { value: 'revenue', label: '📈 Doanh Thu' },
    { value: 'vendors', label: '🏪 Vendor' },
    { value: 'users',   label: '👥 Users' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-05</p>
          <h1 className="font-display italic text-3xl text-neutral-900">Báo Cáo &amp; Doanh Thu</h1>
        </div>
        <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 px-3 py-1.5">
          <FileSpreadsheet size={12} className="text-green-600" />
          <span className="font-mono text-[10px] text-green-700 uppercase tracking-wider">Export Excel có sẵn trong từng tab</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-neutral-200 gap-0">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide border-b-2 -mb-0.5 transition-all ${
              tab === t.value
                ? 'border-primary-600 text-primary-600 bg-primary-50'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'revenue' && <RevenueTab />}
      {tab === 'vendors' && <VendorsTab />}
      {tab === 'users'   && <UsersTab />}
    </div>
  );
};

export default AdminAnalytics;
