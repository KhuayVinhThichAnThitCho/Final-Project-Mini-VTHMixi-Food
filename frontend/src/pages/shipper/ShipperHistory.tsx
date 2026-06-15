import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Package, CheckCircle2, XCircle, Clock, Star, Image as ImageIcon } from 'lucide-react';
import shipperApi from '../../services/shipperApi';

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Hoàn Thành', cls: 'bg-[#2D7A4F]/10 text-[#2D7A4F] border-[#2D7A4F]/30' },
  delivering: { label: 'Đang Giao', cls: 'bg-[#2563A8]/10 text-[#2563A8] border-[#2563A8]/30' },
  cancelled: { label: 'Đã Hủy', cls: 'bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/30' },
};

const ShipperHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipperApi.getMyDeliveries();
      setOrders(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500">
      <Loader2 size={36} className="animate-spin text-primary-600" />
      <p className="font-mono font-bold uppercase text-xs tracking-wider">Đang tải lịch sử giao hàng...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-neutral-800">
      <div>
        <h1 className="font-heading italic font-bold text-2xl lg:text-3xl text-neutral-900">Lịch Sử Giao Hàng</h1>
        <p className="text-xs lg:text-sm text-neutral-500 mt-1">{orders.length} đơn hàng đã vận chuyển</p>
      </div>

      {orders.length === 0 ? (
        <div className="border-2 border-neutral-900 p-16 bg-[#FEFCF9] shadow-retro text-center max-w-2xl mx-auto">
          <Package size={40} className="mx-auto text-neutral-400 mb-4" strokeWidth={1.5} />
          <p className="text-neutral-850 font-heading font-bold text-base">Bạn chưa thực hiện đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, cls: 'bg-neutral-100 text-neutral-600 border-neutral-300' };
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro-sm overflow-hidden hover:shadow-retro transition-all"
              >
                {/* Row */}
                <button
                  className="w-full p-4 flex items-center gap-4 text-left focus:outline-none"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="w-10 h-10 border border-neutral-900 bg-[#FAF7F3] flex items-center justify-center flex-shrink-0 shadow-retro-sm">
                    {order.status === 'completed'
                      ? <CheckCircle2 size={18} className="text-[#2D7A4F]" />
                      : <XCircle size={18} className="text-[#C0392B]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-neutral-900 text-sm">
                        #{order.id?.slice(-8).toUpperCase()}
                      </p>
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-wider shadow-retro-sm ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-body mt-1 truncate">
                      {order.restaurant?.name} → {order.user?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-[#BF3A20] text-sm lg:text-base">
                      +{Number(order.shippingFee || 15000).toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 justify-end mt-1">
                      <Clock size={10} />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t-2 border-dashed border-neutral-200 bg-[#FAF7F3] space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wide mb-2">Chi tiết món ăn</p>
                      <ul className="space-y-1 bg-white border border-neutral-200 p-3 shadow-retro-sm rounded-sm">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                          <li key={idx} className="flex justify-between text-xs text-neutral-700 font-mono">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-neutral-500">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Rating */}
                    {order.shipperRating && (
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wide">Khách hàng đánh giá:</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < order.shipperRating ? 'text-[#C98F0A] fill-[#C98F0A]' : 'text-neutral-200'}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos */}
                    <div className="grid grid-cols-2 gap-3">
                      {order.pickupPhotoUrl ? (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-neutral-450 uppercase tracking-wide mb-1">📸 Ảnh lấy hàng</p>
                          <img
                            src={order.pickupPhotoUrl}
                            alt="Pickup"
                            className="w-full h-32 object-cover border-2 border-neutral-900 shadow-retro-sm rounded-sm"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-neutral-300 bg-white h-32 flex items-center justify-center rounded-sm">
                          <div className="text-center">
                            <ImageIcon size={20} className="text-neutral-300 mx-auto mb-1" />
                            <p className="text-[10px] font-mono text-neutral-400 uppercase">Không có ảnh lấy hàng</p>
                          </div>
                        </div>
                      )}
                      {order.deliveryPhotoUrl ? (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-neutral-450 uppercase tracking-wide mb-1">📸 Ảnh giao hàng</p>
                          <img
                            src={order.deliveryPhotoUrl}
                            alt="Delivery"
                            className="w-full h-32 object-cover border-2 border-neutral-900 shadow-retro-sm rounded-sm"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-neutral-300 bg-white h-32 flex items-center justify-center rounded-sm">
                          <div className="text-center">
                            <ImageIcon size={20} className="text-neutral-300 mx-auto mb-1" />
                            <p className="text-[10px] font-mono text-neutral-400 uppercase">Không có ảnh giao hàng</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipperHistory;
