import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowDownCircle, TrendingUp, Building, Loader2, AlertCircle, RefreshCcw, Plus, X } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface WalletData {
  balance: number;
  pendingBalance: number;
}

interface MockTransaction {
  id: string;
  type: 'RECEIVE' | 'WITHDRAW' | 'PAYMENT';
  amount: number;
  description: string;
  createdAt: string;
  status: 'SUCCESS' | 'PENDING';
}

export const VendorWallet: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [restaurantStats, setRestaurantStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Mock transactions vì backend dùng in-memory
  const [transactions] = useState<MockTransaction[]>([
    { id: 'TXN-001', type: 'RECEIVE', amount: 1240000, description: 'Doanh thu ngày hôm nay', createdAt: new Date().toISOString(), status: 'SUCCESS' },
    { id: 'TXN-002', type: 'WITHDRAW', amount: 5000000, description: 'Rút tiền về Vietcombank', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'SUCCESS' },
    { id: 'TXN-003', type: 'RECEIVE', amount: 1150000, description: 'Doanh thu hôm qua', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'SUCCESS' },
  ]);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletRes, restRes] = await Promise.all([
        vendorApi.getWalletBalance(),
        vendorApi.getMyRestaurant(),
      ]);
      setWalletData(walletRes?.data || { balance: 0, pendingBalance: 0 });

      if (restRes?.data?.id) {
        const statsRes = await vendorApi.getVendorStats(restRes.data.id);
        setRestaurantStats(statsRes?.data || null);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin ví.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      setDepositError('Số tiền nạp phải lớn hơn 0.');
      return;
    }
    setDepositing(true);
    setDepositError(null);
    try {
      const res = await vendorApi.depositWallet(Number(depositAmount));
      setWalletData(res?.data || walletData);
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (err: any) {
      setDepositError(err?.message || 'Nạp tiền thất bại.');
    } finally {
      setDepositing(false);
    }
  };

  const formatMoney = (amount: number) => Number(amount).toLocaleString('vi-VN');
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải ví điện tử...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchWallet} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  const totalRevenue = restaurantStats?.totalRevenue || 0;
  const completedCount = restaurantStats?.ordersByStatus?.find((s: any) => s.status === 'completed')?.count || 0;
  const cancelledCount = restaurantStats?.ordersByStatus?.find((s: any) => s.status === 'cancelled')?.count || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Ví & Doanh Thu</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Sổ quản lý tài chính và nạp tiền</p>
        </div>
        <button onClick={fetchWallet} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
          <RefreshCcw size={16} /> Làm Mới
        </button>
      </div>

      {/* Wallet Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm relative overflow-hidden group hover:shadow-modern transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500 opacity-50"></div>

          <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex justify-between items-center relative z-10">
            <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
              <Building size={24} className="text-primary-500" /> Sổ Tài Khoản Quán
            </h2>
          </div>

          <div className="p-8 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Số Dư Khả Dụng</h3>
            <p className="font-mono text-5xl font-bold text-primary-600 mb-4 tracking-tight">
              {formatMoney(walletData?.balance || 0)} đ
            </p>
            {(walletData?.pendingBalance || 0) > 0 && (
              <div className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-100">
                Đang tạm giữ chờ đối soát: {formatMoney(walletData?.pendingBalance || 0)} đ
              </div>
            )}
          </div>

          <div className="p-6 pt-0 relative z-10 flex gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold shadow-modern-sm hover:shadow-modern-glow active:scale-[0.98] transition-all"
            >
              <Plus size={22} /> Nạp Tiền
            </button>
            <button className="flex-1 flex justify-center items-center gap-2 bg-white border-2 border-primary-200 text-primary-700 px-6 py-4 rounded-xl font-bold hover:bg-primary-50 active:scale-[0.98] transition-all">
              <ArrowDownCircle size={22} /> Rút Tiền
            </button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm p-8 relative overflow-hidden group hover:shadow-modern transition-all duration-300">
          <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 font-bold text-xs px-3 py-1 rounded-full border border-amber-100">
            BÁO CÁO TỔNG
          </div>
          <h3 className="text-xl font-bold border-b border-gray-100 pb-4 mb-6 flex items-center gap-2 text-gray-800">
            <TrendingUp size={24} className="text-amber-500" /> Thống Kê Doanh Thu
          </h3>

          <div className="space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Tổng doanh thu</span>
              <span className="font-mono font-bold text-xl text-gray-900">{formatMoney(totalRevenue)} đ</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Số đơn hoàn thành</span>
              <span className="font-bold text-lg text-gray-800">{completedCount} Đơn</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Đơn bị hủy</span>
              <span className="font-bold text-lg text-red-500">{cancelledCount} Đơn</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Chiết khấu sàn (10%)</span>
              <span className="font-mono font-bold text-xl text-amber-600">-{formatMoney(totalRevenue * 0.1)} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Thực nhận</span>
              <span className="font-mono font-bold text-xl text-emerald-600">{formatMoney(totalRevenue * 0.9)} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm mt-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white/50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Wallet size={20} className="text-primary-500" /> Lịch Sử Giao Dịch
          </h3>
          <span className="text-xs text-gray-400 font-medium">{transactions.length} giao dịch</span>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Wallet size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-5 px-6">Mã GD & Thời Gian</th>
                  <th className="py-5 px-6">Loại GD</th>
                  <th className="py-5 px-6">Số Tiền</th>
                  <th className="py-5 px-6">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-6">
                      <p className="font-mono font-bold text-gray-900">#{txn.id}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">{formatDate(txn.createdAt)}</p>
                    </td>
                    <td className="py-5 px-6 font-semibold text-gray-700">{txn.description}</td>
                    <td className={`py-5 px-6 font-mono font-bold text-lg ${txn.type === 'RECEIVE' ? 'text-emerald-600' : 'text-primary-600'}`}>
                      {txn.type === 'RECEIVE' ? '+' : '-'}{formatMoney(txn.amount)} đ
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full inline-block ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {txn.status === 'SUCCESS' ? 'THÀNH CÔNG' : 'ĐANG XỬ LÝ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !depositing && setShowDepositModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">💳 Nạp Tiền Vào Ví</h2>
              <button onClick={() => !depositing && setShowDepositModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {depositError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {depositError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số Tiền Nạp (VND)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="Ví dụ: 1000000"
                  min={1000}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono text-lg focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
                {depositAmount && Number(depositAmount) > 0 && (
                  <p className="text-sm text-primary-600 font-semibold mt-2">
                    ≈ {formatMoney(Number(depositAmount))} đ
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[100000, 500000, 1000000].map(amt => (
                  <button key={amt} onClick={() => setDepositAmount(String(amt))} className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all">
                    {formatMoney(amt)} đ
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowDepositModal(false)} disabled={depositing} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handleDeposit} disabled={depositing || !depositAmount} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98] disabled:opacity-60">
                {depositing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {depositing ? 'Đang nạp...' : 'Xác Nhận Nạp Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorWallet;
