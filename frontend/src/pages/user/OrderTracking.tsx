import React, { useState } from 'react';
import Header from '../../components/organisms/Header';
import Button from '../../components/atoms/Button';
import { ShoppingBag, Clock, Ban } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

interface OrderMock {
  id: string;
  restaurantName: string;
  items: string;
  totalAmount: number;
  createdAt: Date;
  status: OrderStatus;
}

const MOCK_ORDERS: OrderMock[] = [
  {
    id: 'ORD-9482',
    restaurantName: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    items: '2x Hủ tiếu mì sườn, 1x Cà phê sữa đá',
    totalAmount: 108000,
    createdAt: new Date(),
    status: 'preparing', // Đang chế biến
  },
  {
    id: 'ORD-8103',
    restaurantName: 'Cơm Tấm Bãi Rác Quận 4',
    items: '1x Cơm sườn bì chả đặc biệt',
    totalAmount: 65000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 tiếng trước
    status: 'completed', // Đã giao xong
  },
];

export const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<OrderMock[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderMock>(MOCK_ORDERS[0]);

  // Trạng thái đơn hàng dạng danh sách các bước
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: '1. Đơn mới' },
    { key: 'confirmed', label: '2. Xác nhận' },
    { key: 'preparing', label: '3. Chuẩn bị' },
    { key: 'delivering', label: '4. Đang giao' },
    { key: 'completed', label: '5. Hoàn tất' },
  ];

  const handleCancelOrder = (orderId: string, currentStatus: OrderStatus) => {
    // Logic hủy đơn theo yêu cầu của thầy:
    if (currentStatus === 'pending' || currentStatus === 'confirmed') {
      // Cho phép hủy trực tiếp
      const confirmDirect = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này trực tiếp?');
      if (confirmDirect) {
        updateOrderStatus(orderId, 'cancelled');
        alert('Đơn hàng của bạn đã được hủy thành công.');
      }
    } else if (currentStatus === 'preparing') {
      // Đang chuẩn bị: Gửi yêu cầu hủy cho shop
      alert('Đơn hàng đang được nhà hàng chuẩn bị. Nhóm đã gửi yêu cầu hủy đơn cho nhà hàng duyệt.');
    } else {
      alert('Đơn hàng đã được giao hoặc giao đi, không thể yêu cầu hủy.');
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    const selected = updated.find((o) => o.id === orderId);
    if (selected) setSelectedOrder(selected);
  };

  // Lấy chỉ mục bước hiện tại
  const getActiveStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={0} />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8 border-b-2 border-neutral-900 pb-2">THEO DÕI ĐƠN HÀNG</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH ĐƠN HÀNG ĐÃ MUA */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-1.5 mb-2 font-heading">
              <ShoppingBag size={18} className="text-primary-600" />
              Lịch sử mua hàng
            </h2>

            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`card-retro p-4 cursor-pointer bg-white hover:bg-neutral-50 transition-colors ${
                    selectedOrder.id === order.id ? 'border-primary-600 shadow-retro-sm translate-x-[2px] translate-y-[2px]' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-500">#{order.id}</span>
                    <span
                      className={`text-[10px] font-mono font-black border px-1.5 py-0.5 rounded-sm uppercase ${
                        order.status === 'completed'
                          ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                          : order.status === 'cancelled'
                          ? 'border-primary-600 text-primary-600 bg-[#BF3A20]/5'
                          : 'border-secondary-500 text-secondary-500 bg-secondary-500/5'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{order.restaurantName}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-1 font-body">{order.items}</p>
                  <p className="price-text text-sm font-bold text-primary-600 mt-2">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: TIẾN TRÌNH THEO DÕI ĐƠN ĐANG CHỌN */}
          <div className="lg:col-span-2">
            <div className="card-retro bg-white h-full flex flex-col justify-between">
              
              <div>
                {/* Header Tiết trình */}
                <div className="flex justify-between items-start border-b border-neutral-200 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{selectedOrder.restaurantName}</h2>
                    <p className="text-xs text-neutral-500">Mã hóa đơn: <span className="font-mono font-bold">#{selectedOrder.id}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 font-body">Tổng cộng</p>
                    <p className="price-text text-xl font-black text-primary-600">
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>

                {/* Sơ đồ trạng thái đơn hàng */}
                {selectedOrder.status === 'cancelled' ? (
                  <div className="border-2 border-primary-600 bg-[#BF3A20]/5 p-4 text-center text-primary-600 font-serif font-black italic rounded-sm mb-8">
                    ★ ĐƠN HÀNG ĐÃ BỊ HỦY BỎ ★
                  </div>
                ) : (
                  <div className="relative flex items-center justify-between flex-wrap gap-4 mb-8 pt-4">
                    {/* Đường line kết nối các bước */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -translate-y-1/2 z-0 hidden md:block"></div>
                    
                    {steps.map((step, index) => {
                      const activeIndex = getActiveStepIndex(selectedOrder.status);
                      const isCompleted = index <= activeIndex;
                      const isCurrent = index === activeIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center z-10 bg-white px-2">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all ${
                              isCurrent
                                ? 'bg-primary-600 border-neutral-900 text-white scale-110 shadow-retro-sm'
                                : isCompleted
                                ? 'bg-secondary-100 border-neutral-900 text-neutral-900'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-500/40'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                              isCompleted ? 'text-neutral-900' : 'text-neutral-500/40'
                            }`}
                          >
                            {step.label.split('. ')[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chi tiết đơn */}
                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm space-y-2 mb-6">
                  <h4 className="text-xs font-mono font-black text-neutral-500 uppercase">Chi tiết đơn đặt</h4>
                  <p className="text-sm font-semibold font-body">{selectedOrder.items}</p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 font-body">
                    <Clock size={12} />
                    Đặt lúc: {selectedOrder.createdAt.toLocaleTimeString('vi-VN')} ngày {selectedOrder.createdAt.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Nút hành động */}
              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                <div className="border-t border-neutral-200 pt-4 flex justify-end">
                  <Button
                    onClick={() => handleCancelOrder(selectedOrder.id, selectedOrder.status)}
                    variant="retro"
                    className="flex items-center gap-1.5 px-6 py-2 bg-white text-primary-600 hover:bg-[#BF3A20]/5 text-sm"
                  >
                    <Ban size={16} />
                    Yêu cầu hủy đơn hàng
                  </Button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t-2 border-neutral-900 py-6 text-center text-xs text-neutral-500">
        <p className="font-display italic font-bold text-sm text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
      </footer>
    </div>
  );
};

export default OrderTracking;
