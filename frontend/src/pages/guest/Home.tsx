import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/organisms/Navbar';
import RestaurantCard, { RestaurantData } from '../../components/organisms/RestaurantCard';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import { Search } from 'lucide-react';

const MOCK_RESTAURANTS: RestaurantData[] = [
  {
    id: 'rest-1',
    name: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    address: 'Hẻm 174 Nguyễn Thiện Thuật, Quận 3',
    rating: 4.8,
    tags: ['Hủ tiếu', 'Món nước', 'Bình dân'],
    bannerUrl: '',
  },
  {
    id: 'rest-2',
    name: 'Cơm Tấm Bãi Rác Quận 4',
    address: '73 Lê Văn Linh, Quận 4, Sài Gòn',
    rating: 4.6,
    tags: ['Cơm tấm', 'Sườn bì chả', 'Ăn trưa'],
    bannerUrl: '',
  },
  {
    id: 'rest-3',
    name: 'Bột Chiên Trấn Giang',
    address: 'Đầu hẻm Phùng Hưng, Quận 5',
    rating: 4.5,
    tags: ['Bột chiên', 'Ăn vặt', 'Trung Hoa'],
    bannerUrl: '',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={0} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Banner Sài Gòn 90s */}
        <section className="card-retro bg-saigon-neutral-surface mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-grid-pattern opacity-10 pointer-events-none"></div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-saigon-primary">
            GRABFOOD MINI
          </h1>
          <p className="text-saigon-neutral-subText font-medium max-w-xl mx-auto mb-6">
            Khám phá hương vị xưa giữa lòng Sài Gòn hiện đại. Đặt thức ăn nhanh chóng, an tâm với chất lượng hoài cổ.
          </p>

          {/* Ô Tìm Kiếm */}
          <div className="flex max-w-md mx-auto border-2 border-saigon-neutral-text shadow-retro bg-saigon-neutral-bg focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-retro-sm transition-all">
            <input
              type="text"
              placeholder="Tìm kiếm quán ngon gần bạn..."
              className="w-full bg-transparent px-4 py-2 text-sm text-saigon-neutral-text placeholder:text-saigon-neutral-subText/50 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="bg-saigon-primary text-saigon-neutral-surface px-4 flex items-center justify-center border-l-2 border-saigon-neutral-text">
              <Search size={18} />
            </div>
          </div>
        </section>

        <SaigonDivider text="Quán Ngon Bình Dân" />

        {/* Lưới các Quán ăn */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
          {filteredRestaurants.length === 0 && (
            <div className="col-span-full text-center py-12 text-saigon-neutral-subText font-mono">
              [Không tìm thấy quán ăn phù hợp với từ khóa]
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-saigon-neutral-surface border-t-2 border-saigon-neutral-text py-6 text-center text-xs text-saigon-neutral-subText mt-12">
        <p className="font-serif italic font-bold text-sm text-saigon-primary">GrabFood Mini © 1990 - 2026</p>
      </footer>
    </div>
  );
};

export default Home;
