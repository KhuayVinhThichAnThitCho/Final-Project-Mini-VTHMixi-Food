import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Loader2 } from 'lucide-react';
import Header from '../../components/organisms/Header';
import VoucherCard, { VoucherData } from '../../components/molecules/VoucherCard';
import voucherApi from '../../services/voucherApi';
import useCart from '../../hooks/useCart';

interface UserVoucherWrapper {
  id: string;
  userId: string;
  voucherId: string;
  isUsed: boolean;
  usedAt?: string | null;
  voucher: VoucherData;
}

export const MyVouchers: React.FC = () => {
  const navigate = useNavigate();
  const { allCartItemsCount } = useCart();

  const [userVouchers, setUserVouchers] = useState<UserVoucherWrapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unused' | 'used' | 'expired'>('unused');

  useEffect(() => {
    const fetchCollected = async () => {
      try {
        setLoading(true);
        const res = await voucherApi.getMyCollectedVouchers();
        if (res && res.success) {
          setUserVouchers(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching collected vouchers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollected();
  }, []);

  const filteredList = userVouchers.filter((wrapper) => {
    const isExpired = new Date(wrapper.voucher.endDate) < new Date();
    
    if (activeTab === 'unused') return !wrapper.isUsed && !isExpired;
    if (activeTab === 'used') return wrapper.isUsed;
    if (activeTab === 'expired') return !wrapper.isUsed && isExpired;
    return true;
  });

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={allCartItemsCount} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-4xl select-none" role="img" aria-label="wallet">
            👛
          </span>
          <h1 className="text-3xl font-heading font-black text-neutral-900 mt-2 uppercase tracking-wide">
            Kho Voucher Của Bạn
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest">
            ☆ Nơi lưu trữ tất cả các ưu đãi của bạn ☆
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-2 border-neutral-900 bg-white shadow-retro-sm mb-8 overflow-x-auto select-none rounded-sm">
          {[
            { id: 'unused', label: 'Chưa sử dụng' },
            { id: 'used', label: 'Đã sử dụng' },
            { id: 'expired', label: 'Đã hết hạn' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 px-4 font-mono font-bold uppercase tracking-wider text-xs border-r-2 last:border-r-0 border-neutral-900 text-center whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#BF3A20] text-white'
                  : 'bg-transparent text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-450">
            <Loader2 size={36} className="animate-spin text-[#BF3A20]" />
            <p className="font-mono text-xs uppercase font-bold text-[#BF3A20]">Đang mở ví voucher...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="card-retro bg-white text-center py-16 max-w-md mx-auto">
            <Ticket size={48} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="font-heading font-bold text-lg text-neutral-850">
              Ví của bạn trống rỗng
            </h3>
            <p className="text-xs text-neutral-500 font-body mt-2">
              Bạn chưa có mã giảm giá nào thuộc danh mục này. Hãy đến Trung tâm khuyến mãi để lấy thêm mã nhé!
            </p>
            <button
              onClick={() => navigate('/vouchers')}
              className="btn-retro text-xs mt-6 bg-[#E9C46A] hover:bg-[#F2D17E] text-neutral-900 border-2 border-neutral-900"
            >
              Đi săn voucher ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((wrapper) => (
              <VoucherCard
                key={wrapper.id}
                voucher={wrapper.voucher}
                isCollected={true}
                isUsed={wrapper.isUsed}
                onUse={() => navigate(wrapper.voucher.restaurantId ? `/restaurants/${wrapper.voucher.restaurantId}` : '/')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyVouchers;
