import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Store, ShoppingBag, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import adminApi from '../../services/adminApi';

// ─── Helpers ────────────────────────────────────────────────
const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-secondary-100 text-secondary-800 border-secondary-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-orange-100 text-orange-800 border-orange-300',
    ready: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    delivering: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  const label: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', preparing: 'Đang nấu',
    ready: 'Sẵn sàng', completed: 'Hoàn thành', cancelled: 'Đã hủy', delivering: 'Đang giao',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wide border ${map[status] || 'bg-neutral-100 text-neutral-600 border-neutral-300'}`}>
      {label[status] || status}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, sub, trend }) => (
  <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card hover:shadow-saigon-card-hover transition-all duration-200 hover:-translate-y-0.5 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 flex items-center justify-center ${color} border-2 border-neutral-200`}>
        <Icon size={22} strokeWidth={1.5} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-mono font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="font-mono text-2xl font-bold text-neutral-900 leading-none">{value}</p>
    <p className="font-body text-xs text-neutral-500 uppercase tracking-widest mt-1">{label}</p>
    {sub && <p className="font-mono text-xs text-neutral-400 mt-2">{sub}</p>}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
const AdminOverview: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const stats = (data as any)?.data?.stats;
  const recentOrders = (data as any)?.data?.recentOrders || [];
  const recentUsers = (data as any)?.data?.recentUsers || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 border-2 border-neutral-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-neutral-100 border-2 border-neutral-200" />
          <div className="h-72 bg-neutral-100 border-2 border-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">Bảng điều khiển</p>
          <h1 className="font-display italic text-3xl text-neutral-900">Tổng Quan Hệ Thống</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-neutral-400">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary-300 to-transparent" />
        <span className="font-mono text-xs text-secondary-500 tracking-widest uppercase">Số liệu hôm nay</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary-300 to-transparent" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng User"
          value={stats?.totalUsers?.toLocaleString('vi-VN') || '0'}
          icon={Users}
          color="bg-primary-600"
          sub={`${stats?.totalVendors || 0} vendor`}
        />
        <StatCard
          label="Tổng Đơn Hàng"
          value={stats?.totalOrders?.toLocaleString('vi-VN') || '0'}
          icon={ShoppingBag}
          color="bg-secondary-600"
          sub={`${stats?.pendingOrders || 0} đang chờ`}
        />
        <StatCard
          label="Hoàn thành"
          value={`${stats?.completionRate || 0}%`}
          icon={CheckCircle}
          color="bg-green-700"
          sub={`${stats?.completedOrders || 0} đơn`}
        />
        <StatCard
          label="Doanh Thu"
          value={formatVND(stats?.totalRevenue || 0)}
          icon={TrendingUp}
          color="bg-neutral-700"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary-100 border-2 border-secondary-300 flex items-center justify-center flex-shrink-0">
            <Store size={18} strokeWidth={1.5} className="text-secondary-700" />
          </div>
          <div>
            <p className="font-mono text-xl font-bold text-neutral-900">{stats?.totalVendors || 0}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-widest">Nhà hàng</p>
          </div>
        </div>
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 border-2 border-orange-300 flex items-center justify-center flex-shrink-0">
            <Clock size={18} strokeWidth={1.5} className="text-orange-700" />
          </div>
          <div>
            <p className="font-mono text-xl font-bold text-neutral-900">{stats?.pendingVendors || 0}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-widest">Chờ duyệt</p>
          </div>
        </div>
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 border-2 border-red-300 flex items-center justify-center flex-shrink-0">
            <XCircle size={18} strokeWidth={1.5} className="text-red-700" />
          </div>
          <div>
            <p className="font-mono text-xl font-bold text-neutral-900">{stats?.cancelledOrders || 0}</p>
            <p className="font-body text-xs text-neutral-500 uppercase tracking-widest">Đã hủy</p>
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card">
          <div className="px-5 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
            <h3 className="font-heading font-bold text-neutral-900">Đơn Hàng Mới Nhất</h3>
            <span className="font-mono text-xs text-neutral-400">Top 5</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center">
                <AlertCircle size={32} className="text-neutral-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="font-body text-sm text-neutral-400">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold text-neutral-700 truncate">
                      #{order.id?.slice(0, 8)?.toUpperCase()}
                    </p>
                    <p className="font-body text-xs text-neutral-500 mt-0.5 truncate">
                      {order.user?.name} → {order.restaurant?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <p className="font-mono text-xs font-bold text-primary-600">
                      {formatVND(order.totalAmount || 0)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card">
          <div className="px-5 py-4 border-b-2 border-neutral-200 flex items-center justify-between">
            <h3 className="font-heading font-bold text-neutral-900">User Mới Đăng Ký</h3>
            <span className="font-mono text-xs text-neutral-400">Top 5</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center">
                <Users size={32} className="text-neutral-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="font-body text-sm text-neutral-400">Chưa có user nào</p>
              </div>
            ) : (
              recentUsers.map((user: any) => (
                <div key={user.id} className="px-5 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-700">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                    <p className="font-mono text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
