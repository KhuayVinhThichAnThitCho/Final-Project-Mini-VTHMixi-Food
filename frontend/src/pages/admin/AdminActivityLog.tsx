import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList, ChevronLeft, ChevronRight, Filter, Calendar,
  UserCog, Shield, Store, Settings, Trash2, Eye, ArrowRightLeft, Search
} from 'lucide-react';
import adminApi from '../../services/adminApi';

// ─── Cấu hình hiển thị từng loại action ───────────────────────
const ACTION_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  USER_STATUS_CHANGE: {
    label: 'Khóa/Mở khóa User',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  USER_ROLE_ASSIGN: {
    label: 'Gán Role',
    icon: UserCog,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  VENDOR_STATUS_CHANGE: {
    label: 'Trạng thái Vendor',
    icon: Store,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  PRODUCT_HARD_DELETE: {
    label: 'Xóa sản phẩm',
    icon: Trash2,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  PRODUCT_VISIBILITY_TOGGLE: {
    label: 'Ẩn/Hiện sản phẩm',
    icon: Eye,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  ORDER_STATUS_OVERRIDE: {
    label: 'Can thiệp đơn hàng',
    icon: ArrowRightLeft,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  SYSTEM_CONFIG_UPDATE: {
    label: 'Cập nhật cấu hình',
    icon: Settings,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  SYSTEM_CONFIG_BATCH_UPDATE: {
    label: 'Cập nhật hàng loạt',
    icon: Settings,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
};

const ALL_ACTIONS = Object.keys(ACTION_CONFIG);

// ─── Badge hiển thị loại action ─────────────────────────────────
const ActionBadge: React.FC<{ action: string }> = ({ action }) => {
  const config = ACTION_CONFIG[action] || {
    label: action,
    icon: ClipboardList,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      <Icon size={12} strokeWidth={2} />
      {config.label}
    </span>
  );
};

// ─── Target Type Badge ──────────────────────────────────────────
const TargetBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { label: string; cls: string }> = {
    user: { label: 'User', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    restaurant: { label: 'Nhà hàng', cls: 'bg-green-50 text-green-700 border-green-200' },
    menuItem: { label: 'Sản phẩm', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    order: { label: 'Đơn hàng', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    config: { label: 'Cấu hình', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  };
  const cfg = map[type] || { label: type, cls: 'bg-neutral-50 text-neutral-600 border-neutral-200' };

  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};


// ─── Thời gian hiển thị ─────────────────────────────────────────
const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative = '';
  if (diffMins < 1) relative = 'Vừa xong';
  else if (diffMins < 60) relative = `${diffMins} phút trước`;
  else if (diffHours < 24) relative = `${diffHours} giờ trước`;
  else if (diffDays < 7) relative = `${diffDays} ngày trước`;
  else relative = d.toLocaleDateString('vi-VN');

  const full = d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return { relative, full };
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────
const AdminActivityLog: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-activity-logs', page, filterAction, dateFrom, dateTo],
    queryFn: () =>
      adminApi.getActivityLogs({
        page,
        limit: 15,
        action: filterAction || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const logs = (data as any)?.logs || [];
  const pagination = (data as any)?.pagination || { total: 0, page: 1, totalPages: 1 };

  const clearFilters = () => {
    setFilterAction('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = filterAction || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display italic text-2xl text-neutral-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 flex items-center justify-center border-2 border-secondary-300 shadow-retro-sm">
              <ClipboardList size={20} className="text-white" strokeWidth={1.5} />
            </div>
            Lịch Sử Hoạt Động
          </h1>
          <p className="font-mono text-xs text-neutral-500 mt-1 ml-[52px]">
            Ghi lại toàn bộ hành động thay đổi dữ liệu của Admin
          </p>
        </div>

        {/* Toggle filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-wider border-2 transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-primary-600 text-white border-primary-700 shadow-retro-sm'
              : 'bg-[#FEFCF9] text-neutral-700 border-neutral-300 hover:border-neutral-500'
          }`}
        >
          <Filter size={16} strokeWidth={1.5} />
          Bộ Lọc
          {hasActiveFilters && (
            <span className="bg-secondary-400 text-neutral-900 text-[9px] px-1.5 py-0.5 font-bold">
              ON
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-retro-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-neutral-400" />
            <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Bộ lọc nâng cao
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Action */}
            <div>
              <label className="block font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Loại hành động
              </label>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-neutral-200 bg-white font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">Tất cả</option>
                {ALL_ACTIONS.map(action => (
                  <option key={action} value={action}>
                    {ACTION_CONFIG[action].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Calendar size={10} className="inline mr-1" />
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-neutral-200 bg-white font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Calendar size={10} className="inline mr-1" />
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-neutral-200 bg-white font-mono text-sm text-neutral-700 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold text-primary-600 hover:text-primary-800 uppercase tracking-wider transition-colors"
              >
                ✕ Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-4 bg-neutral-100 border border-neutral-200 px-4 py-2.5">
        <span className="font-mono text-xs text-neutral-500">
          Tổng: <strong className="text-neutral-800">{pagination.total}</strong> bản ghi
        </span>
        <span className="text-neutral-300">|</span>
        <span className="font-mono text-xs text-neutral-500">
          Trang <strong className="text-neutral-800">{pagination.page}</strong> / {pagination.totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-retro-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[140px_1fr_120px] gap-0 bg-neutral-900 text-white px-4 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Thời gian</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Hành động</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Đối tượng</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent animate-spin" />
              <span className="font-mono text-xs text-neutral-400">Đang tải lịch sử...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="font-mono text-sm text-red-600 font-bold">Lỗi tải dữ liệu</p>
              <p className="font-mono text-xs text-neutral-400 mt-1">Vui lòng thử lại sau</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && logs.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center mx-auto mb-3">
                <Search size={28} className="text-neutral-300" />
              </div>
              <p className="font-mono text-sm text-neutral-500 font-bold">Chưa có lịch sử hoạt động</p>
              <p className="font-mono text-xs text-neutral-400 mt-1">
                {hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Các hành động Admin sẽ hiển thị ở đây'}
              </p>
            </div>
          </div>
        )}

        {/* Rows */}
        {!isLoading && !isError && logs.map((log: any) => {
          const time = formatTime(log.createdAt);

          return (
            <div key={log.id} className="border-b border-neutral-100 last:border-b-0">
              <div className="grid grid-cols-[140px_1fr_120px] gap-0 px-4 py-3 hover:bg-neutral-50 transition-colors">
                {/* Time */}
                <div className="flex flex-col justify-center">
                  <span className="font-mono text-xs font-bold text-neutral-800">{time.relative}</span>
                  <span className="font-mono text-[10px] text-neutral-400 mt-0.5">{time.full}</span>
                </div>

                {/* Action + Description */}
                <div className="flex flex-col justify-center gap-1.5 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionBadge action={log.action} />
                    {log.admin && (
                      <span className="font-mono text-[10px] text-neutral-400">
                        bởi <strong className="text-neutral-600">{log.admin.name}</strong>
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-neutral-700 leading-snug">{log.description}</p>
                </div>

                {/* Target */}
                <div className="flex items-center">
                  <TargetBadge type={log.targetType} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-neutral-400">
            Hiển thị {logs.length} / {pagination.total} bản ghi
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 font-mono text-xs font-bold border-2 border-neutral-200 bg-[#FEFCF9] text-neutral-700 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Trước
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 font-mono text-xs font-bold border-2 transition-all ${
                    page === pageNum
                      ? 'bg-primary-600 text-white border-primary-700 shadow-retro-sm'
                      : 'bg-[#FEFCF9] text-neutral-600 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-2 font-mono text-xs font-bold border-2 border-neutral-200 bg-[#FEFCF9] text-neutral-700 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLog;
