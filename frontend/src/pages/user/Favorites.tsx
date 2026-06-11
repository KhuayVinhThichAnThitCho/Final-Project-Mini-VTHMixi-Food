import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Compass, Loader2 } from 'lucide-react';
import Header from '../../components/organisms/Header';
import useCart from '../../hooks/useCart';
import favoriteApi from '../../services/favoriteApi';

interface FavoriteItem {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  price: number;
  category: string;
  description?: string;
  soldCount?: number;
}

const categoryNames: Record<string, string> = {
  pho: 'Phở & Bún',
  com: 'Cơm Tấm',
  coffee: 'Cà Phê Vợt',
  snack: 'Ăn Vặt Hẻm',
  dessert: 'Chè Ngọt',
  bread: 'Bánh Mì Sài Gòn',
};

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { allCartItemsCount } = useCart();

  // State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  // Fetch favorites from backend
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteApi.getFavorites();
      if (res && res.success) {
        setFavorites(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Remove item from favorites database
  const handleRemoveFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingIds((prev) => [...prev, id]);

    try {
      const res = await favoriteApi.toggleFavorite(id);
      if (res && res.success) {
        // Chờ hiệu ứng chuyển cảnh mờ 300ms rồi mới xóa khỏi state
        setTimeout(() => {
          setFavorites((prev) => prev.filter((item) => item.id !== id));
          setRemovingIds((prev) => prev.filter((removingId) => removingId !== id));
        }, 300);
      } else {
        alert('Có lỗi xảy ra khi xóa món yêu thích.');
        setRemovingIds((prev) => prev.filter((removingId) => removingId !== id));
      }
    } catch (err) {
      console.error('Lỗi khi xóa yêu thích:', err);
      setRemovingIds((prev) => prev.filter((removingId) => removingId !== id));
    }
  };

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      {/* Header */}
      <Header cartCount={allCartItemsCount} />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Page Title */}
        <h1 className="text-2xl font-display italic font-bold text-[#2C1A0E] mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide select-none">
          Món Ngon Ruột Của Bạn
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm font-mono font-bold text-[#BF3A20]">
            <Loader2 className="animate-spin mr-2" size={16} />
            ĐANG TẢI MÓN YÊU THÍCH...
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((item) => {
              const isRemoving = removingIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/menu-items/${item.id}`)}
                  className={`card-retro bg-[#FEFCF9] overflow-hidden border-2 border-neutral-900 shadow-retro cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-retro-md transition-all duration-300 ${
                    isRemoving 
                      ? 'opacity-0 scale-95 pointer-events-none' 
                      : 'opacity-100 scale-100'
                  }`}
                >
                  
                  {/* Image wrapper with warm filter */}
                  <div className="relative aspect-square w-full overflow-hidden border-b-2 border-neutral-900 bg-neutral-100">
                    <img
                      src={item.image || item.imageUrl || 'https://placehold.co/300x300/FAF7F3/2C1A0E?text=Sài+Gòn+90s'}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/300x300/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                      }}
                      className="w-full h-full object-cover filter sepia-[8%] saturate-[115%] brightness-[96%] transition-transform duration-500 hover:scale-105"
                    />

                    {/* Heart button */}
                    <button
                      onClick={(e) => handleRemoveFavorite(item.id, e)}
                      title="Bỏ thích món ăn"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FEFCF9] border-2 border-neutral-900 flex items-center justify-center shadow-retro-sm transition-transform active:scale-90 hover:bg-[#BF3A20]/5 cursor-pointer z-20"
                    >
                      <Heart 
                        size={15} 
                        strokeWidth={1.5} 
                        fill="#BF3A20" 
                        className="text-[#BF3A20]" 
                      />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-2 flex flex-col h-[110px] justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#2C1A0E] leading-tight line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1 select-none">
                        📁 {categoryNames[item.category] || 'Món ăn'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-neutral-100 mt-auto">
                      <span className="font-mono text-sm font-bold text-[#BF3A20]">
                        {item.price.toLocaleString('vi-VN')} đ
                      </span>
                      {item.soldCount !== undefined && (
                        <span className="text-[9px] font-mono text-neutral-400">
                          Đã bán: {item.soldCount}+
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State View */
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto card-retro bg-[#FEFCF9] border-2 border-neutral-900 relative select-none">
            <div className="absolute top-0 right-0 w-12 h-12 bg-grid-pattern opacity-5 pointer-events-none"></div>
            
            {/* Heart symbol stamp */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#BF3A20] flex items-center justify-center bg-[#BF3A20]/5 text-3xl animate-pulse mb-6">
              💝
            </div>
            
            <h2 className="text-xl font-heading font-black text-neutral-900 leading-snug mb-3">
              Chưa thả tim món ăn nào hết á!
            </h2>
            
            <p className="text-xs text-neutral-500 font-body leading-relaxed mb-6">
              Hãy dạo quanh các quán ngon vỉa hè Sài Gòn, thả tim lưu giữ những hương vị yêu thích của bạn vào bưu thiếp này nhé.
            </p>

            <button
              onClick={() => navigate('/')}
              className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-3 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <Compass size={14} />
              Đi tìm món ngon
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
