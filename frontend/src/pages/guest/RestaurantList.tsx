import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Bike, MapPin, SlidersHorizontal, X } from 'lucide-react';
import Header from '../../components/organisms/Header';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import useCart from '../../hooks/useCart';
import { MOCK_CATEGORIES, MOCK_RESTAURANTS, RestaurantData } from '../../utils/mockData';
import restaurantApi from '../../services/restaurantApi';

const ITEMS_PER_PAGE = 8;

export const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Filter state
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState(0);
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [allRestaurants, setAllRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurants
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantApi.getRestaurants({ limit: 100 });
      setAllRestaurants(data.restaurants || []);
    } catch (err) {
      console.error(err);
      setAllRestaurants(MOCK_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Client-side filter & sort
  const filteredRestaurants = useMemo(() => {
    let result = [...allRestaurants];

    // Filter by category tag
    if (selectedTag !== 'all') {
      result = result.filter((r) => r.tags && r.tags.includes(selectedTag));
    }
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
      );
    }
    // Filter by rating
    if (minRating > 0) result = result.filter((r) => r.rating >= minRating);
    // Filter by deliveryFee
    if (maxDeliveryFee > 0) result = result.filter((r) => r.deliveryFee <= maxDeliveryFee);
    // Filter open only
    if (isOpenOnly) result = result.filter((r) => r.isOpen);
    // Sort
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'delivery_fee_asc') result.sort((a, b) => a.deliveryFee - b.deliveryFee);
    if (sortBy === 'delivery_fee_desc') result.sort((a, b) => b.deliveryFee - a.deliveryFee);

    return result;
  }, [allRestaurants, selectedTag, searchQuery, minRating, maxDeliveryFee, isOpenOnly, sortBy]);

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = useMemo(() => {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRestaurants.slice(offset, offset + ITEMS_PER_PAGE);
  }, [filteredRestaurants, currentPage]);

  const hasActiveFilters = minRating > 0 || maxDeliveryFee > 0 || isOpenOnly || sortBy !== 'default' || searchQuery;

  const clearFilters = () => {
    setMinRating(0);
    setMaxDeliveryFee(0);
    setIsOpenOnly(false);
    setSortBy('default');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Tag categories (map from MOCK_CATEGORIES excluding 'all')
  const tagCategories = [
    { id: 'all', name: 'Tất cả', icon: '🏪' },
    ...MOCK_CATEGORIES.filter((c) => c.id !== 'all'),
  ];

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={totalItems} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-10">

        {/* Page Title */}
        <div className="mb-10 text-center">
          <SaigonDivider text="Danh Sách Nhà Hàng Sài Thành" className="max-w-2xl mx-auto" />
          <p className="text-xs text-neutral-500 font-mono mt-2 uppercase tracking-widest">
            ☆ Khám phá {allRestaurants.length}+ quán ăn ngon được giao nhận tận cửa ☆
          </p>
        </div>

        {/* Category Tag Strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tagCategories.map((tag) => (
            <button
              key={tag.id}
              onClick={() => { setSelectedTag(tag.id); setCurrentPage(1); }}
              className={`px-4 py-2 border-2 text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                selectedTag === tag.id
                  ? 'bg-[#BF3A20] text-white border-neutral-900 shadow-none translate-y-0.5'
                  : 'bg-[#FEFCF9] text-neutral-800 border-neutral-900 shadow-retro-sm hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <span className="mr-1.5">{tag.icon}</span>{tag.name}
            </button>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="mb-8 max-w-4xl mx-auto select-none">
          <div className="flex flex-col sm:flex-row gap-3 bg-[#FEFCF9] border-2 border-neutral-900 p-3.5 shadow-retro-sm">
            {/* Search input */}
            <div className="flex-grow flex border-2 border-neutral-950 bg-white">
              <span className="pl-3 pr-1 py-1.5 text-neutral-400 select-none text-sm">🔍</span>
              <input
                type="text"
                placeholder="Tìm nhà hàng theo tên, địa chỉ, quận..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-neutral-900 font-mono placeholder:text-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="px-2.5 text-neutral-400 hover:text-neutral-900 text-xs font-bold">✕</button>
              )}
            </div>
            {/* Filter toggle */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-neutral-900 text-xs font-mono font-bold uppercase bg-[#F0E9DE] hover:bg-[#E2D8C6] shadow-retro-sm active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal size={13} />
                {showFilters ? '▲ Thu gọn' : '▼ Bộ lọc'}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[10px] font-mono font-bold text-neutral-500 hover:text-[#BF3A20] underline cursor-pointer flex items-center gap-1">
                  <X size={10} /> Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Filter dropdown panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#FEFCF9] border-x-2 border-b-2 border-neutral-900 p-4 font-mono text-xs shadow-retro">
              {/* Rating */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">★ ĐÁNH GIÁ TỐI THIỂU</span>
                <select value={minRating} onChange={(e) => { setMinRating(Number(e.target.value)); setCurrentPage(1); }} className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 focus:outline-none">
                  <option value={0}>Tất cả sao</option>
                  <option value={4.4}>Từ 4.4 ★</option>
                  <option value={4.6}>Từ 4.6 ★</option>
                  <option value={4.8}>Từ 4.8 ★</option>
                </select>
              </div>
              {/* Delivery fee */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">🛵 PHÍ SHIP TỐI ĐA</span>
                <select value={maxDeliveryFee} onChange={(e) => { setMaxDeliveryFee(Number(e.target.value)); setCurrentPage(1); }} className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 focus:outline-none">
                  <option value={0}>Tất cả mức phí</option>
                  <option value={10000}>Dưới 10.000đ</option>
                  <option value={15000}>Dưới 15.000đ</option>
                  <option value={20000}>Dưới 20.000đ</option>
                </select>
              </div>
              {/* Open only */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 pb-2">
                  <input type="checkbox" checked={isOpenOnly} onChange={(e) => { setIsOpenOnly(e.target.checked); setCurrentPage(1); }} className="w-4 h-4 accent-[#BF3A20] cursor-pointer" />
                  <span>Đang mở cửa</span>
                </label>
              </div>
              {/* Sort */}
              <div className="space-y-2">
                <span className="font-bold block text-neutral-700">🔃 SẮP XẾP</span>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="w-full bg-[#F0E9DE] border-2 border-neutral-950 p-1.5 focus:outline-none">
                  <option value="default">Mặc định</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="delivery_fee_asc">Phí ship: Thấp → Cao</option>
                  <option value="delivery_fee_desc">Phí ship: Cao → Thấp</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs font-mono text-neutral-500 mb-6">
          Tìm thấy <strong className="text-neutral-900">{filteredRestaurants.length}</strong> nhà hàng
          {selectedTag !== 'all' && ` trong danh mục "${tagCategories.find(t => t.id === selectedTag)?.name}"`}
        </p>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20]"></div>
            <span>Đang tải danh sách nhà hàng...</span>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && (
          <>
            {paginatedRestaurants.length === 0 ? (
              <div className="text-center py-16 card-retro bg-[#FEFCF9]">
                <p className="font-mono text-sm text-neutral-500">[ Không tìm thấy nhà hàng nào khớp với bộ lọc ]</p>
                <button onClick={clearFilters} className="mt-4 text-xs font-mono text-[#BF3A20] underline cursor-pointer">Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 overflow-hidden"
                  >
                    {/* Cover image */}
                    <div className="relative w-full aspect-video overflow-hidden border-b border-neutral-200">
                      <img
                        src={restaurant.coverImage || restaurant.imageUrl}
                        alt={restaurant.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://placehold.co/400x220/FEFCF9/BF3A20?text=${encodeURIComponent(restaurant.name)}`;
                        }}
                        className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Open/Closed badge */}
                      <span className={`absolute top-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 border rounded-sm ${
                        restaurant.isOpen
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-neutral-700 text-neutral-200 border-neutral-800'
                      }`}>
                        {restaurant.isOpen ? '● Đang mở' : '○ Đóng cửa'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex flex-col flex-grow gap-2">
                      <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors leading-snug">
                        {restaurant.name}
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 line-clamp-1">
                        <MapPin size={9} /> {restaurant.address}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-neutral-200">
                        {/* Rating */}
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700">
                          <Star size={10} fill="#D49E00" stroke="#D49E00" />
                          {restaurant.rating}
                        </span>
                        {/* Delivery time */}
                        <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                          <Clock size={9} /> {restaurant.deliveryTime}
                        </span>
                        {/* Delivery fee */}
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#BF3A20]">
                          <Bike size={9} /> {restaurant.deliveryFee > 0 ? `${(restaurant.deliveryFee / 1000).toFixed(0)}k` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2 font-mono text-xs select-none">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 border-2 border-neutral-900 font-bold uppercase transition-all duration-150 ${
                    currentPage === 1 ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed' : 'bg-[#FEFCF9] text-neutral-800 hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 shadow-retro-sm cursor-pointer'
                  }`}
                >◀ Trước</button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button key={p} onClick={() => handlePageChange(p)} className={`px-3 py-1.5 border-2 border-neutral-900 font-bold transition-all duration-150 cursor-pointer ${
                      currentPage === p ? 'bg-[#BF3A20] text-white shadow-none translate-y-0.5' : 'bg-[#FEFCF9] hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 shadow-retro-sm'
                    }`}>{p}</button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 border-2 border-neutral-900 font-bold uppercase transition-all duration-150 ${
                    currentPage === totalPages ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed' : 'bg-[#FEFCF9] text-neutral-800 hover:bg-[#BF3A20]/5 hover:-translate-y-0.5 shadow-retro-sm cursor-pointer'
                  }`}
                >Sau ▶</button>
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <button onClick={() => navigate('/')} className="btn-retro font-mono text-xs cursor-pointer">
            ⬅️ Quay lại trang chủ
          </button>
        </div>
      </main>

      <footer className="bg-[#FEFCF9] border-t-2 border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <p className="font-display italic font-bold text-base text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
          <p className="max-w-md mx-auto leading-relaxed text-neutral-600 font-body">
            Nền tảng ẩm thực hoài cổ được xây dựng bởi HCMUTE Software Engineering.
          </p>
          <p className="font-mono text-[10px] text-neutral-400">TypeScript · React · Tailwind CSS · Sequelize MySQL</p>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantList;
