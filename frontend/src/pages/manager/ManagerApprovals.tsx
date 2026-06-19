import React, { useEffect, useState } from 'react';
import { ShieldBan, Check, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ManagerApprovals: React.FC = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, restaurantId: string}>({ isOpen: false, restaurantId: '' });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const restRes = await api.get('/manager/restaurants/pending') as any;
      setPendingRestaurants(restRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nhà hàng chờ duyệt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Xác nhận duyệt nhà hàng này?')) return;
    try {
      await api.post(`/manager/restaurants/${id}/approve`);
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra khi duyệt nhà hàng.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      await api.post(`/manager/restaurants/${rejectModal.restaurantId}/reject`, { reason: rejectReason });
      fetchData();
      setRejectModal({ isOpen: false, restaurantId: '' });
      setRejectReason('');
    } catch (error) {
      alert('Có lỗi xảy ra khi từ chối nhà hàng.');
    }
  };

  const handleBanUser = async () => {
    const userId = prompt('Nhập ID User/Vendor/Shipper cần khóa:');
    if (!userId) return;
    const reason = prompt('Nhập lý do khóa:');
    if (!reason) return;
    try {
      await api.patch(`/manager/users/${userId}/status`, { status: 'banned', reason });
      alert('Đã khóa tài khoản thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra, kiểm tra xem người dùng có thuộc khu vực của bạn không.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Duyệt Nhà Hàng</h2>
          <div className="divider-saigon mt-2 max-w-xs"></div>
          <p className="text-[#9E6E4A] font-body mt-3">Quản lý và phê duyệt các đối tác nhà hàng mới đăng ký.</p>
        </div>
        <button 
          onClick={handleBanUser} 
          className="flex items-center space-x-2 px-4 py-2 bg-transparent border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B]/10 rounded-md transition-colors font-body text-xs font-semibold tracking-widest uppercase"
        >
          <ShieldBan size={16} strokeWidth={1.5} />
          <span>Khóa TK Nhanh</span>
        </button>
      </div>

      <div className="bg-[#FEFCF9] rounded-xl shadow-card border border-[#E8D8C6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F5EFE6] border-b border-[#E8D8C6]">
                <th className="p-4 font-heading font-bold text-[#3D2314] uppercase text-xs tracking-wider">Tên Nhà Hàng</th>
                <th className="p-4 font-heading font-bold text-[#3D2314] uppercase text-xs tracking-wider">Địa Chỉ</th>
                <th className="p-4 font-heading font-bold text-[#3D2314] uppercase text-xs tracking-wider">Chủ Quán</th>
                <th className="p-4 font-heading font-bold text-[#3D2314] uppercase text-xs tracking-wider">Liên Hệ</th>
                <th className="p-4 font-heading font-bold text-[#3D2314] uppercase text-xs tracking-wider text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D8C6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#9E6E4A] font-mono font-bold tracking-widest uppercase text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#9E6E4A]"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : pendingRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center bg-[#FAF7F3]">
                    <p className="text-4xl mb-4 opacity-70">📭</p>
                    <p className="text-[#7A5235] font-body text-base font-semibold">Tất cả đều gọn gàng!</p>
                    <p className="text-[#9E6E4A] font-body text-sm mt-1">Không có nhà hàng nào đang chờ duyệt trong khu vực.</p>
                  </td>
                </tr>
              ) : (
                pendingRestaurants.map((restaurant, idx) => (
                  <tr key={restaurant.id} className={`${idx % 2 === 0 ? 'bg-[#FEFCF9]' : 'bg-[#FAF7F3]'} hover:bg-[#F5EFE6] transition-colors group`}>
                    <td className="p-4 font-bold font-body text-[#2C1A0E] group-hover:text-[#BF3A20] transition-colors">{restaurant.name}</td>
                    <td className="p-4 text-sm text-[#7A5235] max-w-[250px] truncate" title={restaurant.address}>
                      {restaurant.address}
                    </td>
                    <td className="p-4 text-sm font-semibold text-[#5C3A22]">
                      {restaurant.owner?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-mono text-[#9E6E4A]">
                      {restaurant.owner?.phone || 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(restaurant.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all font-body font-bold tracking-widest uppercase text-[10px] shadow-sm"
                        >
                          <Check size={14} strokeWidth={2} />
                          Duyệt
                        </button>
                        <button 
                          onClick={() => setRejectModal({ isOpen: true, restaurantId: restaurant.id })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#BF3A20] text-white rounded-md hover:bg-[#D44B2F] transition-all font-body font-bold tracking-widest uppercase text-[10px] shadow-sm"
                        >
                          <X size={14} strokeWidth={2} />
                          Từ Chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reject */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FEFCF9] rounded-xl shadow-2xl max-w-md w-full border-2 border-saigon-neutral-text overflow-hidden scale-in">
            <div className="p-4 border-b-2 border-saigon-neutral-text bg-[#FAE4E0]">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-[#BF3A20]" size={24} />
                <h3 className="font-display font-bold text-lg text-[#5C1A0A]">
                  Từ Chối Nhà Hàng
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#7A5235] font-body mb-4">
                Vui lòng cung cấp lý do từ chối để Vendor có thể cập nhật thông tin và gửi lại yêu cầu.
              </p>
              
              <textarea
                className="w-full p-3 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-white font-body mb-4"
                rows={3}
                placeholder="Nhập lý do (VD: Giấy phép bị mờ, địa chỉ sai...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setRejectModal({ isOpen: false, restaurantId: '' })}
                  className="px-4 py-2 font-mono font-bold text-[#7A5235] border-2 border-[#E8D8C6] rounded-lg hover:bg-[#E8D8C6]/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 font-mono font-bold text-[#FEFCF9] rounded-lg shadow-retro-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none border-2 border-saigon-neutral-text bg-[#BF3A20] hover:bg-[#A02D16]"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerApprovals;
