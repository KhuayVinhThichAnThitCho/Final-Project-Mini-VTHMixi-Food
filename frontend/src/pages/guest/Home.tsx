import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import Hero from '../../components/organisms/Hero';
import CategoryStrip from '../../components/molecules/CategoryStrip';
import RestaurantCard from '../../components/molecules/RestaurantCard';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { MOCK_CATEGORIES, MOCK_RESTAURANTS } from '../../utils/mockData';
import useCart from '../../hooks/useCart';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();

  // Filtering Logic
  const filteredRestaurants = MOCK_RESTAURANTS.filter((restaurant) => {
    const matchesCategory = selectedCategory === 'all' || restaurant.tags.includes(selectedCategory);
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* 1. Header / Navbar (h-16) */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={totalItems} />

      {/* 2. Hero Section (min-h-[500px]) */}
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 3. Category Strip (Horizontal Scroll) */}
      <CategoryStrip
        categories={MOCK_CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 4. Featured Restaurants List */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12">
        
        {/* Section Title with .divider-saigon styling */}
        <div className="mb-10 text-center">
          <SaigonDivider text="Quán Ngon Phố Cũ Sài Gòn" className="max-w-2xl mx-auto" />
          <p className="text-xs text-neutral-500 font-mono mt-2 uppercase tracking-widest">
            ☆ Tinh hoa vỉa hè được chọn lọc kỹ càng ☆
          </p>
        </div>

        {/* Grid Layout (2 cols on mobile, 4 cols on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}

          {/* Empty Fallback State */}
          {filteredRestaurants.length === 0 && (
            <div className="col-span-full text-center py-16 card-retro bg-[#FEFCF9]">
              <p className="font-mono text-sm text-neutral-500">
                [ Hẻm ẩm thực hiện không tìm thấy quán ăn nào phù hợp ]
              </p>
              <button
                className="btn-retro text-xs mt-4"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Xem tất cả quán ăn
              </button>
            </div>
          )}
        </div>

      </main>

      {/* 5. Retro Footer */}
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
