import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, AlertCircle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; badge: string; btnColor: string }> = {
  pending:    { label: 'Chờ xác nhận', badge: 'bg-secondary-100 text-secondary-800 border-secondary-300', btnColor: 'bg-secondary-600 hover:bg-secondary-500' },
  confirmed:  { label: 'Đã xác nhận',  badge: 'bg-blue-100 text-blue-800 border-blue-300',               btnColor: 'bg-blue-600 hover:bg-blue-500' },
  preparing:  { label: 'Đang nấu',     badge: 'bg-orange-100 text-orange-800 border-orange-300',          btnColor: 'bg-orange-600 hover:bg-orange-500' },
  ready:      { label: 'Sẵn sàng',     badge: 'bg-green-100 text-green-800 border-green-300',             btnColor: 'bg-green-600 hover:bg-green-500' },
  delivering: { label: 'Đang giao',    badge: 'bg-purple-100 text-purple-800 border-purple-300',          btnColor: 'bg-purple-600 hover:bg-purple-500' },
  completed:  { label: 'Hoàn thành',   badge: 'bg-neutral-100 text-neutral-700 border-neutral-300',       btnColor: 'bg-neutral-600 hover:bg-neutral-500' },
  cancelled:  { label: 'Đã hủy',       badge: 'bg-red-100 text-red-800 border-red-300',                  btnColor: 'bg-red-600 hover:bg-red-500' },
};

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${cfg?.badge || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
      {cfg?.label || status}
    </span>
  );
};

const PaymentBadge: React.FC<{ method: string }> = ({ method }) => {
  const labels: Record<string, string> = { COD: '💵 COD', WALLET: '👛 Ví', POINTS: '⭐ Điểm' };
  return <span className="font-mono text-xs text-neutral-600">{labels[method] || method}</span>;
};

