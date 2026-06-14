import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingCart, CheckCircle, Clock, Bike, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import Header from '../../components/organisms/Header';
import Button from '../../components/atoms/Button';
import useCart from '../../hooks/useCart';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import { restaurantApi } from '../../services/restaurantApi';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  imageUrl?: string;
  isAvailable: boolean;
  soldCount?: number;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  logo?: string;
  coverImage?: string;
  status: string;
  deliveryFee: number;
  minOrderValue: number;
  ratingAvg?: number;
  operatingHours?: { open: string; close: string };
  menuItems?: MenuItem[];
  // fallback mock fields
  rating?: number;
  deliveryTime?: string;
  imageUrl?: string;
  isOpen?: boolean;
}

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, totalItems, allCartItemsCount, totalPrice } = useCart();
  const { user } = useAuthStore();
  const { setActiveConversation, setIsChatOpen, setMessages } = useChatStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Đóng khung chat khi rời khỏi trang nhà hàng
  useEffect(() => {
    return () => {
      setIsChatOpen(false);
      setActiveConversation(null);
    };
  }, [setIsChatOpen, setActiveConversation]);

  // Fetch restaurant + menu từ API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    restaurantApi.getRestaurantById(id)
      .then((data: any) => {
        setRestaurant(data);
      })
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Toast notification state
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Tab danh mục thực đơn
  const [selectedMenuTab, setSelectedMenuTab] = useState('all');

  // Lấy menu items từ response
  const allMenuItems: MenuItem[] = useMemo(() => {
    return restaurant?.menuItems || [];
  }, [restaurant]);

  // Lấy danh mục duy nhất
  const availableCategories = useMemo(() => {
    const cats = [...new Set(allMenuItems.map(item => item.category))].filter(Boolean);
    return [
      { id: 'all', name: 'Tất cả món', icon: '🍽️' },
      ...cats.map(cat => ({ id: cat, name: cat, icon: '🍴' })),
    ];
  }, [allMenuItems]);

  // Lọc menu theo tab đang chọn
  const filteredMenuItems = useMemo(() => {
    if (selectedMenuTab === 'all') return allMenuItems;
    return allMenuItems.filter((item) => item.category === selectedMenuTab);
  }, [allMenuItems, selectedMenuTab]);

  const handleOpenChat = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để chat', false);
      return;
    }
    if (!restaurant) return;
    try {
      const res: any = await api.get(`/chats/restaurant/${restaurant.id}`);
      if (res.success) {
        setActiveConversation(res.data.conversation);
        setMessages(res.data.messages);
        setIsChatOpen(true);
      }
    } catch (error) {
      showToast('Lỗi khi tải cuộc hội thoại', false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="texture-paper min-h-screen flex flex-col bg-neutral-50">
        <Header cartCount={0} />
        <div className="flex-grow flex items-center justify-center gap-4 flex-col text-neutral-500">
          <Loader2 size={40} className="animate-spin text-[#BF3A20]" />
          <p className="font-mono text-sm">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  // Không tìm thấy nhà hàng
  if (!restaurant) {
    return (
      <div className="texture-paper min-h-screen flex flex-col bg-neutral-50">
        <Header cartCount={0} />
        <div className="flex-grow flex items-center justify-center flex-col text-neutral-500 gap-4">
          <p className="font-mono text-lg font-bold">[ Không tìm thấy nhà hàng ]</p>
          <button onClick={() => navigate(-1)} className="text-sm font-mono underline text-[#BF3A20]">← Quay lại</button>
        </div>
      </div>
    );
  }

  const isOpen = restaurant.status === 'open';
  const rating = restaurant.ratingAvg ?? restaurant.rating ?? 0;

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3 border-2 border-neutral-900 shadow-retro font-mono text-sm font-bold transition-all duration-300 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
          <CheckCircle size={16} />
          {toast.msg}
        </div>
      )}

      <Header cartCount={allCartItemsCount} />

      {/* ── COVER IMAGE HERO ── */}
      <div className="relative w-full h-52 md:h-72 overflow-hidden">
        <img
          src={restaurant.coverImage || restaurant.imageUrl || `https://placehold.co/1200x400/2C1A0E/FEFCF9?text=${encodeURIComponent(restaurant.name)}`}
          alt={`Ảnh bìa ${restaurant.name}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://placehold.co/1200x400/2C1A0E/FEFCF9?text=${encodeURIComponent(restaurant.name)}`;
          }}
          className="w-full h-full object-cover filter sepia-[10%] brightness-75"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent" />

        {/* Back button overlay */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-sm font-semibold bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-white/20 transition-all"
        >
          <ChevronLeft size={16} />
          Quay lại
        </button>

        {/* Status badge overlay */}
        <span className={`absolute top-4 right-4 text-xs font-mono font-bold px-3 py-1 border rounded-sm ${isOpen ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-neutral-700 text-neutral-200 border-neutral-600'}`}>
          {isOpen ? '● Đang mở cửa' : '○ Đóng cửa'}
        </span>
      </div>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6">

        {/* ── RESTAURANT INFO CARD ── */}
        <section className="card-retro bg-[#FEFCF9] mb-6 -mt-8 relative z-10 shadow-retro">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display italic font-bold text-[#BF3A20] mb-1 leading-tight">
              {restaurant.name}
            </h1>
            <button
              onClick={handleOpenChat}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-sm border-2 border-neutral-900 shadow-retro-sm text-sm font-bold font-mono hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <MessageCircle size={16} /> Chat với quán
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {/* Rating */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
              <Star size={14} fill="#D49E00" stroke="#D49E00" className="flex-shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold text-amber-800">{rating} / 5.0</p>
                <p className="text-[9px] font-mono text-amber-600 uppercase">Đánh giá</p>
              </div>
            </div>

            {/* Delivery time */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-sm px-3 py-2">
              <Clock size={14} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold text-blue-800">{restaurant.operatingHours ? `${restaurant.operatingHours.open} - ${restaurant.operatingHours.close}` : '-- : --'}</p>
                <p className="text-[9px] font-mono text-blue-500 uppercase">Giao hàng</p>
              </div>
            </div>

            {/* Delivery fee */}
            <div className="flex items-center gap-2 bg-[#BF3A20]/5 border border-[#BF3A20]/20 rounded-sm px-3 py-2">
              <Bike size={14} className="text-[#BF3A20] flex-shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold text-[#BF3A20]">
                  {restaurant.deliveryFee > 0 ? `${restaurant.deliveryFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                </p>
                <p className="text-[9px] font-mono text-[#BF3A20]/70 uppercase">Phí ship</p>
              </div>
            </div>

            {/* Operating hours */}
            <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-sm px-3 py-2">
              <Clock size={14} className="text-neutral-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold text-neutral-800">
                  {restaurant.operatingHours
                    ? `${restaurant.operatingHours.open} – ${restaurant.operatingHours.close}`
                    : '06:00 – 22:00'}
                </p>
                <p className="text-[9px] font-mono text-neutral-500 uppercase">Giờ mở cửa</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mt-4 text-sm text-neutral-500 font-body">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#BF3A20]" />
            <span>{restaurant.address}</span>
          </div>
        </section>

        {/* ── MENU SECTION ── */}
        <section>
          <h2 className="text-lg font-mono font-bold uppercase tracking-wide text-neutral-900 border-b-2 border-neutral-900 pb-2 mb-5">
            📋 Thực Đơn Của Quán
          </h2>

          {/* Category Tabs */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMenuTab(cat.id)}
                  className={`px-3 py-1.5 border-2 text-[11px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                    selectedMenuTab === cat.id
                      ? 'bg-[#BF3A20] text-white border-neutral-900 shadow-none translate-y-0.5'
                      : 'bg-[#FEFCF9] text-neutral-700 border-neutral-900 shadow-retro-sm hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items List */}
          <div className="space-y-3">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="card-retro flex gap-4 bg-[#FEFCF9] items-center">
                {/* Thumbnail */}
                <div
                  onClick={() => navigate(`/menu-items/${item.id}`)}
                  className="w-20 h-20 flex-shrink-0 overflow-hidden border border-neutral-200 rounded-sm cursor-pointer"
                >
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://placehold.co/150x150/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                    }}
                    className="w-full h-full object-cover filter sepia-[5%] hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Info */}
                <div
                  onClick={() => navigate(`/menu-items/${item.id}`)}
                  className="cursor-pointer flex-grow group/item"
                >
                  <h3 className="text-sm font-bold text-neutral-900 group-hover/item:text-[#BF3A20] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-body mt-0.5 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono font-bold text-[#BF3A20] text-sm">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                    {item.stock <= 0 || !item.isAvailable ? (
                      <span className="text-[9px] font-mono bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-sm">HẾT HÀNG</span>
                    ) : (
                      <span className="text-[9px] font-mono bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-sm">Còn {item.stock} phần</span>
                    )}
                    <span className="text-[9px] font-mono text-neutral-400">Đã bán: {item.soldCount || 0}+</span>
                  </div>
                </div>

                {/* Add to cart button */}
                <Button
                  variant="retro"
                  onClick={() => {
                    if (item.stock > 0 && item.isAvailable) {
                      const added = addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        imageUrl: item.image || item.imageUrl,
                        toppings: [],
                      }, restaurant.id);
                      if (added) showToast(`🛵 Đã thêm "${item.name}"!`);
                    } else {
                      showToast('⚠️ Món này đã hết hàng!', false);
                    }
                  }}
                  disabled={item.stock <= 0 || !item.isAvailable}
                  className={`py-1.5 px-3 text-xs flex-shrink-0 ${
                    item.stock <= 0 || !item.isAvailable
                      ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0'
                      : 'bg-[#BF3A20] text-white hover:bg-[#D44B2F]'
                  }`}
                >
                  + Thêm
                </Button>
              </div>
            ))}

            {filteredMenuItems.length === 0 && (
              <p className="text-sm font-mono text-neutral-400 text-center py-8">
                [ Không có món ăn nào trong danh mục này ]
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Floating Cart Bar */}
      {allCartItemsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-[90%] bg-neutral-900 text-white p-4 shadow-retro-lg flex items-center justify-between border-2 border-white z-50">
          <div className="flex items-center gap-3">
            <div className="bg-[#BF3A20] p-2 border border-white rounded-sm">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-xs font-mono">GIỎ HÀNG CỦA BẠN</p>
              <p className="text-sm font-bold font-body">
                {totalItems} món • <span className="text-amber-300">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </p>
            </div>
          </div>
          <Button variant="retro-primary" className="text-xs py-1.5 px-4 bg-[#BF3A20]" onClick={() => navigate('/checkout')}>
            Thanh Toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
