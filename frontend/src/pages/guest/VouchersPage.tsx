import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Loader2 } from 'lucide-react';
import Header from '../../components/organisms/Header';
import VoucherCard, { VoucherData } from '../../components/molecules/VoucherCard';
import voucherApi from '../../services/voucherApi';
import { useAuthStore } from '../../store/useAuthStore';
import useCart from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';

export const VouchersPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { allCartItemsCount } = useCart();
  const { isAuthenticated } = useAuthStore();

  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [usedVoucherIds, setUsedVoucherIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'restaurant' | 'freeship'>('all');
  const [collectingId, setCollectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await voucherApi.getVouchers();
        if (res && res.success) {
          setVouchers(res.data || []);
        }

        if (isAuthenticated) {
          const collRes = await voucherApi.getMyCollectedVouchers();
          if (collRes && collRes.success) {
            const allCollected = collRes.data || [];
            setCollectedIds(allCollected.map((item: any) => item.voucherId));
            setUsedVoucherIds(allCollected.filter((item: any) => item.isUsed).map((item: any) => item.voucherId));
          }
        }
      } catch (err) {
        console.error('Error fetching vouchers page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleCollect = async (voucherId: string) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thu thập mã giảm giá.');
      navigate('/login');
      return;
    }
    setCollectingId(voucherId);
    try {
      const res = await voucherApi.collectVoucher(voucherId);
      if (res && res.success) {
        setCollectedIds(prev => [...prev, voucherId]);
        toast.success(res.message || 'Đã lưu mã giảm giá vào ví!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu mã giảm giá.');
    } finally {
      setCollectingId(null);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const isFreeship = v.code.toUpperCase().includes('SHIP') || v.code.toUpperCase().includes('FREE');
    const isRestaurant = !!v.restaurantId;

    if (activeTab === 'platform') return !isRestaurant && !isFreeship;
    if (activeTab === 'restaurant') return isRestaurant;
    if (activeTab === 'freeship') return isFreeship;
    return true;
  });

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={allCartItemsCount} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-4xl select-none" role="img" aria-label="gift">
            🎁
          </span>
          <h1 className="text-3xl font-heading font-black text-neutral-900 mt-2 uppercase tracking-wide">
            Trung Tâm Khuyến Mãi
          </h1>
          <p className="text-xs text-neutral-550 font-mono mt-1 uppercase tracking-widest">
            ☆ Săn voucher ngập tràn - Đặt đồ ăn thả ga ☆
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-2 border-neutral-900 bg-white shadow-retro-sm mb-8 overflow-x-auto select-none rounded-sm">
          {[
            { id: 'all', label: 'Tất cả mã' },
            { id: 'platform', label: 'Mã toàn sàn' },
            { id: 'restaurant', label: 'Mã nhà hàng' },
            { id: 'freeship', label: 'Mã vận chuyển' },
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
            <Loader2 size={36} className="animate-spin text-[#BF3A20]" />
            <p className="font-mono text-xs uppercase font-bold text-[#BF3A20]">Đang tìm kiếm voucher...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="card-retro bg-white text-center py-16 max-w-md mx-auto">
            <Ticket size={48} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="font-heading font-bold text-lg text-neutral-850">
              Không tìm thấy mã giảm giá nào
            </h3>
            <p className="text-xs text-neutral-500 font-body mt-2">
              Các chương trình khuyến mãi hiện tại đang được sắp xếp. Bạn vui lòng quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                isCollected={collectedIds.includes(voucher.id)}
                isUsed={usedVoucherIds.includes(voucher.id)}
                onCollect={() => handleCollect(voucher.id)}
                onUse={() => navigate(voucher.restaurantId ? `/restaurants/${voucher.restaurantId}` : '/')}
                loading={collectingId === voucher.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VouchersPage;
