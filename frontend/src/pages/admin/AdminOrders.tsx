import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-secondary-100 text-secondary-800 border-secondary-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-orange-100 text-orange-800 border-orange-300',
    ready: 'bg-green-100 text-green-800 border-green-300',
    delivering: 'bg-purple-100 text-purple-800 border-purple-300',
    completed: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };
  const labels: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', preparing: 'Đang nấu',
    ready: 'Sẵn sàng', delivering: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${map[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[status] || status}
    </span>
  );
};

const PaymentBadge: React.FC<{ method: string }> = ({ method }) => {
  const labels: Record<string, string> = { COD: '💵 COD', WALLET: '👛 Ví', POINTS: '⭐ Điểm' };
  return (
    <span className="font-mono text-xs text-neutral-600">{labels[method] || method}</span>
  );
};

// ─── Order Detail Modal ───────────────────────────────────────
const OrderDetailModal: React.FC<{ orderId: string; onClose: () => void }> = ({ orderId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: () => adminApi.getOrderDetail(orderId),
  });
  const order = (data as any)?.data;

  return (
    <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b-2 border-neutral-200 flex items-center justify-between sticky top-0 bg-[#FEFCF9] z-10">
          <h3 className="font-heading font-bold text-neutral-900">Chi tiết Đơn hàng</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 font-mono text-lg">✕</button>
        </div>
        {isLoading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-neutral-100" />)}
          </div>
        ) : order ? (
          <div className="p-6 space-y-5">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 border border-neutral-200 p-3">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Mã đơn</p>
                <p className="font-mono text-sm font-bold text-neutral-900 mt-1">#{order.id?.toUpperCase()?.slice(0, 12)}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Trạng thái</p>
                <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
              </div>
            </div>

            {/* Customer & Restaurant */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-neutral-200 p-4">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">Khách hàng</p>
                <p className="font-body text-sm font-semibold text-neutral-900">{order.user?.name}</p>
                <p className="font-mono text-xs text-neutral-500">{order.user?.email}</p>
                <p className="font-mono text-xs text-neutral-500">{order.user?.phone || '—'}</p>
              </div>
              <div className="border-2 border-neutral-200 p-4">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">Nhà hàng</p>
                <p className="font-display italic text-sm font-semibold text-neutral-900">{order.restaurant?.name}</p>
                <p className="font-mono text-xs text-neutral-500">{order.restaurant?.address}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-2 border-neutral-200">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <p className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">Danh sách món</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-neutral-900">{item.name}</p>
                      <p className="font-mono text-xs text-neutral-400">x{item.quantity}</p>
                    </div>
                    <p className="font-mono text-sm font-bold text-primary-600">{formatVND(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t-2 border-neutral-900 pt-4">
              <div>
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Địa chỉ giao hàng</p>
                <p className="font-body text-sm text-neutral-700 mt-0.5">{order.deliveryAddress}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Tổng tiền</p>
                <p className="font-mono text-xl font-bold text-primary-600 mt-0.5">{formatVND(order.totalAmount)}</p>
                <PaymentBadge method={order.paymentMethod} />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-neutral-400">Không tìm thấy đơn hàng</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminOrders: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus, dateFrom, dateTo, page],
    queryFn: () => adminApi.getOrders({
      status: filterStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 10,
    }),
  });

  const orders: any[] = (data as any)?.orders || [];
  const pagination = (data as any)?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-04</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Quản Lý Đơn Hàng</h1>
      </div>

      {/* Filter */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">Tất cả trạng thái</option>
          {['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 flex-1">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500" />
          <span className="font-mono text-sm text-neutral-400">→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                {['Mã đơn', 'Khách hàng', 'Nhà hàng', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày đặt', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-neutral-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <AlertCircle size={36} className="text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-body text-neutral-400">Không có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-neutral-700">
                        #{order.id?.slice(0, 8)?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-neutral-800">{order.user?.name}</p>
                      <p className="font-mono text-xs text-neutral-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-display italic text-sm text-neutral-700 max-w-28 truncate">{order.restaurant?.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-primary-600">{formatVND(order.totalAmount || 0)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge method={order.paymentMethod} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailOrderId(order.id)}
                        className="px-3 py-1.5 border-2 border-neutral-200 font-mono text-xs text-neutral-600 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t-2 border-neutral-200 flex items-center justify-between">
            <p className="font-mono text-xs text-neutral-400">
              Trang {pagination.page} / {pagination.totalPages} — {pagination.total} đơn hàng
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {detailOrderId && (
        <OrderDetailModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />
      )}
    </div>
  );
};

export default AdminOrders;
