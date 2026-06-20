import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, MessageSquare, Users, CheckCircle, Heart, XCircle } from 'lucide-react';
import Header from '../../components/organisms/Header';
import ImageSwiper from '../../components/molecules/ImageSwiper';
import { MOCK_MENU_ITEMS, MOCK_RESTAURANTS } from '../../utils/mockData';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import menuItemApi from '../../services/menuItemApi';
import reviewApi from '../../services/reviewApi';
import favoriteApi from '../../services/favoriteApi';

const categoryNames: Record<string, string> = {
  all: 'Tất cả món',
  pho: 'Phở & Bún',
  com: 'Cơm Tấm',
  coffee: 'Cà Phê Vợt',
  snack: 'Ăn Vặt Hẻm',
  dessert: 'Chè Ngọt',
  bread: 'Bánh Mì Sài Gòn',
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, allCartItemsCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [dbItem, setDbItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [stats, setStats] = useState<{ buyerCount: number; reviewCount: number }>({ buyerCount: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tải chi tiết món ăn từ backend hoặc dùng mock dự phòng
  useEffect(() => {
    if (!id || id.startsWith('menu-')) {
      setDbItem(null);
      setLoading(false);
      return;
    }
    const fetchItemDetail = async () => {
      try {
        setLoading(true);
        const res = await menuItemApi.getMenuItemDetail(id);
        if (res && res.success && res.data) {
          setDbItem(res.data);
        } else {
          setDbItem(null);
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết món ăn từ API. Dùng dữ liệu mock.', err);
        setDbItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetail();
  }, [id]);

  // Find product detail from backend or mock menu items
  const item = useMemo(() => {
    if (dbItem) {
      const rest = dbItem.restaurant || {};
      const mockRest = (MOCK_RESTAURANTS.find((r: any) => r.id === dbItem.restaurantId) || {}) as any;
      return {
        ...dbItem,
        imageUrl: dbItem.image || dbItem.imageUrl,
        restaurantName: rest.name || dbItem.restaurantName || mockRest.name || 'Quán ăn',
        restaurantRating: rest.ratingAvg !== undefined ? Number(rest.ratingAvg) : (mockRest.rating || 0),
        restaurantDeliveryFee: rest.deliveryFee !== undefined ? Number(rest.deliveryFee) : (mockRest.deliveryFee || 0),
        restaurantIsOpen: rest.status !== undefined ? (rest.status === 'open') : (mockRest.isOpen || false),
        toppings: dbItem.toppings || [],
      };
    }
    return MOCK_MENU_ITEMS.find((m) => m.id === id) || MOCK_MENU_ITEMS[0];
  }, [id, dbItem]);

  // Hiện toast notification tự động ẩn sau 2.5 giây
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Tăng lượt xem & Tải thông số thống kê, đánh giá khi xem sản phẩm
  useEffect(() => {
    if (id) {
      menuItemApi.incrementView(id);

      // Lưu sản phẩm đã xem gần đây vào localStorage
      try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [id, ...recentlyViewed.filter((itemId: string) => itemId !== id)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi khi lưu sản phẩm đã xem gần đây:', err);
      }
      
      const fetchStatsAndReviews = async () => {
        try {
          setReviewsLoading(true);
          const statsRes = await menuItemApi.getItemStats(id);
          if (statsRes && statsRes.success) {
            setStats(statsRes.data);
          }
          const reviewsRes = await reviewApi.getMenuItemReviews(id);
          if (reviewsRes && reviewsRes.success) {
            setReviews(reviewsRes.data || []);
          }
        } catch (error) {
          console.error('Lỗi khi tải thông số stats/reviews món ăn:', error);
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchStatsAndReviews();
    }
  }, [id]);

  // Check if item is favorited on mount
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const fetchFavoriteStatus = async () => {
      try {
        const res = await favoriteApi.getFavorites();
        if (res && res.success) {
          const isFav = res.data.some((fav: any) => fav.id === id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', err);
      }
    };
    fetchFavoriteStatus();
  }, [id, isAuthenticated]);

  // Handle Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Vui lòng đăng nhập để yêu thích món ăn.', from: `/menu-items/${id}` } });
      return;
    }
    if (!id) return;
    try {
      const res = await favoriteApi.toggleFavorite(id);
      if (res && res.success) {
        setIsFavorite(res.data.isFavorite);
        showToast(res.data.isFavorite ? 'Đã thêm món ăn vào danh sách yêu thích! ♥' : 'Đã xóa món ăn khỏi danh sách yêu thích.');
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật yêu thích.';
      showToast(errMsg, 'error');
    }
  };

  // Increase/Decrease quantity
  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Toggle topping selections
  const handleToppingToggle = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((tId) => tId !== toppingId)
        : [...prev, toppingId]
    );
  };

  // Real-time total price calculation using useMemo
  const totalPrice = useMemo(() => {
    const toppingsCost = selectedToppings.reduce((sum, toppingId) => {
      const toppings = item.toppings || [];
      const topping = toppings.find((t: any) => t.id === toppingId);
      return sum + (topping ? topping.price : 0);
    }, 0);
    return (item.price + toppingsCost) * quantity;
  }, [item.price, item.toppings, selectedToppings, quantity]);

  // Similar products logic
  const similarItems = useMemo(() => {
    let list = MOCK_MENU_ITEMS.filter((m) => m.category === item.category && m.id !== item.id);
    if (list.length === 0) {
      list = MOCK_MENU_ITEMS.filter((m) => m.restaurantId === item.restaurantId && m.id !== item.id);
    }
    return list.slice(0, 4);
  }, [item]);

  // Handle add item to global cart
  const handleAddToCart = () => {
    const toppingsList = selectedToppings
      .map((toppingId) => (item.toppings || []).find((t: any) => t.id === toppingId))
      .filter((t): t is Exclude<typeof t, undefined> => t !== undefined);

    const unitPrice = item.price + toppingsList.reduce((sum, t) => sum + t.price, 0);
    
    const added = addToCart(
      {
        id: item.id,
        name: item.name,
        price: unitPrice,
        imageUrl: item.image || item.imageUrl,
        toppings: toppingsList.map((t) => t.name),
      },
      item.restaurantId,
      quantity
    );

    // addToCart trả về false nếu chưa đăng nhập (đã tự redirect đến /login)
    if (added) {
      showToast(`🛵 Đã thêm ${quantity}x "${item.name}" vào giỏ hàng!`);
    }
  };

  if (loading) {
    return (
      <div className="texture-paper min-h-screen bg-[#FAF7F3] flex flex-col">
        <Header cartCount={allCartItemsCount} />
        <div className="flex-1 flex flex-col items-center justify-center py-20 font-mono text-xs text-neutral-500">
          <div className="w-8 h-8 border-4 border-[#BF3A20] border-t-transparent rounded-full animate-spin mb-4" />
          <span>Đang tải thông tin món ăn...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3 border-2 border-neutral-900 shadow-retro font-mono text-sm font-bold transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-[#BF3A20] text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* 1. Navbar Header */}
      <Header cartCount={allCartItemsCount} />

      {/* 2. Main Page Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6">
        
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-primary-600 mb-6 transition-colors font-body"
        >
          <ChevronLeft size={16} />
          Quay lại nhà hàng
        </button>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7/12): Image Swiper với thumbnail */}
          <div className="col-span-1 md:col-span-7 -mx-4 -mt-6 md:mx-0 md:mt-0">
            <ImageSwiper images={item.images || (item.image ? [item.image] : [item.imageUrl])} altText={item.restaurantName || item.name} />
          </div>

          {/* Right Column (5/12): Product details with photo album corners */}
          <div className="col-span-1 md:col-span-5">
            <div className="card-retro bg-[#FEFCF9] frame-corner p-6 relative overflow-hidden flex flex-col gap-6">
              
              {/* Product Info */}
              <div>
                <span className="bg-secondary-100 text-secondary-600 border border-secondary-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase select-none">
                  Món ngon khuyên dùng
                </span>
                
                {/* Title and Heart Button */}
                <div className="flex items-start justify-between gap-4 mt-3 mb-2">
                  <h1 className="text-3xl font-display italic font-bold text-[#2C1A0E] leading-tight">
                    {item.name}
                  </h1>
                  
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 border-2 border-neutral-900 bg-[#FEFCF9] hover:bg-neutral-50 active:translate-y-[1px] shadow-retro-sm transition-all rounded-sm flex-shrink-0 cursor-pointer"
                    title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích món ăn'}
                  >
                    <Heart
                      size={18}
                      className={isFavorite ? 'text-[#BF3A20] fill-[#BF3A20]' : 'text-neutral-500'}
                    />
                  </button>
                </div>
                
                {/* Price: Space Mono Bold */}
                <p className="text-2xl font-mono font-bold text-[#BF3A20] mb-3">
                  {item.price.toLocaleString('vi-VN')} đ
                </p>

                {/* Stock, Sold, Category Information Badges */}
                <div className="flex flex-wrap gap-2.5 text-[11px] font-mono text-neutral-600 mt-3 select-none">
                  <span className="bg-neutral-100/80 border border-neutral-300 px-2 py-0.5 rounded-sm">
                    📦 Tồn kho: <strong className="text-neutral-900">{item.stock > 0 ? `${item.stock} phần` : 'Hết hàng'}</strong>
                  </span>
                  <span className="bg-neutral-100/80 border border-neutral-300 px-2 py-0.5 rounded-sm">
                    🔥 Đã bán: <strong className="text-neutral-900">{item.soldCount || 0}+ suất</strong>
                  </span>
                  <span className="bg-neutral-100/80 border border-neutral-300 px-2 py-0.5 rounded-sm">
                    📁 Danh mục: <strong className="text-neutral-900">{categoryNames[item.category] || 'Món ăn'}</strong>
                  </span>
                  <span className="bg-[#FAF0D2] border border-[#C98F0A]/30 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Users size={11} className="text-amber-800" /> Khách mua: <strong className="text-amber-900">{stats.buyerCount} người</strong>
                  </span>
                  <span className="bg-[#E2F0D9] border border-[#385723]/30 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <MessageSquare size={11} className="text-emerald-800" /> Đánh giá: <strong className="text-emerald-900">{stats.reviewCount} lượt</strong>
                  </span>
                </div>
                
                {/* Description: Be Vietnam Pro */}
                <p className="text-sm text-neutral-700 leading-relaxed font-body mt-4">
                  {item.description}
                </p>
              </div>

              {/* Toppings Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest border-b border-dashed border-neutral-200 pb-1.5 mb-3 select-none">
                  Tùy chọn thêm Topping
                </h3>
                
                <div className="space-y-2.5">
                  {item.toppings.map((topping: any) => {
                    const isChecked = selectedToppings.includes(topping.id);
                    return (
                      <label
                        key={topping.id}
                        className={`flex items-center justify-between p-3 bg-[#FAF7F3] hover:bg-neutral-100 rounded-md border border-neutral-200 cursor-pointer select-none transition-all duration-150 ${
                          isChecked ? 'border-primary-600 ring-1 ring-primary-600/20 bg-secondary-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToppingToggle(topping.id)}
                            disabled={!item.isAvailable || item.stock <= 0}
                            className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 rounded-sm cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span className="text-sm font-semibold text-neutral-800 font-body">
                            {topping.name}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-[#5C3A22] font-semibold">
                          +{topping.price.toLocaleString('vi-VN')}đ
                        </span>
                      </label>
                    );
                  })}

                  {item.toppings.length === 0 && (
                    <p className="text-xs font-mono text-neutral-400 italic">[ Món ăn này không có tùy chọn topping thêm ]</p>
                  )}
                </div>
              </div>

              {/* Bottom Control Action Bar */}
              <div className="flex items-center gap-3 pt-5 border-t border-dashed border-neutral-200 mt-2">

                {/* Quantity Counter — nhỏ gọn */}
                <div className="flex items-center border-2 border-neutral-900 bg-white shadow-retro-sm select-none flex-shrink-0">
                  <button
                    onClick={handleDecrease}
                    disabled={!item.isAvailable || item.stock <= 0}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-mono font-bold text-sm text-neutral-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    disabled={!item.isAvailable || item.stock <= 0 || quantity >= item.stock}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* THÊM VÀO GIỎ HÀNG Button — trung bình */}
                <button
                  onClick={handleAddToCart}
                  disabled={!item.isAvailable || item.stock <= 0}
                  className={`flex-grow py-2.5 px-4 font-bold uppercase tracking-wider border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 text-center text-xs ${
                    item.isAvailable && item.stock > 0
                      ? 'bg-[#BF3A20] hover:bg-[#D44B2F] text-white cursor-pointer'
                      : 'bg-neutral-300 text-neutral-500 opacity-45 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0'
                  }`}
                >
                  {item.isAvailable && item.stock > 0 ? (
                    <span>Thêm vào giỏ — {totalPrice.toLocaleString('vi-VN')}đ</span>
                  ) : (
                    <span>Hết hàng</span>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* 2.5. Reviews Section */}
        <div className="mt-12 border-t-2 border-neutral-900 pt-8">
          <h2 className="text-xl font-display font-bold italic text-neutral-900 mb-6 select-none">
            ❀ Ý Kiến Khách Hàng ❀
          </h2>

          {reviewsLoading ? (
            <div className="text-center py-6 text-xs font-mono text-neutral-400 italic">
              Đang tải đánh giá món ăn...
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="card-retro bg-[#FEFCF9] p-4 border border-neutral-900 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-xs text-neutral-800 font-mono">
                        {rev.user?.name || 'Thực khách ẩn danh'}
                      </p>
                      <div className="flex text-amber-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={11} 
                            fill={i < rev.rating ? '#D49E00' : 'none'} 
                            stroke={i < rev.rating ? '#D49E00' : '#888888'}
                            className="inline" 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 italic font-body leading-relaxed pl-1 border-l-2 border-dashed border-[#BF3A20]/30">
                    "{rev.comment || 'Không có nhận xét bằng lời.'}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 font-mono italic border border-dashed border-neutral-300 bg-white rounded-md select-none">
              [ Chưa có đánh giá nào cho món ăn này. Hãy mua và trở thành người đầu tiên đánh giá để nhận quà tích điểm! ]
            </div>
          )}
        </div>

        {/* 3. Similar Products Section */}
        {similarItems.length > 0 && (
          <div className="mt-12 border-t-2 border-neutral-900 pt-8">
            <h2 className="text-xl font-display font-bold italic text-neutral-900 mb-6 select-none">
              ❀ Món Ngon Tương Tự ❀
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similar) => (
                <div
                  key={similar.id}
                  onClick={() => {
                    navigate(`/menu-items/${similar.id}`);
                    setQuantity(1);
                    setSelectedToppings([]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2 p-3 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                >
                  <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm">
                    <img
                      src={similar.image || similar.imageUrl}
                      alt={similar.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(similar.name)}`;
                      }}
                      className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
                    {similar.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    📁 {categoryNames[similar.category] || 'Món ngon'}
                  </p>
                  <p className="font-mono text-sm font-bold text-[#BF3A20] mt-auto">
                    {similar.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default ProductDetail;
