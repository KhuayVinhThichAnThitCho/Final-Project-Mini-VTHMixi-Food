import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Award, Clock, RefreshCcw, AlertCircle } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface StatsData {
  ordersByStatus: { status: string; count: number }[];
  totalRevenue: number;
  topMenuItems: { id: string; name: string; soldCount: number; price: number }[];
}

interface OrderItem {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: { name: string };
}

export const VendorOverview: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy thông tin quán
      const restRes = await vendorApi.getMyRestaurant();
      const restaurant = restRes?.data;
      if (!restaurant) throw new Error('Không tìm thấy thông tin quán');

      // 2. Lấy thống kê
      const [statsRes, ordersRes] = await Promise.all([
        vendorApi.getVendorStats(restaurant.id),
        vendorApi.getRestaurantOrders(),
      ]);

      setStats(statsRes?.data || null);
      setRecentOrders((ordersRes?.data || []).slice(0, 5));
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingCount = recentOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = stats?.totalRevenue || 0;
  const topItem = stats?.topMenuItems?.[0];

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: 'bg-amber-50 text-amber-600 border-amber-100', label: 'CHỜ DUYỆT' },
      preparing: { cls: 'bg-blue-50 text-blue-600 border-blue-100', label: 'CHUẨN BỊ' },
      completed: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'HOÀN THÀNH' },
      cancelled: { cls: 'bg-red-50 text-red-600 border-red-100', label: 'ĐÃ HỦY' },
    };
    const { cls, label } = map[status] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: status.toUpperCase() };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${cls}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <div className="h-9 w-64 bg-gray-200 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-10 w-40 bg-gray-200 rounded mb-3" />
              <div className="h-5 w-28 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
            <RefreshCcw size={18} /> Thử Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Thống Kê Quán Ăn</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
            <Clock size={16} className="text-primary-500" /> {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" title="Làm mới dữ liệu">
            <RefreshCcw size={18} />
          </button>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-semibold text-sm shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang mở cửa
          </div>
        </div>
      </header>

      {/* Thống kê nhanh */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doanh thu */}
        <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm hover:shadow-modern transition-all duration-300 group overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tổng Doanh Thu</h3>
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-100 transition-colors">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-gray-900 mb-3 relative z-10">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </p>
          <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100 relative z-10">
            Tổng tất cả đơn hoàn thành
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm hover:shadow-modern transition-all duration-300 group overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tổng Đơn Hàng</h3>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-gray-900 mb-3 relative z-10">
            {recentOrders.length}+ Đơn
          </p>
          {pendingCount > 0 ? (
            <div className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100 relative z-10 animate-pulse">
              {pendingCount} Đơn chờ xử lý
            </div>
          ) : (
            <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100 relative z-10">
              Không có đơn chờ
            </div>
          )}
        </div>

        {/* Món bán chạy */}
        <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-modern-sm hover:shadow-modern transition-all duration-300 group overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Món Bán Chạy Nhất</h3>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Award size={24} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 truncate mb-3 relative z-10">
            {topItem ? topItem.name : 'Chưa có dữ liệu'}
          </p>
          {topItem && (
            <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 relative z-10">
              Đã bán {topItem.soldCount} lần
            </div>
          )}
        </div>
      </section>

      {/* Đơn hàng gần đây */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-gray-800">Đơn Hàng Gần Đây</h2>
          <span className="text-xs font-semibold text-gray-400">(5 đơn mới nhất)</span>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50">
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Khách Hàng</th>
                  <th className="py-4 px-6">Chi Tiết Món</th>
                  <th className="py-4 px-6">Tổng Tiền</th>
                  <th className="py-4 px-6">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {order.user?.name || 'Khách hàng'}
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {Array.isArray(order.items)
                        ? order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-gray-900">
                      {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-4 px-6">{statusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default VendorOverview;
