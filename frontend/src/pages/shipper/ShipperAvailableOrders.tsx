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
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500">
      <Loader2 size={40} className="animate-spin text-primary-600" />
      <p className="font-mono font-bold uppercase text-xs tracking-wider">Đang tìm đơn hàng mới...</p>
    </div>
  );

  if (error) return (
    <div className="border-2 border-neutral-900 p-8 bg-[#FEFCF9] shadow-retro flex flex-col items-center gap-4 text-center max-w-md mx-auto">
      <AlertCircle size={40} className="text-red-600" />
      <p className="text-neutral-700 font-medium">{error}</p>
      <button onClick={fetchOrders} className="flex items-center gap-2 px-6 py-2.5 bg-[#BF3A20] text-white border-2 border-neutral-900 font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#D44B2F] active:translate-y-[2px] transition cursor-pointer">
        <RefreshCcw size={16} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-neutral-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading italic font-bold text-2xl lg:text-3xl text-neutral-900">Đơn Hàng Sẵn Có</h1>
          <p className="text-xs lg:text-sm text-neutral-500 mt-1">
            {orders.length > 0 ? `${orders.length} đơn hàng đang chờ bạn tiếp nhận` : 'Chưa có đơn hàng mới nào được phát hành'}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-neutral-900 bg-[#FEFCF9] text-neutral-700 font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#FAF7F3] active:translate-y-[2px] transition cursor-pointer"
        >
          <RefreshCcw size={14} /> Làm Mới
        </button>
      </div>

      {/* Success toast */}
      {successId && (
        <div className="border-2 border-neutral-900 p-4 bg-[#E8F5E9] flex items-center gap-3 text-[#2D7A4F] font-mono font-bold text-xs uppercase tracking-wider shadow-retro">
          <CheckCircle2 size={18} />
          Nhận đơn thành công! Đang chuyển sang màn hình đi giao...
        </div>
      )}

      {orders.length === 0 ? (
        <div className="border-2 border-neutral-900 p-16 bg-[#FEFCF9] shadow-retro text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 border-2 border-neutral-900 bg-[#FAF7F3] flex items-center justify-center mx-auto mb-4 shadow-retro-sm">
            <Package size={28} className="text-neutral-500" strokeWidth={1.5} />
          </div>
          <p className="text-neutral-850 font-heading font-bold text-base">Hiện không có đơn hàng nào sẵn sàng</p>
          <p className="text-neutral-500 text-xs mt-2">Hệ thống tự động tìm kiếm và đồng bộ sau mỗi 30 giây</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {orders.map(order => (
            <div key={order.id} className="border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro hover:shadow-retro-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 border-b-2 border-neutral-900 bg-[#FAF7F3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-neutral-900 bg-[#C98F0A]/20 flex items-center justify-center shadow-retro-sm">
                    <Zap size={14} className="text-neutral-950" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-neutral-900 text-xs">
                      #{order.id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 border border-neutral-900 bg-secondary-300 text-neutral-950 font-mono text-[9px] font-bold uppercase tracking-wider shadow-retro-sm">
                  SẴN SÀNG
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 font-body text-xs text-neutral-700">
                {/* Restaurant */}
                <div className="flex items-start gap-2.5">
                  <ChefHat size={15} className="text-[#BF3A20] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Lấy hàng tại cửa hàng</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">{order.restaurant?.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{order.restaurant?.address}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-205" />

                {/* Delivery */}
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#C98F0A] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Giao đến địa chỉ khách</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">{order.user?.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{order.deliveryAddress}</p>
                  </div>
                </div>

                {order.user?.phone && (
                  <div className="pt-1">
                    <a
                      href={`tel:${order.user.phone}`}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#F5EFE6] border border-neutral-300 text-[10px] text-neutral-650 font-mono hover:border-neutral-900 hover:text-neutral-900 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={10} />
                      Liên hệ khách: {order.user.phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1xxxx$3')}
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3.5 border-t-2 border-neutral-900 bg-[#FAF7F3] flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Phí Vận Chuyển</p>
                  <p className="text-base font-bold text-[#BF3A20] font-mono">
                    {Number(order.shippingFee || 15000).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(order.id)}
                  disabled={!!acceptingId}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-neutral-900 bg-[#BF3A20] text-white font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#D44B2F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 transition-all cursor-pointer"
                >
                  {acceptingId === order.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Zap size={13} />}
                  {acceptingId === order.id ? 'ĐANG NHẬN...' : 'NHẬN ĐƠN'}
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