// ─── Order Detail Modal with Dispute Panel ────────────────────
const OrderDetailModal: React.FC<{
  orderId: string;
  onClose: () => void;
}> = ({ orderId, onClose }) => {
  const queryClient = useQueryClient();
  const [overrideStatus, setOverrideStatus] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: () => adminApi.getOrderDetail(orderId),
    retry: 1,
  });
  const order = (data as any)?.data;


  const overrideMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      adminApi.overrideOrderStatus(orderId, status, reason),
    onSuccess: (res) => {
      const msg = (res as any)?.message || 'Đã cập nhật trạng thái đơn hàng.';
      setSuccessMsg(msg);
      setShowConfirm(false);
      setOverrideStatus('');
      setReason('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const handleConfirmOverride = () => {
    if (!overrideStatus || reason.trim().length < 5) return;
    overrideMutation.mutate({ status: overrideStatus, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-neutral-200 flex items-center justify-between sticky top-0 bg-[#FEFCF9] z-10">
          <div>
            <h3 className="font-heading font-bold text-neutral-900">Chi tiết Đơn hàng</h3>
            {order && (
              <p className="font-mono text-xs text-neutral-400 mt-0.5">
                #{order.id?.toUpperCase()?.slice(0, 12)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-neutral-100" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle size={40} className="text-red-300 mx-auto" strokeWidth={1.5} />
            <p className="font-body text-neutral-500">Không thể tải chi tiết đơn hàng</p>
            <p className="font-mono text-xs text-neutral-400">
              {(error as any)?.message || 'Backend server có thể chưa được restart. Vui lòng thử lại.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border-2 border-neutral-300 font-mono text-xs text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              🔄 Thử lại
            </button>
          </div>
        ) : order ? (
          <div className="p-6 space-y-5 flex-1">
            {/* Success Notice */}
            {successMsg && (
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-400 px-4 py-3">
                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                <p className="font-mono text-xs text-green-700 font-bold">{successMsg}</p>
                <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-400 hover:text-green-600">
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Header Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 border border-neutral-200 p-3">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Mã đơn</p>
                <p className="font-mono text-sm font-bold text-neutral-900 mt-1">#{order.id?.toUpperCase()?.slice(0, 12)}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Trạng thái</p>
                <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Ngày đặt</p>
                <p className="font-mono text-xs text-neutral-700 mt-1">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Customer & Restaurant */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-neutral-200 p-4">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">Khách hàng</p>
                <p className="font-body text-sm font-semibold text-neutral-900">{order.user?.name}</p>
                <p className="font-mono text-xs text-neutral-500">{order.user?.email}</p>
                <p className="font-mono text-xs text-neutral-500">{order.user?.phone || '—'}</p>
              </div>
              <div className="border-2 border-neutral-200 p-4">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">Nhà hàng</p>
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
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Địa chỉ giao hàng</p>
                <p className="font-body text-sm text-neutral-700 mt-0.5">{order.deliveryAddress}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Tổng tiền</p>
                <p className="font-mono text-xl font-bold text-primary-600 mt-0.5">{formatVND(order.totalAmount)}</p>
                <PaymentBadge method={order.paymentMethod} />
              </div>
            </div>

            {/* ═══ DISPUTE INTERVENTION PANEL ═══ */}
            <div className="border-2 border-red-200 bg-red-50/50">
              <div className="px-4 py-3 border-b-2 border-red-200 flex items-center gap-2 bg-red-50">
                <ShieldAlert size={14} className="text-red-600" />
                <p className="font-mono text-xs font-bold text-red-700 uppercase tracking-wider">
                  Can thiệp Admin — Xử lý tranh chấp
                </p>
              </div>
              <div className="p-4 space-y-3">
                <p className="font-body text-xs text-neutral-500">
                  Chỉ sử dụng khi có khiếu nại. Admin có quyền chuyển đơn về bất kỳ trạng thái nào. Mọi thay đổi đều được ghi nhận.
                </p>

                {/* Status Buttons */}
                <div>
                  <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Chọn trạng thái mới</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(STATUS_CONFIG)
                      .filter(([s]) => s !== order.status)
                      .map(([s, cfg]) => (
                        <button
                          key={s}
                          onClick={() => { setOverrideStatus(s); setShowConfirm(false); setSuccessMsg(''); }}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-2 transition-all ${
                            overrideStatus === s
                              ? `${cfg.btnColor} text-white border-transparent shadow-retro-sm`
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Reason + Confirm */}
                {overrideStatus && (
                  <div className="space-y-3 border-t border-red-200 pt-3">
                    <div>
                      <label className="block font-mono text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">
                        Lý do can thiệp <span className="text-red-500">*</span> (tối thiểu 5 ký tự)
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        placeholder={`Nhập lý do chuyển đơn sang "${STATUS_CONFIG[overrideStatus]?.label}"...`}
                        className="w-full px-3 py-2.5 bg-white border-2 border-neutral-200 font-body text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-400 resize-none transition-colors"
                      />
                      {reason.length > 0 && reason.trim().length < 5 && (
                        <p className="font-mono text-[10px] text-red-500 mt-1">Cần ít nhất 5 ký tự</p>
                      )}
                    </div>

                    {!showConfirm ? (
                      <button
                        onClick={() => setShowConfirm(true)}
                        disabled={reason.trim().length < 5}
                        className="w-full px-4 py-2.5 bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-red-700 hover:bg-red-500 shadow-retro-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ⚠️ Xem lại trước khi xác nhận
                      </button>
                    ) : (
                      <div className="border-2 border-red-400 bg-white p-4 space-y-3">
                        <p className="font-mono text-xs font-bold text-red-700 uppercase tracking-wider">
                          ⚠️ Xác nhận can thiệp?
                        </p>
                        <div className="space-y-1 font-mono text-xs text-neutral-600">
                          <p>
                            Trạng thái: <span className="font-bold text-neutral-900">
                              {STATUS_CONFIG[order.status]?.label}
                            </span>
                            {' → '}
                            <span className={`font-bold ${overrideStatus === 'cancelled' ? 'text-red-600' : overrideStatus === 'completed' ? 'text-green-600' : 'text-primary-600'}`}>
                              {STATUS_CONFIG[overrideStatus]?.label}
                            </span>
                          </p>
                          <p>Lý do: <span className="font-bold text-neutral-900">"{reason}"</span></p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 px-3 py-2 border-2 border-neutral-200 font-mono text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleConfirmOverride}
                            disabled={overrideMutation.isPending}
                            className="flex-1 px-3 py-2 bg-red-600 text-white border-2 border-red-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-500 disabled:opacity-60 transition-all"
                          >
                            {overrideMutation.isPending ? 'Đang xử lý...' : '✓ Xác nhận Override'}
                          </button>
                        </div>
                        {overrideMutation.isError && (
                          <p className="font-mono text-[10px] text-red-600">
                            Lỗi: {(overrideMutation.error as any)?.response?.data?.message || 'Đã có lỗi xảy ra'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

  // Count queries cho stat cards — phải khai báo riêng lẻ (Rules of Hooks)
  const { data: dPending }    = useQuery({ queryKey: ['admin-orders-count', 'pending'],    queryFn: () => adminApi.getOrders({ status: 'pending',    page: 1, limit: 1 }) });
  const { data: dDelivering } = useQuery({ queryKey: ['admin-orders-count', 'delivering'], queryFn: () => adminApi.getOrders({ status: 'delivering', page: 1, limit: 1 }) });
  const { data: dCompleted }  = useQuery({ queryKey: ['admin-orders-count', 'completed'],  queryFn: () => adminApi.getOrders({ status: 'completed',  page: 1, limit: 1 }) });
  const { data: dCancelled }  = useQuery({ queryKey: ['admin-orders-count', 'cancelled'],  queryFn: () => adminApi.getOrders({ status: 'cancelled',  page: 1, limit: 1 }) });

  const statCards = [
    { label: 'Chờ xử lý',  status: 'pending',    color: 'border-secondary-300', count: (dPending    as any)?.pagination?.total ?? '—' },
    { label: 'Đang giao',   status: 'delivering', color: 'border-purple-300',    count: (dDelivering as any)?.pagination?.total ?? '—' },
    { label: 'Hoàn thành',  status: 'completed',  color: 'border-green-300',     count: (dCompleted  as any)?.pagination?.total ?? '—' },
    { label: 'Đã hủy',      status: 'cancelled',  color: 'border-red-300',       count: (dCancelled  as any)?.pagination?.total ?? '—' },
  ];


  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-04</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Quản Lý Đơn Hàng</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map(card => (
          <button
            key={card.status}
            onClick={() => { setFilterStatus(card.status); setPage(1); }}
            className={`p-3 bg-[#FEFCF9] border-2 text-left transition-all hover:shadow-saigon-sm ${
              filterStatus === card.status ? 'border-primary-500 shadow-saigon-sm' : card.color
            }`}
          >
            <p className="font-mono text-lg font-bold text-neutral-900">{card.count}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-wide">{card.label}</p>
          </button>
        ))}
      </div>


      {/* Filter Bar */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <option key={s} value={s}>{cfg.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 flex-1">
          <input
            type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500"
          />
          <span className="font-mono text-sm text-neutral-400">→</span>
          <input
            type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        {(filterStatus || dateFrom || dateTo) && (
          <button
            onClick={() => { setFilterStatus(''); setDateFrom(''); setDateTo(''); setPage(1); }}
            className="px-3 py-2.5 border-2 border-neutral-300 font-mono text-xs text-neutral-500 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <X size={12} /> Xóa filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                {['Mã đơn', 'Khách hàng', 'Nhà hàng', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày đặt', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-neutral-200 font-mono text-xs text-neutral-600 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
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
