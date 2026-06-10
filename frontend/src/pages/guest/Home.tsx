import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Header from '../../components/organisms/Header';
import Hero from '../../components/organisms/Hero';
import CategoryStrip from '../../components/molecules/CategoryStrip';
import RestaurantCard from '../../components/molecules/RestaurantCard';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { MOCK_CATEGORIES, MOCK_RESTAURANTS, MenuItemDetail } from '../../utils/mockData';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import menuItemApi from '../../services/menuItemApi';
import favoriteApi from '../../services/favoriteApi';

// Swiper component and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();



  // States for Top 10 lists
  const [topBestSellers, setTopBestSellers] = useState<MenuItemDetail[]>([]);
  const [topMostViewed, setTopMostViewed] = useState<MenuItemDetail[]>([]);
  const [loadingTopItems, setLoadingTopItems] = useState<boolean>(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);



  // Member sections data
  const memberPromoRestaurants = useMemo(() => {
    return MOCK_RESTAURANTS.filter((r) => r.deliveryFee <= 12000).slice(0, 4);
  }, []);

  const memberNewestRestaurants = useMemo(() => {
    return [...MOCK_RESTAURANTS].slice(-4).reverse();
  }, []);

  // Fetch Top Items (Best Sellers & Most Viewed)
  useEffect(() => {
    let active = true;
    const fetchTopItems = async () => {
      try {
        setLoadingTopItems(true);
        const data = await menuItemApi.getTopItems(10);
        if (active) {
          setTopBestSellers(data.bestSellers || []);
          setTopMostViewed(data.mostViewed || []);
        }
      } catch (err) {
        console.error('Error fetching top items:', err);
      } finally {
        if (active) {
          setLoadingTopItems(false);
        }
      }
    };
    fetchTopItems();
    return () => {
      active = false;
    };
  }, []);

  // Fetch User Favorites
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchFavorites = async () => {
      try {
        const res = await favoriteApi.getFavorites();
        if (res && res.success) {
          const ids = res.data.map((fav: any) => fav.menuItemId);
          setFavoriteIds(ids);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    fetchFavorites();
  }, [isAuthenticated]);

  // Handle Toggle Favorite
  const handleToggleFavorite = async (e: React.MouseEvent, menuItemId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để yêu thích món ăn này.');
      navigate('/login');
      return;
    }
    try {
      const res = await favoriteApi.toggleFavorite(menuItemId);
      if (res && res.success) {
        if (res.data.action === 'added') {
          setFavoriteIds((prev) => [...prev, menuItemId]);
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== menuItemId));
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };





  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* 1. Header / Navbar (h-16) */}
      <Header cartCount={totalItems} />

      {/* 2. Hero Section (min-h-[500px]) */}
      <Hero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onExploreMenu={() => navigate('/menu')} 
      />

      {/* 3. Category Strip (Horizontal Scroll) */}
      <CategoryStrip
        categories={MOCK_CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />



      {/* 4. Thành Viên Đặc Quyền (Khuyến mãi, Mới nhất, Bán chạy nhất) */}
      {isAuthenticated && (
        <>

          {/* Section 1: Khuyến Mãi (Quán phí ship rẻ) */}
          <div className="max-w-6xl w-full mx-auto px-4 mt-10 select-none">
            <div className="mb-6 flex items-center justify-between border-b-2 border-neutral-900 pb-2">
              <h2 className="text-lg font-mono font-bold uppercase tracking-wide text-[#BF3A20] flex items-center gap-1.5">
                🎁 Ưu Đãi Ship Hời (≤12k)
              </h2>
              <span className="text-[10px] font-mono text-neutral-400 font-bold bg-[#E9C46A]/20 border border-secondary-300 px-1.5 py-0.5 rounded-sm">
                ĐẶC QUYỀN THÀNH VIÊN
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {memberPromoRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Mới Nhất (Quán mới gia nhập) */}
          <div className="max-w-6xl w-full mx-auto px-4 mt-10 select-none">
            <div className="mb-6 flex items-center justify-between border-b-2 border-neutral-900 pb-2">
              <h2 className="text-lg font-mono font-bold uppercase tracking-wide text-green-700 flex items-center gap-1.5">
                🔔 Quán Ngon Mới Lên Kệ
              </h2>
              <span className="text-[10px] font-mono text-neutral-400 font-bold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
                MỚI NHẤT HÔM NAY
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {memberNewestRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 5. Featured Restaurants List */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 pb-12 pt-0">
        


        {/* ======================================================== */}
        {/* TOP 10 BEST SELLERS & MOST VIEWED CAROUSELS */}
        {/* ======================================================== */}
        
        {/* Top 10 Best Sellers Slider */}
        <div className="mt-10 select-none">
          <div className="mb-8 text-center">
            <SaigonDivider text="🔥 Top 10 Món Ngon Bán Chạy Nhất" className="max-w-2xl mx-auto" />
            <p className="text-xs text-neutral-500 font-mono mt-2 uppercase tracking-widest">
              ☆ Được đông đảo bà con gần xa tin tưởng đặt mua hàng đầu ☆
            </p>
          </div>

          {loadingTopItems ? (
            <div className="flex justify-center items-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20]"></div>
              <span>Đang tải các món bán chạy...</span>
            </div>
          ) : topBestSellers.length === 0 ? (
            <div className="text-center py-12 card-retro bg-[#FEFCF9]">
              <p className="font-mono text-sm text-neutral-500">[ Chưa có số liệu thống kê bán chạy ]</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.2}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 }
              }}
              style={{
                '--swiper-navigation-color': '#BF3A20',
                '--swiper-pagination-color': '#BF3A20',
                paddingBottom: '40px'
              } as React.CSSProperties}
              className="pb-10"
            >
              {topBestSellers.map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  <div
                    onClick={() => navigate(`/menu-items/${item.id}`)}
                    className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2.5 p-3.5 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 h-full justify-between"
                  >
                    <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm relative">
                      {/* Heart Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, item.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-[#FEFCF9]/80 border border-neutral-900 hover:bg-[#FEFCF9] transition-all active:scale-90"
                      >
                        <Heart 
                          size={12} 
                          className={favoriteIds.includes(item.id) ? "text-[#BF3A20] fill-[#BF3A20]" : "text-neutral-500"} 
                        />
                      </button>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                        }}
                        className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 bg-[#BF3A20] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                        TOP {idx + 1}
                      </span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">
                        ✿ {item.restaurantName}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-neutral-200">
                        <span className="price-text font-bold text-[#BF3A20] text-sm">
                          {item.price.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
                          Bán: {item.soldCount || 0}+
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Top 10 Most Viewed Slider */}
        <div className="mt-3 select-none">
          <div className="mb-8 text-center">
            <SaigonDivider text="👀 Top 10 Món Ngon Được Xem Nhiều Nhất" className="max-w-2xl mx-auto" />
            <p className="text-xs text-neutral-500 font-mono mt-2 uppercase tracking-widest">
              ☆ Những món ăn được bàn tán xôn xao, lượt ghé thăm tấp nập nhất ☆
            </p>
          </div>

          {loadingTopItems ? (
            <div className="flex justify-center items-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20]"></div>
              <span>Đang tải các món xem nhiều...</span>
            </div>
          ) : topMostViewed.length === 0 ? (
            <div className="text-center py-12 card-retro bg-[#FEFCF9]">
              <p className="font-mono text-sm text-neutral-500">[ Chưa có số liệu thống kê lượt xem ]</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.2}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 }
              }}
              style={{
                '--swiper-navigation-color': '#BF3A20',
                '--swiper-pagination-color': '#BF3A20',
                paddingBottom: '40px'
              } as React.CSSProperties}
              className="pb-10"
            >
              {topMostViewed.map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  <div
                    onClick={() => navigate(`/menu-items/${item.id}`)}
                    className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2.5 p-3.5 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 h-full justify-between"
                  >
                    <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm relative">
                      {/* Heart Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, item.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-[#FEFCF9]/80 border border-neutral-900 hover:bg-[#FEFCF9] transition-all active:scale-90"
                      >
                        <Heart 
                          size={12} 
                          className={favoriteIds.includes(item.id) ? "text-[#BF3A20] fill-[#BF3A20]" : "text-neutral-500"} 
                        />
                      </button>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                        }}
                        className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 bg-[#AD7800] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                        TOP {idx + 1}
                      </span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">
                        ✿ {item.restaurantName}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-neutral-200">
                        <span className="price-text font-bold text-[#BF3A20] text-sm">
                          {item.price.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] font-mono text-[#AD7800] bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-sm">
                          Xem: {item.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

      </main>

      {/* 6. Retro Footer */}
      <footer className="bg-[#FEFCF9] border-t-2 border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <p className="font-display italic font-bold text-base text-[#BF3A20]">
            GrabFood Mini © 1990 - 2026
          </p>
          <p className="max-w-md mx-auto leading-relaxed text-neutral-600 font-body">
            Nền tảng ẩm thực hoài cổ được xây dựng bởi HCMUTE Software Engineering. Giao nhận bằng xe đạp Phượng Hoàng và ký ức Sài Gòn.
          </p>
          <div className="max-w-xs mx-auto">
            <div className="border-t border-double border-neutral-300 opacity-60"></div>
          </div>
          <p className="font-mono text-[10px] text-neutral-400">
            TypeScript · React · Tailwind CSS · Sequelize MySQL
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
