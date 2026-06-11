import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/organisms/Header';
import { MOCK_CATEGORIES, MenuItemDetail, MOCK_MENU_ITEMS } from '../../utils/mockData';
import useCart from '../../hooks/useCart';
import menuItemApi from '../../services/menuItemApi';

export const MenuCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Category selection and fetched items
  const [selectedListCategory, setSelectedListCategory] = useState<string>('all');
  const [allItems, setAllItems] = useState<MenuItemDetail[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Search & Filter Panel States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState<number>(0);
  const [isOpenOnly, setIsOpenOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');

  // Pagination State
  const [currentProductPage, setCurrentProductPage] = useState<number>(1);

  // Favorites & Recently Viewed states
  const [recentlyViewed, setRecentlyViewed] = useState<MenuItemDetail[]>([]);

  // Fetch Recently Viewed
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (ids.length > 0) {
        const items = ids
          .map((id: string) => MOCK_MENU_ITEMS.find((m) => m.id === id))
          .filter(Boolean) as MenuItemDetail[];
        setRecentlyViewed(items);
      }
    } catch (err) {
      console.error('Error reading recently viewed from localStorage:', err);
    }
  }, []);



  // Fetch Products by Category (All items for client-side filtering & pagination)
  const fetchCategoryProducts = useCallback(async (category: string) => {
    try {
      setLoadingProducts(true);
      // Fetch up to 100 items per category to support local filters & correct pagination counts
      const data = await menuItemApi.getMenuItems(category, 1, 100);
      setAllItems(data.items || []);
      setCurrentProductPage(1); // Reset page on category change
    } catch (err) {
      console.error('Error fetching category products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    fetchCategoryProducts(selectedListCategory);
  }, [selectedListCategory, fetchCategoryProducts]);

  // Handle page change click
  const handlePageChange = (newPage: number) => {
    setCurrentProductPage(newPage);
    // Smooth scroll back to top of the menu list
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Filter and sort items dynamically
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // 1. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.restaurantName.toLowerCase().includes(q)
      );
    }

    // 2. Filter by minimum rating
    if (minRating > 0) {
      result = result.filter((item) => (item.restaurantRating || 0) >= minRating);
    }

    // 3. Filter by maximum delivery fee
    if (maxDeliveryFee > 0) {
      result = result.filter((item) => (item.restaurantDeliveryFee || 0) <= maxDeliveryFee);
    }

    // 4. Filter by restaurant open status
    if (isOpenOnly) {
      result = result.filter((item) => item.restaurantIsOpen === true);
    }

    // 5. Sort items
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.restaurantRating || 0) - (a.restaurantRating || 0));
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [allItems, searchQuery, minRating, maxDeliveryFee, isOpenOnly, sortBy]);

  // Paginated items to display
  const paginatedItems = useMemo(() => {
    const offset = (currentProductPage - 1) * 8;
    return filteredItems.slice(offset, offset + 8);
  }, [filteredItems, currentProductPage]);

  const totalPages = Math.ceil(filteredItems.length / 8);

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* 1. Header / Navbar */}
      <Header cartCount={totalItems} />

      {/* Retro Banner Section */}
      <section className="relative h-56 flex items-center justify-center text-center px-4 overflow-hidden bg-neutral-950 border-b-2 border-neutral-900">
        {/* Background Image with slight blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-[1px]"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80')" 
          }}
        ></div>
        {/* Warm vintage gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/95 via-[#BF3A20]/75 to-[#2C1A0E]/95 pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-10"></div>

        {/* Banner Content */}
        <div className="relative z-20 max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-secondary-300 text-neutral-900 text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-900 uppercase tracking-widest rotate-[-1deg] shadow-retro-sm mx-auto select-none">
            🥢 Hương vị hoài cổ 🥢
          </div>
          <h1 className="text-2xl md:text-4xl font-display italic font-bold text-white leading-tight drop-shadow-md">
            Thực Đơn Món Ngon <span className="text-secondary-300">Sài Thành</span>
          </h1>
          <p className="text-[#FEFCF9]/80 font-body text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Khám phá tinh hoa ẩm thực vỉa hè Sài Gòn, từ xe bánh mì đầu hẻm đến tô phở nghi ngút khói đầu hẻm xưa.
          </p>
        </div>
      </section>

      {/* 2. Main content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 pt-10 pb-12">

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2.5 justify-center">
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedListCategory(cat.id)}
              className={`px-4 py-2 border-2 text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                selectedListCategory === cat.id
                  ? 'bg-[#BF3A20] text-white border-neutral-900 shadow-none translate-y-0.5'
                  : 'bg-[#FEFCF9] text-neutral-800 border-neutral-900 shadow-retro-sm hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Advanced Filter Toggle & Panel */}
        <div className="mb-8 select-none max-w-4xl mx-auto">
          {/* Search bar & Filter Toggle Button */}
          <div className="flex flex-col sm:flex-row gap-3 bg-[#FEFCF9] border-2 border-neutral-900 p-3.5 shadow-retro-sm">
            {/* Search Input */}
            <div className="flex-grow flex border-2 border-neutral-950 bg-white">
              <span className="pl-3 pr-1 py-1.5 text-neutral-400 select-none text-sm">🔍</span>
              <input
                type="text"
                placeholder="Tìm món ngon, hương vị, quán ăn xưa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentProductPage(1);
                }}
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-neutral-900 font-mono placeholder:text-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 text-neutral-400 hover:text-neutral-900 cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="flex gap-2.5 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-neutral-900 text-xs font-mono font-bold uppercase bg-[#F0E9DE] hover:bg-[#E2D8C6] shadow-retro-sm active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              >
                <span>🎛️ Bộ lọc nâng cao</span>
                <span>{showFilters ? '▲ Thâu gọn' : '▼ Mở rộng'}</span>
              </button>

              {(minRating > 0 || maxDeliveryFee > 0 || isOpenOnly || sortBy !== 'default' || searchQuery) && (
                <button
                  onClick={() => {
                    setMinRating(0);
                    setMaxDeliveryFee(0);
                    setIsOpenOnly(false);
                    setSortBy('default');
                    setSearchQuery('');
                    setCurrentProductPage(1);
                  }}
                  className="text-[10px] font-mono font-bold text-neutral-500 hover:text-[#BF3A20] underline cursor-pointer"
                >
                  [ Xóa bộ lọc ]
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel dropdown */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#FEFCF9] border-x-2 border-b-2 border-neutral-900 p-4 font-mono text-xs shadow-retro">
              
              {/* 1. Rating */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">★ ĐÁNH GIÁ TỐI THIỂU</span>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    setCurrentProductPage(1);
                  }}
                  className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 rounded-sm focus:outline-none"
                >
                  <option value={0}>Tất cả sao</option>
                  <option value={4.5}>Từ 4.5 ★ trở lên</option>
                  <option value={4.7}>Từ 4.7 ★ trở lên</option>
                  <option value={4.9}>Từ 4.9 ★ trở lên</option>
                </select>
              </div>

              {/* 2. Delivery Fee */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">🛵 PHÍ VẬN CHUYỂN TỐI ĐA</span>
                <select
                  value={maxDeliveryFee}
                  onChange={(e) => {
                    setMaxDeliveryFee(Number(e.target.value));
                    setCurrentProductPage(1);
                  }}
                  className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 rounded-sm focus:outline-none"
                >
                  <option value={0}>Tất cả mức phí</option>
                  <option value={12000}>Dưới 12.000đ</option>
                  <option value={15000}>Dưới 15.000đ</option>
                  <option value={20000}>Dưới 20.000đ</option>
                </select>
              </div>

              {/* 3. Open Status */}
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 pb-2 select-none">
                  <input
                    type="checkbox"
                    checked={isOpenOnly}
                    onChange={(e) => {
                      setIsOpenOnly(e.target.checked);
                      setCurrentProductPage(1);
                    }}
                    className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 rounded-sm cursor-pointer"
                  />
                  <span>Đang mở cửa</span>
                </label>
              </div>

              {/* 4. Sắp xếp theo */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">🔃 SẮP XẾP THEO</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentProductPage(1);
                  }}
                  className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 rounded-sm focus:outline-none"
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="popularity">Bán chạy nhất</option>
                </select>
              </div>

            </div>
          )}
        </div>

        {/* Recently Viewed Items Section */}
        {recentlyViewed.length > 0 && (
          <div className="mb-12 select-none max-w-6xl mx-auto">
            <div className="mb-6 border-b-2 border-neutral-900 pb-2">
              <h3 className="text-base font-mono font-bold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
                👀 Món Ngon Đã Xem Gần Đây
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((viewed) => (
                <div
                  key={viewed.id}
                  onClick={() => navigate(`/menu-items/${viewed.id}`)}
                  className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2 p-3 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                >
                  <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm relative">

                    <img
                      src={viewed.image || viewed.imageUrl}
                      alt={viewed.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/600x600/FEFCF9/BF3A20?text=${encodeURIComponent(viewed.name)}`;
                      }}
                      className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h4 className="font-bold text-xs text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors mt-1">
                      {viewed.name}
                    </h4>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                      ✿ {viewed.restaurantName}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-neutral-200">
                      <span className="price-text font-bold text-[#BF3A20] text-xs">
                        {viewed.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-dashed border-neutral-300 mt-10"></div>
          </div>
        )}

        {/* Category Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/menu-items/${item.id}`)}
              className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2.5 p-3.5 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
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
                <span className="absolute top-2 left-2 bg-[#BF3A20] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                  {MOCK_CATEGORIES.find(c => c.id === item.category)?.name || 'MÓN NGON'}
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
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded-sm">
                    Đã bán: {item.soldCount || 0}+
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading / Empty State */}
        {filteredItems.length === 0 && !loadingProducts && (
          <div className="text-center py-10 card-retro bg-[#FEFCF9] mt-6 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-4 opacity-85 select-none">
              <img
                src="/empty_bowl.png"
                alt="Không tìm thấy món ăn"
                className="w-full h-full object-contain filter sepia-[5%]"
              />
            </div>
            <p className="font-mono text-sm text-neutral-500">
              [ Không tìm thấy món ngon nào khớp với bộ lọc ]
            </p>
          </div>
        )}

        {loadingProducts && (
          <div className="flex justify-center items-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20]"></div>
            <span>Đang tải thực đơn...</span>
          </div>
        )}

        {/* Traditional Pagination Bar */}
        {!loadingProducts && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2 font-mono text-xs select-none">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentProductPage - 1)}
              disabled={currentProductPage === 1}
              className={`px-3 py-1.5 border-2 border-neutral-900 font-bold uppercase transition-all duration-150 ${
                currentProductPage === 1
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed'
                  : 'bg-[#FEFCF9] text-neutral-800 hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 active:translate-y-0 shadow-retro-sm cursor-pointer'
              }`}
            >
              ◀ Trước
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 border-2 border-neutral-900 font-bold transition-all duration-150 cursor-pointer ${
                    currentProductPage === p
                      ? 'bg-[#BF3A20] text-white border-neutral-900 shadow-none translate-y-0.5'
                      : 'bg-[#FEFCF9] text-neutral-800 hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 active:translate-y-0 shadow-retro-sm'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentProductPage + 1)}
              disabled={currentProductPage === totalPages}
              className={`px-3 py-1.5 border-2 border-neutral-900 font-bold uppercase transition-all duration-150 ${
                currentProductPage === totalPages
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed'
                  : 'bg-[#FEFCF9] text-neutral-800 hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 active:translate-y-0 shadow-retro-sm cursor-pointer'
              }`}
            >
              Sau ▶
            </button>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-retro font-mono text-xs cursor-pointer"
          >
            ⬅️ Quay lại trang chủ
          </button>
        </div>

      </main>

      {/* 3. Retro Footer */}
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

export default MenuCatalog;
