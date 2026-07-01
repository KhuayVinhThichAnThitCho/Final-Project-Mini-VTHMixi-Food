import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Truck, 
  X, 
  Phone, 
  Eye, 
  ClipboardList
} from 'lucide-react';
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
  user?: { name: string; phone?: string; avatar?: string };
  shipper?: { name: string; phone?: string; avatar?: string; shipperRating?: number };
  deliveryAddress?: string;
  pickupPhotoUrl?: string;
  deliveryPhotoUrl?: string;
  shippingFee?: number;
  paymentMethod?: string;
  isPaid?: boolean;
}

type TabType = 'active' | 'history';

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const backendBase = apiBaseUrl.replace('/api/v1', '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      // Nếu order hiện tại đang mở trong modal chi tiết, cập nhật lại trạng thái của nó
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      alert(err?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(order => {
    const matchSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    const isHistory = ['completed', 'cancelled'].includes(order.status);
    if (activeTab === 'active' && isHistory) return false;
    if (activeTab === 'history' && !isHistory) return false;

    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    return true;
  });

  const getTicketStyle = (status: string) => ({
    pending: 'border-primary-200 shadow-modern-glow ring-1 ring-primary-500/20',
    preparing: 'border-blue-200 shadow-modern-sm ring-1 ring-blue-500/20',
    completed: 'border-emerald-100 shadow-modern-sm',
    cancelled: 'border-gray-100 bg-gray-50/50 shadow-sm opacity-70',
  }[status] || 'border-gray-100');

  const getBadge = (status: string) => ({
    pending: { cls: 'bg-primary-50 text-primary-700 border-primary-250', label: 'CHỜ DUYỆT' },
    confirmed: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-250', label: 'ĐÃ XÁC NHẬN' },
    preparing: { cls: 'bg-blue-50 text-blue-700 border-blue-250', label: 'ĐANG CHUẨN BỊ' },
    ready: { cls: 'bg-purple-50 text-purple-700 border-purple-250', label: 'SẴN SÀNG' },
    delivering: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-250', label: 'ĐANG GIAO' },
    completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-250', label: 'HOÀN THÀNH' },
    cancelled: { cls: 'bg-gray-150 text-gray-600 border-gray-250', label: 'ĐÃ HỦY' },
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
      <div className="flex justify-between items-end pb-4 border-b border-gray-200 select-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Đơn Hàng</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Có {orders.filter(o => o.status === 'pending').length} đơn đang chờ duyệt trong tổng số {orders.length} đơn hàng.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
            <RefreshCcw size={16} /> Làm Mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 select-none bg-white rounded-t-xl overflow-hidden">
        <button
          onClick={() => { setActiveTab('active'); setStatusFilter('all'); }}
          className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'border-primary-500 text-primary-600 bg-primary-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
          }`}
        >
          Đơn Hàng Đang Xử Lý ({orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length})
        </button>
        <button
          onClick={() => { setActiveTab('history'); setStatusFilter('all'); }}
          className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-600 bg-primary-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
          }`}
        >
          Lịch Sử Đơn Hàng ({orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length})
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-modern-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng hoặc mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl pl-12 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Status sub-filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white font-bold ring-2 ring-offset-1 ring-gray-400'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Tất Cả
          </button>
          {activeTab === 'active' ? (
            <>
              {[
                { key: 'pending', label: 'Chờ Duyệt', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { key: 'preparing', label: 'Chuẩn Bị', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { key: 'ready', label: 'Sẵn Sàng', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { key: 'delivering', label: 'Đang Giao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              ].map(sf => (
                <button
                  key={sf.key}
                  onClick={() => setStatusFilter(sf.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    statusFilter === sf.key
                      ? sf.color + ' ring-2 ring-offset-1 ring-primary-400 font-bold'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {sf.label} ({orders.filter(o => o.status === sf.key).length})
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { key: 'completed', label: 'Hoàn Thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-255' },
                { key: 'cancelled', label: 'Đã Hủy', color: 'bg-gray-100 text-gray-600 border-gray-255' },
              ].map(sf => (
                <button
                  key={sf.key}
                  onClick={() => setStatusFilter(sf.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    statusFilter === sf.key
                      ? sf.color + ' ring-2 ring-offset-1 ring-primary-400 font-bold'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {sf.label} ({orders.filter(o => o.status === sf.key).length})
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Grid Order Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-modern-sm">
          <Filter size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">Không tìm thấy đơn hàng nào ở bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(order => {
            const badge = getBadge(order.status);
            const isUpdating = updatingId === order.id;
            return (
              <div key={order.id} className={`bg-white rounded-2xl border ${getTicketStyle(order.status)} flex flex-col relative hover:shadow-modern transition-all duration-300 overflow-hidden`}>
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-mono font-bold text-base text-gray-900">#{order.id.slice(-8).toUpperCase()}</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1 select-none">
                      <Clock size={12} /> {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 text-xs font-bold rounded-full border ${badge.cls} select-none`}>
                    {badge.label}
                  </div>
                </div>

                {/* Card Body */}
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
                  <div className="flex gap-2 mb-3 select-none">
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

                  {/* Items quick list */}
                  <ul className="space-y-1 mt-2 text-xs text-gray-600 pl-3 border-l border-gray-200">
                    {Array.isArray(order.items) && order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center font-medium">
                        <span className="truncate">{item.quantity}x {item.name}</span>
                        <span className="font-mono text-gray-400 ml-2">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </li>
                    ))}
                    {order.items?.length > 3 && (
                      <li className="text-[10px] font-medium text-[#BF3A20] italic select-none">
                        + Xem thêm {order.items.length - 3} món trong chi tiết...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Card Footer */}
                <div className="p-5 bg-gray-50/50 mt-auto border-t border-gray-100">
                  <div className="flex justify-between items-end mb-3 select-none">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tổng cộng</span>
                    <span className="font-mono font-bold text-lg text-primary-600">
                      {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs select-none"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        disabled={isUpdating}
                        className="flex-[2] py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-modern-sm hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1 cursor-pointer text-xs select-none"
                      >
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Duyệt Đơn
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        disabled={isUpdating}
                        className="flex-[2] py-2.5 bg-purple-600 text-white rounded-xl font-semibold shadow-modern-sm hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1 cursor-pointer text-xs select-none"
                      >
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Xong món
                      </button>
                    )}
                  </div>

                  {/* Banner status info for non-actionable cards */}
                  {order.status === 'ready' && (
                    <div className="text-center text-purple-650 bg-purple-50/50 py-2 mt-2 rounded-xl border border-purple-100 font-semibold text-xs flex items-center justify-center gap-1.5 select-none">
                      <Clock size={12} className="animate-pulse" /> Đang chờ shipper nhận đơn...
                    </div>
                  )}
                  {order.status === 'delivering' && (
                    <div className="text-center text-indigo-650 bg-indigo-50/50 py-2 mt-2 rounded-xl border border-indigo-100 font-semibold text-xs flex items-center justify-center gap-1.5 select-none">
                      <Truck size={12} className="animate-bounce" /> Shipper đang đi giao...
                    </div>
                  )}
                  {order.status === 'completed' && (
                    <div className="text-center text-emerald-600 bg-emerald-50/50 py-2 mt-2 rounded-xl border border-emerald-100 font-semibold text-xs flex items-center justify-center gap-1.5 select-none">
                      <CheckCircle2 size={12} /> Đã hoàn thành
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="text-center text-gray-400 bg-gray-100/50 py-2 mt-2 rounded-xl border border-gray-250 font-semibold text-xs flex items-center justify-center gap-1.5 select-none">
                      <XCircle size={12} /> Đã bị hủy
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: CHI TIẾT ĐƠN HÀNG TOÀN DIỆN (FULL DETAILS)
      ════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-gray-250 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2 select-none">
                <ClipboardList className="text-[#BF3A20]" size={20} />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#BF3A20] tracking-wider block">CHI TIẾT ĐƠN HÀNG</span>
                  <h3 className="text-base font-bold text-gray-900 font-mono">#{selectedOrder.id.toUpperCase()}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Order Status timeline info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between select-none">
                <div>
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Trạng thái đơn hàng</p>
                  <p className="text-sm font-bold text-gray-700 mt-1 flex items-center gap-1.5">
                    <Clock size={15} />
                    {getBadge(selectedOrder.status).label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Thời gian đặt</p>
                  <p className="text-sm font-bold text-gray-700 mt-1">{formatTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">👤 Thông tin khách hàng</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  {selectedOrder.user?.avatar ? (
                    <img src={getImageUrl(selectedOrder.user.avatar)} className="w-12 h-12 rounded-full object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-50 text-[#BF3A20] flex items-center justify-center font-bold text-lg border border-primary-200">
                      {(selectedOrder.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="font-bold text-gray-900">{selectedOrder.user?.name || 'Khách hàng'}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 font-mono">
                      <span>📞 Điện thoại:</span>
                      {selectedOrder.user?.phone ? (
                        <a href={`tel:${selectedOrder.user.phone}`} className="text-primary-600 hover:underline">{selectedOrder.user.phone}</a>
                      ) : (
                        <span className="italic text-gray-400">Chưa cung cấp SĐT</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-600">📍 Địa chỉ giao hàng:</span> {selectedOrder.deliveryAddress || 'Nhận trực tiếp'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipper details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">🚴 Thông tin Shipper</h4>
                {selectedOrder.shipper ? (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                    {selectedOrder.shipper.avatar ? (
                      <img src={getImageUrl(selectedOrder.shipper.avatar)} className="w-12 h-12 rounded-full object-cover border border-indigo-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
                        {(selectedOrder.shipper.name || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-bold text-indigo-900">{selectedOrder.shipper.name}</p>
                      <p className="text-xs text-indigo-700 mt-0.5 flex items-center gap-1 font-mono">
                        <span>📞 Điện thoại:</span>
                        {selectedOrder.shipper.phone ? (
                          <a href={`tel:${selectedOrder.shipper.phone}`} className="text-indigo-600 hover:underline">{selectedOrder.shipper.phone}</a>
                        ) : (
                          <span className="italic text-indigo-400">Chưa có SĐT</span>
                        )}
                      </p>
                    </div>
                    {selectedOrder.shipper.phone && (
                      <a
                        href={`tel:${selectedOrder.shipper.phone}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full transition-all shadow-sm"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center text-xs text-gray-400 font-medium select-none">
                    Chưa có shipper đảm nhận đơn hàng này
                  </div>
                )}
              </div>

              {/* Photos confirmations */}
              {(selectedOrder.pickupPhotoUrl || selectedOrder.deliveryPhotoUrl) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.pickupPhotoUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider select-none">📸 Ảnh xác nhận lấy hàng (Quán)</p>
                      <a href={getImageUrl(selectedOrder.pickupPhotoUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={getImageUrl(selectedOrder.pickupPhotoUrl)}
                          alt="Pickup Proof"
                          className="w-full h-40 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-all cursor-zoom-in"
                        />
                      </a>
                    </div>
                  )}
                  {selectedOrder.deliveryPhotoUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider select-none">📸 Ảnh shipper giao thành công (Khách)</p>
                      <a href={getImageUrl(selectedOrder.deliveryPhotoUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={getImageUrl(selectedOrder.deliveryPhotoUrl)}
                          alt="Delivery Proof"
                          className="w-full h-40 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-all cursor-zoom-in"
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">🍔 Danh sách món ăn đã đặt</h4>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider select-none">
                      <tr>
                        <th className="p-3.5">Món ăn</th>
                        <th className="p-3.5 text-center">Số lượng</th>
                        <th className="p-3.5 text-right">Đơn giá</th>
                        <th className="p-3.5 text-right">Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3.5 font-semibold text-gray-800">{item.name}</td>
                          <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                          <td className="p-3.5 text-right font-mono">{(item.price).toLocaleString('vi-VN')}đ</td>
                          <td className="p-3.5 text-right font-mono font-bold text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">💳 Chi tiết thanh toán</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 select-none">
                    <span>Phương thức thanh toán:</span>
                    <span className="font-bold text-gray-900 uppercase">{selectedOrder.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 select-none">
                    <span>Trạng thái giao dịch:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.isPaid ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                      {selectedOrder.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-gray-150 pt-3 flex justify-between font-bold text-base text-gray-900 select-none">
                    <span>TỔNG THU HỘ (KHÁCH TRẢ):</span>
                    <span className="font-mono text-primary-600">{Number(selectedOrder.totalAmount).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
              {/* Dynamic Action Buttons on the modal */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                  disabled={updatingId === selectedOrder.id}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5 cursor-pointer text-xs select-none"
                >
                  {updatingId === selectedOrder.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Duyệt Đơn Hàng này
                </button>
              )}
              {selectedOrder.status === 'preparing' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')}
                  disabled={updatingId === selectedOrder.id}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5 cursor-pointer text-xs select-none"
                >
                  {updatingId === selectedOrder.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Xác nhận Xong món
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer text-xs select-none"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
