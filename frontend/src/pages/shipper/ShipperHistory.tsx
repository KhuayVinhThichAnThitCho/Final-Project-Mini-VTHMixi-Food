import React, { useState, useEffect, useCallback } from 'react';
import { Package, CheckCircle2, XCircle, Clock, Star, Image as ImageIcon, ChevronDown, ChevronUp, X, ZoomIn } from 'lucide-react';
import shipperApi from '../../services/shipperApi';

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Hoàn Thành', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delivering: { label: 'Đang Giao', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Đã Hủy', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const ShipperHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-2xl h-20 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Lịch Sử Giao Hàng</h1>
        <p className="text-sm font-medium text-gray-500 mt-2">{orders.length} đơn hàng đã vận chuyển</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package size={28} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-base">Bạn chưa thực hiện đơn hàng nào</p>
            <p className="text-gray-400 text-sm mt-1.5">Lịch sử giao hàng sẽ hiển thị tại đây</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
            const isExpanded = expandedId === order.id;
            const hasPhotos = order.pickupPhotoUrl || order.deliveryPhotoUrl;
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-modern-sm hover:shadow-modern transition-all duration-300 overflow-hidden"
              >
                {/* Row */}
                <button
                  className="w-full p-4 flex items-center gap-4 text-left focus:outline-none"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {order.status === 'completed'
                      ? <CheckCircle2 size={18} className="text-emerald-500" />
                      : <XCircle size={18} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">
                        #{order.id?.slice(-8).toUpperCase()}
                      </p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {order.restaurant?.name} → {order.user?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <div>
                      <p className="font-bold text-primary-600 text-sm lg:text-base">
                        +{Number(order.shippingFee || 15000).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-1">
                        <Clock size={10} />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 space-y-4 p-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Chi tiết món ăn</p>
                      <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-1.5">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-700">
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    {order.shipperRating && (
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Khách hàng đánh giá:</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < order.shipperRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos — full image, object-contain, with lightbox */}
                    {hasPhotos && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📸 Ảnh xác nhận</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Pickup photo */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                              Lấy hàng tại quán
                            </p>
                            {order.pickupPhotoUrl ? (
                              <div
                                className="relative bg-gray-900 rounded-xl overflow-hidden cursor-zoom-in group border border-gray-200"
                                onClick={() => setLightboxSrc(order.pickupPhotoUrl)}
                              >
                                <img
                                  src={order.pickupPhotoUrl}
                                  alt="Ảnh lấy hàng"
                                  className="w-full object-contain max-h-56 block"
                                  style={{ background: '#111827' }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                                    <ZoomIn size={16} className="text-gray-700" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl py-8 flex flex-col items-center justify-center gap-2">
                                <ImageIcon size={24} className="text-gray-300" />
                                <p className="text-xs text-gray-400">Không có ảnh lấy hàng</p>
                              </div>
                            )}
                          </div>

                          {/* Delivery photo */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              Giao đến khách hàng
                            </p>
                            {order.deliveryPhotoUrl ? (
                              <div
                                className="relative bg-gray-900 rounded-xl overflow-hidden cursor-zoom-in group border border-gray-200"
                                onClick={() => setLightboxSrc(order.deliveryPhotoUrl)}
                              >
                                <img
                                  src={order.deliveryPhotoUrl}
                                  alt="Ảnh giao hàng"
                                  className="w-full object-contain max-h-56 block"
                                  style={{ background: '#111827' }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                                    <ZoomIn size={16} className="text-gray-700" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl py-8 flex flex-col items-center justify-center gap-2">
                                <ImageIcon size={24} className="text-gray-300" />
                                <p className="text-xs text-gray-400">Không có ảnh giao hàng</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <X size={20} className="text-white" />
          </button>
          <img
            src={lightboxSrc}
            alt="Ảnh phóng to"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ShipperHistory;
