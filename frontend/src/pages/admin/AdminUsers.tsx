import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, UserCog, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';


const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    admin: 'bg-primary-100 text-primary-800 border-primary-300',
    vendor: 'bg-blue-100 text-blue-800 border-blue-300',
    shipper: 'bg-orange-100 text-orange-800 border-orange-300',
    user: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${map[role] || 'bg-neutral-100 text-neutral-600'}`}>
      {role}
    </span>
  );
};

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    banned: 'bg-red-500',
    pending: 'bg-yellow-500',
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-neutral-400'}`} />
      <span className="font-mono text-xs text-neutral-600 capitalize">{status}</span>
    </span>
  );
};

// ─── Role Assign Modal ───────────────────────────────────────
const RoleModal: React.FC<{
  user: any;
  onClose: () => void;
  onSubmit: (role: string) => void;
  isLoading: boolean;
}> = ({ user, onClose, onSubmit, isLoading }) => {
  const [role, setRole] = useState(user?.role || 'user');

  return (
    <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
          <h3 className="font-heading font-bold text-neutral-900">Gán Role</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 p-3">
            <p className="font-body text-sm font-semibold text-neutral-900">{user?.name}</p>
            <p className="font-mono text-xs text-neutral-500 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
              Chọn Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['user', 'vendor', 'shipper', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-2.5 border-2 font-mono text-sm font-bold uppercase tracking-wide transition-all ${
                    role === r
                      ? 'bg-primary-600 text-white border-primary-700 shadow-retro-sm'
                      : 'bg-transparent text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
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
            onClick={() => onSubmit(role)}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white border-2 border-primary-700 font-mono text-sm font-bold uppercase tracking-wider hover:bg-primary-500 transition-colors shadow-retro-sm disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Ban Reason Modal ───────────────────────────────────────
const SUGGESTED_REASONS = [
  'Bom hàng / Hủy đơn liên tục không lý do',
  'Gian lận khuyến mãi / Tạo tài khoản ảo',
  'Vi phạm tiêu chuẩn cộng đồng / Ngôn từ quấy rối',
  'Hành vi bất thường / Nghi ngờ xâm nhập',
];

const BanModal: React.FC<{
  user: any;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}> = ({ user, onClose, onSubmit, isLoading }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
          <h3 className="font-heading font-bold text-neutral-900">Khóa Tài Khoản</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 p-3">
            <p className="font-body text-sm font-semibold text-neutral-900">{user?.name}</p>
            <p className="font-mono text-xs text-neutral-500 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1.5">
              Gợi ý lý do khóa nhanh
            </label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SUGGESTED_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="px-2.5 py-1 text-[11px] font-body text-left bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 transition-colors duration-150"
                >
                  {r}
                </button>
              ))}
            </div>
            <label className="block font-body text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
              Lý do chi tiết
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Nhập hoặc chỉnh sửa lý do khóa tài khoản..."
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
            onClick={() => onSubmit(reason.trim())}
            disabled={isLoading || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white border-2 border-red-700 font-mono text-sm font-bold uppercase tracking-wider hover:bg-red-500 transition-colors shadow-retro-sm disabled:opacity-50"
          >
            {isLoading ? 'Đang thực hiện...' : 'Khóa tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [roleModalUser, setRoleModalUser] = useState<any>(null);
  const [banModalUser, setBanModalUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, status, page],
    queryFn: () => adminApi.getUsers({ search: search || undefined, role: role || undefined, status: status || undefined, page, limit: 10 }),
  });

  const users: any[] = (data as any)?.users || [];
  const pagination = (data as any)?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ id, status, banReason }: { id: string; status: 'active' | 'banned'; banReason?: string }) =>
      adminApi.updateUserStatus(id, status, banReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setBanModalUser(null);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.assignRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setRoleModalUser(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-01</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Quản Lý User</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">Tất cả Role</option>
          {['user', 'vendor', 'shipper', 'admin'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">Tất cả Status</option>
          {['active', 'banned', 'pending'].map(s => (
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
                {['Người dùng', 'Email', 'Role', 'Trạng thái', 'Ngày tạo', 'Hành động'].map(h => (
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
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <AlertCircle size={36} className="text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-body text-neutral-400">Không tìm thấy user nào</p>
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                          <span className="font-mono text-xs font-bold text-primary-700">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="font-body text-sm font-semibold text-neutral-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-neutral-500">{user.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusDot status={user.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Lock/Unlock */}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => setBanModalUser(user)}
                            disabled={statusMutation.isPending}
                            title="Khóa tài khoản"
                            className="p-2 border border-red-300 text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Lock size={14} strokeWidth={1.5} />
                          </button>
                        )}
                        {/* Assign Role */}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => setRoleModalUser(user)}
                            title="Gán role"
                            className="p-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <UserCog size={14} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
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

      {/* Role Modal */}
      {roleModalUser && (
        <RoleModal
          user={roleModalUser}
          onClose={() => setRoleModalUser(null)}
          onSubmit={(role) => roleMutation.mutate({ id: roleModalUser.id, role })}
          isLoading={roleMutation.isPending}
        />
      )}

      {/* Ban Modal */}
      {banModalUser && (
        <BanModal
          user={banModalUser}
          onClose={() => setBanModalUser(null)}
          onSubmit={(reason) => statusMutation.mutate({ id: banModalUser.id, status: 'banned', banReason: reason })}
          isLoading={statusMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminUsers;
