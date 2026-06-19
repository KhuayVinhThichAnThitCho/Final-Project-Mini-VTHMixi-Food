import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Lock, Unlock, AlertCircle } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  address: string;
  status: string;
  rejectionReason?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    banReason?: string;
  };
}

const ManagerVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: 'lock' | 'unlock', vendorId: string, ownerId: string}>({
    isOpen: false,
    type: 'lock',
    vendorId: '',
    ownerId: ''
  });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/vendors') as any;
      setVendors(res.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionModal.type === 'lock' && !reason.trim()) {
      alert('Vui lòng nhập lý do khóa.');
      return;
    }

    try {
      await api.patch(`/manager/users/${actionModal.ownerId}/status`, {
        status: actionModal.type === 'lock' ? 'banned' : 'active',
        reason: reason
      });
      fetchVendors();
      setActionModal({ ...actionModal, isOpen: false });
      setReason('');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Quản Lý Vendor</h2>
        <div className="divider-saigon mt-2 max-w-xs"></div>
        <p className="text-[#9E6E4A] font-body mt-3">Quản lý danh sách các cửa hàng và chủ quán trong hệ thống.</p>
      </div>

      <div className="flex justify-between items-center bg-[#FEFCF9] p-4 rounded-xl shadow-card border border-[#E8D8C6]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E6E4A]" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhà hàng, email chủ quán..." 
            className="w-full pl-10 pr-4 py-2 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-transparent font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Cửa hàng</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Chủ quán</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Trạng thái Cửa Hàng</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Trạng thái TK</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-[#E8D8C6] hover:bg-[#FAF7F3] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#2C1A0E]">{vendor.name}</p>
                      <p className="text-xs text-[#9E6E4A] line-clamp-1">{vendor.address}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-[#2C1A0E]">{vendor.owner.name}</p>
                      <p className="text-xs text-[#9E6E4A]">{vendor.owner.email}</p>
                      <p className="text-xs text-[#9E6E4A]">{vendor.owner.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        vendor.status === 'open' ? 'bg-green-100 text-green-700' :
                        vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        vendor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          vendor.owner.status === 'active' ? 'bg-green-100 text-green-700' :
                          vendor.owner.status === 'banned' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {vendor.owner.status.toUpperCase()}
                        </span>
                        {vendor.owner.banReason && (
                          <span className="text-[10px] text-red-500 italic max-w-[150px] truncate" title={vendor.owner.banReason}>
                            Lý do: {vendor.owner.banReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {vendor.owner.status === 'active' ? (
                        <button 
                          onClick={() => setActionModal({ isOpen: true, type: 'lock', vendorId: vendor.id, ownerId: vendor.owner.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Khóa tài khoản"
                        >
                          <Lock size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActionModal({ isOpen: true, type: 'unlock', vendorId: vendor.id, ownerId: vendor.owner.id })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#9E6E4A]">Không tìm thấy vendor nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lock/Unlock */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FEFCF9] rounded-xl shadow-2xl max-w-md w-full border-2 border-saigon-neutral-text overflow-hidden scale-in">
            <div className={`p-4 border-b-2 border-saigon-neutral-text ${actionModal.type === 'lock' ? 'bg-[#FAE4E0]' : 'bg-[#e8f5e9]'}`}>
              <div className="flex items-center gap-3">
                <AlertCircle className={actionModal.type === 'lock' ? 'text-[#BF3A20]' : 'text-green-700'} size={24} />
                <h3 className={`font-display font-bold text-lg ${actionModal.type === 'lock' ? 'text-[#5C1A0A]' : 'text-green-900'}`}>
                  {actionModal.type === 'lock' ? 'Khóa Tài Khoản Vendor' : 'Mở Khóa Tài Khoản'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#7A5235] font-body mb-4">
                {actionModal.type === 'lock' 
                  ? 'Vui lòng nhập lý do khóa tài khoản này. Vendor sẽ không thể đăng nhập hoặc nhận đơn.' 
                  : 'Bạn có chắc chắn muốn mở khóa cho tài khoản này?'}
              </p>
              
              {actionModal.type === 'lock' && (
                <textarea
                  className="w-full p-3 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-white font-body mb-4"
                  rows={3}
                  placeholder="Nhập lý do khóa..."
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
                    actionModal.type === 'lock' ? 'bg-[#BF3A20] hover:bg-[#A02D16]' : 'bg-green-600 hover:bg-green-700'
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

export default ManagerVendors;
