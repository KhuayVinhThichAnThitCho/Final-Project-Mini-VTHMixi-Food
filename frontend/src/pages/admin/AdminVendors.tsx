import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react';

import adminApi from '../../services/adminApi';

const VendorStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    open: 'bg-green-100 text-green-800 border-green-300',
    closed: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    pending: 'bg-secondary-100 text-secondary-800 border-secondary-300',
    banned: 'bg-red-100 text-red-800 border-red-300',
  };
  const labels: Record<string, string> = {
    open: '🟢 Đang mở', closed: '⭕ Đã đóng', pending: '⏳ Chờ duyệt', banned: '🚫 Bị cấm',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${map[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Status Action Modal ──────────────────────────────────────
const StatusModal: React.FC<{
  vendor: any; onClose: () => void;
  onSubmit: (status: string, reason: string) => void;
  isLoading: boolean;
}> = ({ vendor, onClose, onSubmit, isLoading }) => {
  const [status, setStatus] = useState('open');
  const [reason, setReason] = useState('');

  const actions = [
    { value: 'open', label: '✅ Duyệt & Mở', color: 'bg-green-600' },
    { value: 'closed', label: '⭕ Đóng cửa', color: 'bg-neutral-600' },
    { value: 'pending', label: '⏳ Đặt về Pending', color: 'bg-secondary-600' },
    { value: 'banned', label: '🚫 Cấm nhà hàng', color: 'bg-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b-2 border-neutral-200">
          <h3 className="font-heading font-bold text-neutral-900">Cập nhật Trạng thái Nhà hàng</h3>
          <p className="font-mono text-xs text-neutral-400 mt-0.5 truncate">{vendor?.name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">Trạng thái mới</label>
            <div className="space-y-2">
              {actions.map(a => (
                <button
                  key={a.value}
                  onClick={() => setStatus(a.value)}
                  className={`w-full text-left px-4 py-2.5 border-2 font-mono text-sm font-bold transition-all ${
                    status === a.value
                      ? `${a.color} text-white border-transparent shadow-retro-sm`
                      : 'bg-transparent text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">Lý do (tùy chọn)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do..."
              className="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-neutral-200 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border-2 border-neutral-200 font-mono text-sm text-neutral-600 hover:bg-neutral-50">Hủy</button>
          <button
            onClick={() => onSubmit(status, reason)}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white border-2 border-primary-700 font-mono text-sm font-bold uppercase tracking-wider hover:bg-primary-500 shadow-retro-sm disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminVendors: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalVendor, setModalVendor] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', search, filterStatus, page],
    queryFn: () => adminApi.getVendors({ search: search || undefined, status: filterStatus || undefined, page, limit: 10 }),
  });

  const vendors: any[] = (data as any)?.vendors || [];
  const pagination = (data as any)?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      adminApi.updateVendorStatus(id, status, reason),
    onSuccess: () => {
      // Invalidate danh sách vendor
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      // Invalidate các ô stat cards (count theo từng status)
      queryClient.invalidateQueries({ queryKey: ['admin-vendors-count'] });
      setModalVendor(null);
    },
  });


  // Query đếm số lượng theo từng trạng thái
  const { data: openData } = useQuery({
    queryKey: ['admin-vendors-count', 'open'],
    queryFn: () => adminApi.getVendors({ status: 'open', page: 1, limit: 1 }),
  });
  const { data: pendingData } = useQuery({
    queryKey: ['admin-vendors-count', 'pending'],
    queryFn: () => adminApi.getVendors({ status: 'pending', page: 1, limit: 1 }),
  });
  const { data: bannedData } = useQuery({
    queryKey: ['admin-vendors-count', 'banned'],
    queryFn: () => adminApi.getVendors({ status: 'banned', page: 1, limit: 1 }),
  });

  const countOpen    = (openData as any)?.pagination?.total ?? '—';
  const countPending = (pendingData as any)?.pagination?.total ?? '—';
  const countBanned  = (bannedData as any)?.pagination?.total ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-02</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Quản Lý Vendor</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tất cả', value: pagination?.total ?? 0, filter: '', color: 'border-neutral-300' },
          { label: 'Đang mở', value: countOpen, filter: 'open', color: 'border-green-300' },
          { label: 'Chờ duyệt', value: countPending, filter: 'pending', color: 'border-secondary-300' },
          { label: 'Bị cấm', value: countBanned, filter: 'banned', color: 'border-red-300' },
        ].map(item => (
          <button
            key={item.filter}
            onClick={() => { setFilterStatus(item.filter); setPage(1); }}
            className={`p-3 bg-[#FEFCF9] border-2 text-left transition-all hover:shadow-saigon-sm ${
              filterStatus === item.filter ? 'border-primary-500 shadow-saigon-sm' : item.color
            }`}
          >
            <p className="font-mono text-lg font-bold text-neutral-900">{item.value}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-wide">{item.label}</p>
          </button>
        ))}
      </div>


      {/* Filter */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm tên nhà hàng, địa chỉ..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">Tất cả Status</option>
          {['open', 'closed', 'pending', 'banned'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                {['Nhà hàng', 'Chủ quán', 'Địa chỉ', 'Rating', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-neutral-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <AlertCircle size={36} className="text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-body text-neutral-400">Không tìm thấy nhà hàng</p>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-display italic text-sm text-neutral-900 font-semibold">{vendor.name}</p>
                      <p className="font-mono text-xs text-neutral-400 mt-0.5">#{vendor.id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-neutral-700">{vendor.owner?.name || '—'}</p>
                      <p className="font-mono text-xs text-neutral-400">{vendor.owner?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-xs text-neutral-500 max-w-32 truncate">{vendor.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-bold text-secondary-600">
                        ⭐ {Number(vendor.ratingAvg || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <VendorStatusBadge status={vendor.status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setModalVendor(vendor)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border-2 border-neutral-200 font-mono text-xs font-bold text-neutral-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-all"
                      >
                        Cập nhật <ChevronDown size={12} />
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
              Trang {pagination.page} / {pagination.totalPages} — {pagination.total} kết quả
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

      {modalVendor && (
        <StatusModal
          vendor={modalVendor}
          onClose={() => setModalVendor(null)}
          onSubmit={(status, reason) => statusMutation.mutate({ id: modalVendor.id, status, reason })}
          isLoading={statusMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminVendors;
