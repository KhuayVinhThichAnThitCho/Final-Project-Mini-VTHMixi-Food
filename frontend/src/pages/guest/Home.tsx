import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight } from 'lucide-react';
import Header from '../../components/organisms/Header';
import Hero from '../../components/organisms/Hero';
import CategoryStrip from '../../components/molecules/CategoryStrip';
import RestaurantCard from '../../components/molecules/RestaurantCard';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { MOCK_CATEGORIES, MOCK_RESTAURANTS, MOCK_MENU_ITEMS, MenuItemDetail } from '../../utils/mockData';
import useCart from '../../hooks/useCart';
import menuItemApi from '../../services/menuItemApi';

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
  const { allCartItemsCount } = useCart();

  // States for Top 10 lists (món ăn - menu items)
  const [topBestSellers, setTopBestSellers] = useState<MenuItemDetail[]>([]);
  const [topMostViewed, setTopMostViewed] = useState<MenuItemDetail[]>([]);
  const [loadingTopItems, setLoadingTopItems] = useState<boolean>(true);

  // ─── DỮ LIỆU NHÀ HÀNG (Restaurants) ─────────────────────────────────────────
  const featuredRestaurants = useMemo(() => {
    return MOCK_RESTAURANTS.filter((r) => r.isOpen && r.rating >= 4.6).slice(0, 4);
  }, []);

  // Fetch Top Items (Best Sellers & Most Viewed) từ backend
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
        if (active) setLoadingTopItems(false);
      }
    };
    fetchTopItems();
    return () => { active = false; };
  }, []);



  // ─── MENU ITEM CARD (dùng inline) ────────────────────────────────────────────
  const renderMenuItemCard = (item: MenuItemDetail, badge?: { label: string; color: string }) => (
    <div
      key={item.id}
      onClick={() => navigate(`/menu-items/${item.id}`)}
      className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2.5 p-3.5 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 h-full justify-between"
    >
      <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm relative">

        <img
          src={item.imageUrl}
          alt={item.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
          }}
          className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
        />
        {/* Badge (TOP rank / MỚI / etc.) */}
        {badge && (
          <span className={`absolute top-2 left-2 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
          {item.name}
        </h4>
        <p className="text-[10px] text-neutral-500 font-mono mt-0.5 line-clamp-1">
          🏪 {item.restaurantName}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-neutral-200">
          <span className="font-mono font-bold text-[#BF3A20] text-sm">
            {item.price.toLocaleString('vi-VN')}đ
          </span>
          {item.soldCount !== undefined && (
            <span className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
              Bán: {item.soldCount}+
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">

      {/* 1. Header / Navbar */}
      <Header cartCount={allCartItemsCount} />

      {/* 2. Hero Section */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExploreMenu={() => navigate('/menu')}
      />

      {/* 3. CATEGORY STRIP — Click để xem món theo danh mục tại /menu */}
      <CategoryStrip
        categories={MOCK_CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          navigate(cat === 'all' ? '/menu' : `/menu?category=${cat}`);
        }}
      />

      {/* ================================================================ */}
      {/* 5. SECTION NHÀ HÀNG NỔI BẬT — hiện nhà hàng đang mở, rating cao */}
      {/* ================================================================ */}
      <section className="max-w-6xl w-full mx-auto px-4 mt-14 select-none">
        <div className="mb-6 flex items-center justify-between border-b-2 border-neutral-900 pb-2">
          <h2 className="text-lg font-mono font-bold uppercase tracking-wide text-neutral-900 flex items-center gap-2">
            <Store size={18} className="text-[#BF3A20]" />
            Nhà Hàng Nổi Bật Hôm Nay
          </h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-1 text-xs font-mono font-bold text-[#BF3A20] hover:underline border border-[#BF3A20]/30 px-3 py-1 bg-[#BF3A20]/5 hover:bg-[#BF3A20]/10 transition-colors rounded-sm"
          >
            Xem tất cả <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. TOP 10 MÓN ĂN BÁN CHẠY NHẤT (Swiper Slider)                  */}
      {/* ================================================================ */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 pb-12 pt-0">
        <div className="mt-14 select-none">
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
            // Khi backend chưa có data, dùng mock làm fallback hiển thị
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              style={{ '--swiper-navigation-color': '#BF3A20', '--swiper-pagination-color': '#BF3A20', paddingBottom: '40px' } as React.CSSProperties}
              className="pb-10"
            >
              {[...MOCK_MENU_ITEMS].sort((a, b) => b.soldCount - a.soldCount).slice(0, 10).map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  {renderMenuItemCard(item, { label: `TOP ${idx + 1}`, color: 'bg-[#BF3A20]' })}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              style={{ '--swiper-navigation-color': '#BF3A20', '--swiper-pagination-color': '#BF3A20', paddingBottom: '40px' } as React.CSSProperties}
              className="pb-10"
            >
              {topBestSellers.map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  {renderMenuItemCard(item, { label: `TOP ${idx + 1}`, color: 'bg-[#BF3A20]' })}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* ================================================================ */}
        {/* 7. TOP 10 MÓN ĂN ĐƯỢC XEM NHIỀU NHẤT (Swiper Slider)            */}
        {/* ================================================================ */}
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
            // Fallback mock
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              style={{ '--swiper-navigation-color': '#BF3A20', '--swiper-pagination-color': '#BF3A20', paddingBottom: '40px' } as React.CSSProperties}
              className="pb-10"
            >
              {[...MOCK_MENU_ITEMS].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 10).map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  {renderMenuItemCard(item, { label: `TOP ${idx + 1}`, color: 'bg-[#AD7800]' })}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: 12 },
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              style={{ '--swiper-navigation-color': '#BF3A20', '--swiper-pagination-color': '#BF3A20', paddingBottom: '40px' } as React.CSSProperties}
              className="pb-10"
            >
              {topMostViewed.map((item, idx) => (
                <SwiperSlide key={item.id} className="h-auto">
                  {renderMenuItemCard(item, { label: `TOP ${idx + 1}`, color: 'bg-[#AD7800]' })}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </main>

      {/* 8. Retro Footer */}
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
