import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, X, AlertCircle, Check, Ban } from 'lucide-react';
import adminApi from '../../services/adminApi';

const AppealStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${map[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  );
};

// ─── Resolve Modal ───────────────────────────────────────────
const ResolveModal: React.FC<{
  appeal: any;
  actionType: 'approved' | 'rejected';
  onClose: () => void;
  onSubmit: (response: string) => void;
  isLoading: boolean;
}> = ({ appeal, actionType, onClose, onSubmit, isLoading }) => {
  const [response, setResponse] = useState('');

  return (
    <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
          <h3 className="font-heading font-bold text-neutral-900">
            {actionType === 'approved' ? 'Chấp nhận & Mở khóa' : 'Từ chối đơn xin'}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs space-y-1">
            <p className="font-body text-sm font-semibold text-neutral-900">
              User: <span className="font-mono text-neutral-600">{appeal?.user?.name}</span>
            </p>
            <p className="font-body text-neutral-700">
              Lý do giải trình: <span className="italic font-sans text-neutral-600">"{appeal?.appealReason}"</span>
            </p>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
              Phản hồi từ Admin (Gửi qua Email cho User)
            </label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder={
                actionType === 'approved'
                  ? 'Ví dụ: Tài khoản của bạn đã được kích hoạt lại. Chào mừng trở lại!'
                  : 'Ví dụ: Yêu cầu bị từ chối do vi phạm quy định nhiều lần...'
              }
              rows={3}
              className="w-full px-3 py-2 bg-neutral-50 border-2 border-neutral-200 font-body text-sm text-neutral-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-neutral-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-neutral-200 font-mono text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(response.trim())}
            disabled={isLoading}
            className={`px-4 py-2 text-white border-2 font-mono text-sm font-bold uppercase tracking-wider transition-colors shadow-retro-sm disabled:opacity-50 ${
              actionType === 'approved'
                ? 'bg-green-600 border-green-700 hover:bg-green-500'
                : 'bg-red-600 border-red-700 hover:bg-red-500'
            }`}
          >
            {isLoading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminAppeals: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [resolveTarget, setResolveTarget] = useState<{ appeal: any; actionType: 'approved' | 'rejected' } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appeals', page],
    queryFn: () => adminApi.getAppeals({ page, limit: 10 }),
  });

  const appeals: any[] = (data as any)?.appeals || [];
  const pagination = (data as any)?.pagination;

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, adminResponse }: { id: string; status: 'approved' | 'rejected'; adminResponse?: string }) =>
      adminApi.resolveAppeal(id, status, adminResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appeals'] });
      setResolveTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-08</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Danh Sách Yêu Cầu Mở Khóa</h1>
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                {['Người dùng', 'Email', 'Lý do khóa cũ', 'Giải trình xin mở', 'Ngày gửi', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : appeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <AlertCircle size={36} className="text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-body text-neutral-400">Không có yêu cầu mở khóa nào</p>
                  </td>
                </tr>
              ) : (
                appeals.map((appeal: any) => (
                  <tr key={appeal.id} className="hover:bg-neutral-50/60 transition-colors text-sm">
                    <td className="px-5 py-4 font-semibold text-neutral-900">
                      {appeal.user?.name || 'Không rõ'}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-neutral-500">
                      {appeal.user?.email || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-neutral-600 max-w-xs truncate" title={appeal.user?.banReason}>
                      {appeal.user?.banReason || 'Không có lý do cụ thể'}
                    </td>
                    <td className="px-5 py-4 text-neutral-800 font-medium max-w-sm" title={appeal.appealReason}>
                      {appeal.appealReason}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-neutral-400">
                      {new Date(appeal.createdAt).toLocaleDateString('vi-VN')} {new Date(appeal.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-5 py-4">
                      <AppealStatusBadge status={appeal.status} />
                    </td>
                    <td className="px-5 py-4">
                      {appeal.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResolveTarget({ appeal, actionType: 'approved' })}
                            title="Chấp nhận mở khóa"
                            className="p-1.5 border border-green-300 text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setResolveTarget({ appeal, actionType: 'rejected' })}
                            title="Từ chối yêu cầu"
                            className="p-1.5 border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Ban size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">
                          Đã xử lý{appeal.adminResponse ? `: ${appeal.adminResponse}` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t-2 border-neutral-200 flex items-center justify-between">
            <p className="font-mono text-xs text-neutral-400">
              Trang {pagination.page} / {pagination.totalPages} — {pagination.total} kết quả
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveTarget && (
        <ResolveModal
          appeal={resolveTarget.appeal}
          actionType={resolveTarget.actionType}
          onClose={() => setResolveTarget(null)}
          onSubmit={response =>
            resolveMutation.mutate({
              id: resolveTarget.appeal.id,
              status: resolveTarget.actionType,
              adminResponse: response,
            })
          }
          isLoading={resolveMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminAppeals;
