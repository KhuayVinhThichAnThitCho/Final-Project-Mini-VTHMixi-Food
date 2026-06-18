import React, { useEffect, useState } from 'react';
import { ShieldBan, Check } from 'lucide-react';
import api from '../../services/api';

const ManagerApprovals: React.FC = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleBanUser = async () => {
    const userId = prompt('Nhập ID User/Vendor/Shipper cần khóa:');
    if (!userId) return;
    try {
      await api.patch(`/manager/users/${userId}/status`, { status: 'banned' });
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
                      <button 
                        onClick={() => handleApprove(restaurant.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF3A20] text-white rounded-md hover:bg-[#D44B2F] transition-all font-body font-bold tracking-widest uppercase text-[10px] shadow-sm active:scale-95"
                      >
                        <Check size={14} strokeWidth={2} />
                        Duyệt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && pendingRestaurants.length > 0 && (
          <div className="p-4 border-t border-[#E8D8C6] bg-[#FAF7F3] flex justify-between items-center text-xs font-mono text-[#9E6E4A]">
            <span>Trang 1 / 1, hiển thị {pendingRestaurants.length} kết quả</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-[#E8D8C6] bg-[#FEFCF9] rounded text-neutral-400 hover:bg-[#F5EFE6] disabled:opacity-50 cursor-not-allowed" disabled>← Trước</button>
              <button className="px-3 py-1 border border-[#E8D8C6] bg-[#FEFCF9] rounded text-neutral-400 hover:bg-[#F5EFE6] disabled:opacity-50 cursor-not-allowed" disabled>Tiếp →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerApprovals;
