import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, MapPin, Clock, RefreshCcw, Loader2,
  AlertCircle, Phone, ChefHat, CheckCircle2, Zap
} from 'lucide-react';
import shipperApi from '../../services/shipperApi';

interface AvailableOrdersProps {
  onNavigate: (menu: string) => void;
}

const ShipperAvailableOrders: React.FC<AvailableOrdersProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shipperApi.getAvailableOrders();
      setOrders(res?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto refresh mỗi 30s
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await shipperApi.acceptOrder(orderId);
      setSuccessId(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setTimeout(() => {
        setSuccessId(null);
        onNavigate('active');
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Đơn hàng đã được nhận bởi shipper khác!');
      fetchOrders();
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse" />
      ))}
    </div>
  );

  if (error) return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
      <AlertCircle size={40} className="text-primary-600" />
      <p className="text-gray-700 font-medium">{error}</p>
      <button
        onClick={fetchOrders}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all duration-200 cursor-pointer"
      >
        <RefreshCcw size={16} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Đơn Hàng Sẵn Có</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {orders.length > 0 ? `${orders.length} đơn hàng đang chờ bạn tiếp nhận` : 'Chưa có đơn hàng mới nào được phát hành'}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl font-semibold text-sm shadow-modern-sm hover:shadow-modern hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        >
          <RefreshCcw size={14} /> Làm Mới
        </button>
      </div>

      {/* Success toast */}
      {successId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 font-semibold text-sm">
          <CheckCircle2 size={18} />
          Nhận đơn thành công! Đang chuyển sang màn hình đi giao...
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package size={28} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-base">Hiện không có đơn hàng nào sẵn sàng</p>
            <p className="text-gray-400 text-sm mt-1.5">Hệ thống tự động tìm kiếm và đồng bộ sau mỗi 30 giây</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-modern-sm hover:shadow-modern transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Zap size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      #{order.id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Sẵn Sàng
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 text-sm text-gray-600">
                {/* Restaurant */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChefHat size={14} className="text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lấy hàng tại</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{order.restaurant?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{order.restaurant?.address}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-100" />

                {/* Delivery */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-blue-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giao đến khách</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{order.user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{order.deliveryAddress}</p>
                  </div>
                </div>

                {order.user?.phone && (
                  <div className="pt-1">
                    <a
                      href={`tel:${order.user.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-800 transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={11} />
                      Liên hệ: {order.user.phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1xxxx$3')}
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phí Vận Chuyển</p>
                  <p className="text-lg font-bold text-primary-600 mt-0.5">
                    {Number(order.shippingFee || 15000).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(order.id)}
                  disabled={!!acceptingId}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-60 transition-all duration-200 cursor-pointer shadow-modern-sm"
                >
                  {acceptingId === order.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Zap size={14} />}
                  {acceptingId === order.id ? 'Đang nhận...' : 'Nhận Đơn'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShipperAvailableOrders;
