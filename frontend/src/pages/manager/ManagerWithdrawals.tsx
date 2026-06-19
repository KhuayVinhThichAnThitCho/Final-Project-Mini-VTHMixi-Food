import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Wallet, Check, X, Building2 } from 'lucide-react';

interface Withdrawal {
  id: string;
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: string;
  reason?: string;
  createdAt: string;
}

const ManagerWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [actionModal, setActionModal] = useState<{isOpen: boolean, withdrawalId: string, action: 'approved' | 'rejected'}>({
    isOpen: false,
    withdrawalId: '',
    action: 'approved'
  });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/withdrawals') as any;
      setWithdrawals(res.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionModal.action === 'rejected' && !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      await api.patch(`/manager/withdrawals/${actionModal.withdrawalId}/process`, {
        action: actionModal.action,
        reason: reason
      });
      fetchWithdrawals();
      setActionModal({ ...actionModal, isOpen: false });
      setReason('');
    } catch (error) {
      console.error('Failed to process withdrawal:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Yêu Cầu Rút Tiền</h2>
        <div className="divider-saigon mt-2 max-w-xs"></div>
        <p className="text-[#9E6E4A] font-body mt-3">Quản lý và duyệt các yêu cầu rút doanh thu của Vendor.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#BF3A20] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-[#FEFCF9] rounded-xl shadow-card border border-[#E8D8C6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF0D2] border-b-2 border-[#E8D8C6]">
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Vendor</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Thông tin Bank</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Số tiền</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((item) => (
                  <tr key={item.id} className="border-b border-[#E8D8C6] hover:bg-[#FAF7F3] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#2C1A0E]">{item.vendor.name}</p>
                      <p className="text-xs text-[#9E6E4A]">{item.vendor.phone}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <Building2 size={16} className="text-[#BF3A20] mt-1" />
                        <div>
                          <p className="font-bold text-[#7A5235] text-sm">{item.bankInfo.bankName}</p>
                          <p className="text-xs font-mono text-[#9E6E4A]">{item.bankInfo.accountNumber}</p>
                          <p className="text-[10px] uppercase text-[#BF3A20] font-bold">{item.bankInfo.accountName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-lg font-mono font-bold text-[#2C1A0E]">
                        {Number(item.amount).toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.reason && (
                          <span className="text-[10px] text-red-500 italic max-w-[150px] truncate" title={item.reason}>
                            Lý do: {item.reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setActionModal({ isOpen: true, action: 'approved', withdrawalId: item.id })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Đã chuyển tiền"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => setActionModal({ isOpen: true, action: 'rejected', withdrawalId: item.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Từ chối"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#9E6E4A]">Không có yêu cầu rút tiền nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Process */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FEFCF9] rounded-xl shadow-2xl max-w-md w-full border-2 border-saigon-neutral-text overflow-hidden scale-in">
            <div className={`p-4 border-b-2 border-saigon-neutral-text ${actionModal.action === 'approved' ? 'bg-[#e8f5e9]' : 'bg-[#FAE4E0]'}`}>
              <div className="flex items-center gap-3">
                <Wallet className={actionModal.action === 'approved' ? 'text-green-700' : 'text-[#BF3A20]'} size={24} />
                <h3 className={`font-display font-bold text-lg ${actionModal.action === 'approved' ? 'text-green-900' : 'text-[#5C1A0A]'}`}>
                  {actionModal.action === 'approved' ? 'Duyệt Rút Tiền' : 'Từ Chối Rút Tiền'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#7A5235] font-body mb-4">
                {actionModal.action === 'approved' 
                  ? 'Vui lòng đảm bảo bạn ĐÃ CHUYỂN TIỀN vào tài khoản ngân hàng của Vendor trước khi nhấn xác nhận. Hành động này không thể hoàn tác và số dư sẽ bị trừ.' 
                  : 'Vui lòng nhập lý do từ chối. Số tiền sẽ được hoàn lại vào ví chính của Vendor.'}
              </p>
              
              {actionModal.action === 'rejected' && (
                <textarea
                  className="w-full p-3 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-white font-body mb-4"
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                  className="px-4 py-2 font-mono font-bold text-[#7A5235] border-2 border-[#E8D8C6] rounded-lg hover:bg-[#E8D8C6]/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 font-mono font-bold text-[#FEFCF9] rounded-lg shadow-retro-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none border-2 border-saigon-neutral-text ${
                    actionModal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#BF3A20] hover:bg-[#A02D16]'
                  }`}
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerWithdrawals;
