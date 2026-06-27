import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Printer, RefreshCcw, AlertCircle, CheckCircle2, XCircle, Loader2, Truck } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  user?: { name: string; phone?: string };
  shipper?: { name: string; phone?: string; shipperRating?: number };
  deliveryAddress?: string;
  pickupPhotoUrl?: string;
  shippingFee?: number;
  paymentMethod?: string;
  isPaid?: boolean;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

export const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorApi.getRestaurantOrders();
      setOrders(res?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await vendorApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      alert(err?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(order => {
    const matchSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusFilters: { key: StatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'Tất Cả', color: 'bg-gray-100 text-gray-700' },
    { key: 'pending', label: 'Chờ Duyệt', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { key: 'preparing', label: 'Chuẩn Bị', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { key: 'ready', label: 'Sẵn Sàng', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
    { key: 'delivering', label: 'Đang Giao', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
    { key: 'completed', label: 'Hoàn Thành', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { key: 'cancelled', label: 'Đã Hủy', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
  ];

  const getTicketStyle = (status: string) => ({
    pending: 'border-primary-200 shadow-modern-glow ring-1 ring-primary-500/20',
    preparing: 'border-blue-200 shadow-modern-sm ring-1 ring-blue-500/20',
    completed: 'border-emerald-100 shadow-modern-sm',
    cancelled: 'border-gray-100 bg-gray-50/50 shadow-sm opacity-70',
  }[status] || 'border-gray-100');

  const getBadge = (status: string) => ({
    pending: { cls: 'bg-primary-50 text-primary-700 border-primary-200', label: 'CHỜ DUYỆT' },
    confirmed: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'ĐÃ XÁC NHẬN' },
    preparing: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'ĐANG CHUẨN BỊ' },
    ready: { cls: 'bg-purple-50 text-purple-700 border-purple-200', label: 'SẴN SÀNG' },
    delivering: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'ĐANG GIAO' },
    completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'HOÀN THÀNH' },
    cancelled: { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: 'ĐÃ HỦY' },
  }[status] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: status.toUpperCase() });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải đơn hàng...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchOrders} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Đơn Hàng</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {orders.filter(o => o.status === 'pending').length} đơn đang chờ xử lý
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all">
            <RefreshCcw size={16} /> Làm Mới
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all">
            <Printer size={18} /> In Biên Lai
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-modern-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên khách hoặc mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl pl-12 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-gray-400"
            />
          </div>
        </div>
        {/* Status filters */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(sf => (
            <button
              key={sf.key}
              onClick={() => setStatusFilter(sf.key)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${statusFilter === sf.key ? sf.color + ' ring-2 ring-offset-1 ring-primary-400' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
            >
              {sf.label}
              {sf.key !== 'all' && (
                <span className="ml-1.5 font-mono">({orders.filter(o => o.status === sf.key).length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Filter size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(order => {
            const badge = getBadge(order.status);
            const isUpdating = updatingId === order.id;
            return (
              <div key={order.id} className={`bg-white rounded-2xl border ${getTicketStyle(order.status)} flex flex-col relative hover:shadow-modern transition-all duration-300 overflow-hidden`}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-mono font-bold text-base text-gray-900">#{order.id.slice(-8).toUpperCase()}</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 text-xs font-bold rounded-full border ${badge.cls}`}>
                    {badge.label}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-grow bg-white">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    {order.user?.name || 'Khách hàng'}
                    {order.user?.phone && <span className="text-xs text-gray-400 font-normal">· {order.user.phone}</span>}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-xs text-gray-400 mb-3 truncate">📍 {order.deliveryAddress}</p>
                  )}
                  {/* Payment Info */}
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase border border-gray-200">
                      {order.paymentMethod || 'COD'}
                    </span>
                    {order.isPaid ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase border border-green-200 flex items-center gap-1">
                        <CheckCircle2 size={10} /> ĐÃ THANH TOÁN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase border border-orange-200 flex items-center gap-1">
                        <AlertCircle size={10} /> CHƯA THANH TOÁN
                      </span>
                    )}
                  </div>
                  {/* Shipper info */}
                  {order.shipper && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                      <span className="text-xs font-semibold text-indigo-700">🚴 Shipper:</span>
                      <span className="text-xs text-indigo-600 font-medium">{order.shipper.name}</span>
                      {order.shipper.phone && (
                        <a href={`tel:${order.shipper.phone}`} className="ml-auto text-xs text-indigo-500 hover:underline">📞</a>
                      )}
                    </div>
                  )}
                  {/* Pickup photo from shipper */}
                  {order.pickupPhotoUrl && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">📸 Ảnh shipper lấy hàng:</p>
                      <img
                        src={order.pickupPhotoUrl}
                        alt="Pickup"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                  <ul className="space-y-2 mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-100">
                    {Array.isArray(order.items) && order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-start font-medium">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono text-gray-500 ml-2">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50/50 mt-auto border-t border-gray-100">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tổng cộng</span>
                    <span className="font-mono font-bold text-xl text-primary-600">
                      {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      disabled={isUpdating}
                      className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-modern-sm hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      {isUpdating ? 'Đang xử lý...' : 'Nhận Đơn Ngay'}
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      disabled={isUpdating}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-modern-sm hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      {isUpdating ? 'Đang xử lý...' : 'Đã Chuẩn Bị Xong'}
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <div className="text-center text-purple-650 bg-purple-50/50 py-3 rounded-xl border border-purple-100 font-semibold text-sm flex items-center justify-center gap-2">
                      <Clock size={16} className="animate-pulse" /> Đang chờ shipper nhận đơn...
                    </div>
                  )}
                  {order.status === 'delivering' && (
                    <div className="text-center text-indigo-650 bg-indigo-50/50 py-3 rounded-xl border border-indigo-100 font-semibold text-sm flex items-center justify-center gap-2">
                      <Truck size={16} className="animate-bounce" /> Shipper đang đi giao...
                    </div>
                  )}
                  {order.status === 'completed' && (
                    <div className="text-center text-emerald-600 font-semibold text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Đơn hàng đã hoàn thành
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="text-center text-gray-400 font-semibold text-sm flex items-center justify-center gap-2">
                      <XCircle size={18} /> Đơn hàng đã bị hủy
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
