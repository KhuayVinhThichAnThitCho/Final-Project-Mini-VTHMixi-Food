import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Utensils, Compass } from 'lucide-react';
import Header from '../../components/organisms/Header';
import useCart from '../../hooks/useCart';

interface FavoriteRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  cuisine: string;
}

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Dynamic favorites list state
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([
    {
      id: 'res-1',
      name: 'Cơm Tấm Bãi Rác Quận 4',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      reviewCount: 150,
      address: 'Hẻm 140 Tôn Đản, Quận 4, Sài Gòn',
      cuisine: 'Cơm Tấm Truyền Thống'
    },
    {
      id: 'res-2',
      name: 'Phở Lệ Nguyễn Trãi',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      reviewCount: 210,
      address: '413 Nguyễn Trãi, Quận 5, Sài Gòn',
      cuisine: 'Phở Bò Gia Truyền'
    },
    {
      id: 'res-3',
      name: 'Bánh Mì Huỳnh Hoa',
      image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      reviewCount: 450,
      address: '26 Lê Thị Riêng, Quận 1, Sài Gòn',
      cuisine: 'Bánh Mì Thịt Nguội'
    },
    {
      id: 'res-4',
      name: 'Cà Phê Vợt Phan Đình Phùng',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      reviewCount: 95,
      address: 'Hẻm 330 Phan Đình Phùng, Phú Nhuận',
      cuisine: 'Cà Phê Vợt Cổ Truyền'
    },
    {
      id: 'res-5',
      name: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
      rating: 4.5,
      reviewCount: 88,
      address: 'Chợ Bàn Cờ, Quận 3, Sài Gòn',
      cuisine: 'Hủ Tiếu Gõ Bình Dân'
    }
  ]);

  // Keep track of restaurant IDs currently running the fade-out delete transition
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  // Trigger heart icon click to remove restaurant from favorites with animation
  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop navigation to restaurant details page
    setRemovingIds(prev => [...prev, id]);

    // Delay the actual state deletion to let the CSS opacity/scale transition complete (300ms)
    setTimeout(() => {
      setFavorites(prev => prev.filter(item => item.id !== id));
      setRemovingIds(prev => prev.filter(removingId => removingId !== id));
    }, 300);
  };

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      {/* Header */}
      <Header cartCount={totalItems} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Page Title: Playfair Display Italic */}
        <h1 className="text-2xl font-display italic font-bold text-[#2C1A0E] mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide">
          Quán Ruột Của Bạn
        </h1>

        {/* Favorite list view */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((res) => {
              const isRemoving = removingIds.includes(res.id);

              return (
                <div
                  key={res.id}
                  onClick={() => navigate(`/restaurants/${res.id}`)}
                  className={`card-retro bg-[#FEFCF9] overflow-hidden border-2 border-neutral-900 shadow-retro cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-retro-md transition-all duration-300 ${
                    isRemoving 
                      ? 'opacity-0 scale-95 pointer-events-none' 
                      : 'opacity-100 scale-100'
                  }`}
                >
                  
                  {/* Aspect 16:9 Image wrapper with sepia filter */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-neutral-900 bg-neutral-100">
                    <img
                      src={res.image}
                      alt={res.name}
                      className="w-full h-full object-cover filter sepia-[8%] saturate-[115%] brightness-[96%] transition-transform duration-500 hover:scale-105"
                    />

                    {/* Heart button (Tô màu đỏ gạch #BF3A20) */}
                    <button
                      onClick={(e) => handleRemoveFavorite(res.id, e)}
                      title="Bỏ thích quán"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FEFCF9] border-2 border-neutral-900 flex items-center justify-center shadow-retro-sm transition-transform active:scale-90 hover:bg-[#BF3A20]/5 cursor-pointer"
                    >
                      <Heart 
                        size={15} 
                        strokeWidth={1.5} 
                        fill="#BF3A20" 
                        className="text-[#BF3A20] animate-pulse" 
                      />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-2.5">
                    {/* Name: Lora Bold */}
                    <h3 className="font-heading font-bold text-sm text-[#2C1A0E] leading-tight line-clamp-1">
                      {res.name}
                    </h3>

                    {/* Rating: Space Mono */}
                    <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-500 select-none">
                      <Star size={11} fill="#D49E00" className="text-amber-500" />
                      <span className="font-bold text-neutral-800">{res.rating.toFixed(1)}</span>
                      <span>({res.reviewCount} lượt đánh giá)</span>
                    </div>

                    {/* Address & Cuisine */}
                    <div className="space-y-1 text-[10px] text-neutral-500 font-body border-t border-dashed border-neutral-100 pt-2.5">
                      <div className="flex items-center gap-1">
                        <Utensils size={10} className="text-neutral-400" />
                        <span>{res.cuisine}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate" title={res.address}>
                        <MapPin size={10} className="text-neutral-400" />
                        <span className="truncate">{res.address}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State View */
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto card-retro bg-[#FEFCF9] border-2 border-neutral-900 relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-grid-pattern opacity-5 pointer-events-none"></div>
            
            {/* Heart symbol stamp */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#BF3A20] flex items-center justify-center bg-[#BF3A20]/5 text-3xl animate-pulse mb-6 select-none">
              💝
            </div>
            
            <h2 className="text-xl font-heading font-black text-neutral-900 leading-snug mb-3">
              Bạn chưa thả tim quán ăn nào hết á!
            </h2>
            
            <p className="text-xs text-neutral-500 font-body leading-relaxed mb-6">
              Hãy dạo quanh các con hẻm rợp bóng mát, tìm kiếm những hương vị thân quen để lấp đầy góc nhỏ bưu thiếp yêu thương này nghen.
            </p>

            <button
              onClick={() => navigate('/')}
              className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-3 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <Compass size={14} />
              Đi tìm quán ngon
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#FEFCF9] border-t border-[#E8D8C6] py-6 text-center text-xs text-neutral-400 mt-12 font-mono">
        <p className="font-display italic font-bold text-sm text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
        <p className="mt-1 text-[10px]">✿ Lưu giữ hương vị quê nhà — Mãi hoài một thuở nhớ thương ✿</p>
      </footer>
    </div>
  );
};

export default Favorites;
