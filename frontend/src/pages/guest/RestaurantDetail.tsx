import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingCart } from 'lucide-react';
import Header from '../../components/organisms/Header';
import Button from '../../components/atoms/Button';
import useCart from '../../hooks/useCart';
import { MOCK_RESTAURANTS, MOCK_MENU_ITEMS } from '../../utils/mockData';

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, totalItems, totalPrice } = useCart();

  // Load restaurant dynamically
  const restaurant = useMemo(() => {
    return MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
  }, [id]);

  // Load menu items dynamically
  const menuItems = useMemo(() => {
    return MOCK_MENU_ITEMS.filter((item) => item.restaurantId === restaurant.id);
  }, [restaurant.id]);

  console.log('Viewing restaurant id:', id);

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={totalItems} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6">
        
        {/* Nút Quay Lại */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-primary-600 mb-4 transition-colors font-body"
        >
          <ChevronLeft size={16} />
          Quay lại danh sách
        </button>

        {/* Thông tin đầu trang nhà hàng */}
        <section className="card-retro bg-white mb-8">
          <h1 className="text-3xl font-bold text-[#BF3A20] mb-2">{restaurant.name}</h1>
          <p className="text-sm text-neutral-500 mb-4 font-body">{restaurant.address}</p>
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-[#E9C46A]/20 w-fit px-2 py-1 border border-secondary-300 rounded-sm">
            <Star size={14} fill="#C98F0A" className="text-[#BF3A20]" />
            <span>{restaurant.rating} / 5.0 Đánh Giá</span>
          </div>
        </section>

        {/* Danh sách Thực đơn */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b-2 border-neutral-900 pb-2 mb-4">Thực Đơn Của Quán</h2>
          
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="card-retro flex justify-between items-center gap-4 bg-white">
                <div 
                  onClick={() => navigate(`/menu-items/${item.id}`)}
                  className="cursor-pointer group/item flex-grow"
                >
                  <h3 className="text-lg font-bold group-hover/item:text-primary-600 group-hover/item:underline transition-all duration-150">{item.name}</h3>
                  <p className="text-xs text-neutral-500 mb-2 font-body">{item.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="price-text font-bold text-primary-600">{item.price.toLocaleString('vi-VN')} đ</span>
                    {item.stock <= 0 || !item.isAvailable ? (
                      <span className="text-[10px] font-mono bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-sm">HẾT HÀNG</span>
                    ) : (
                      <span className="text-[10px] font-mono bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-sm">Còn: {item.stock} phần</span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-400">Đã bán: {item.soldCount || 0}+</span>
                  </div>
                </div>
                
                <Button
                  variant="retro"
                  onClick={() => {
                    if (item.stock > 0 && item.isAvailable) {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        imageUrl: item.image || item.imageUrl,
                        toppings: []
                      }, restaurant.id);
                      alert(`Đã thêm ${item.name} vào giỏ hàng!`);
                    } else {
                      alert('Món ăn này hiện tại đã hết hàng!');
                    }
                  }}
                  disabled={item.stock <= 0 || !item.isAvailable}
                  className={`py-1.5 px-3 text-xs flex items-center gap-1 ${
                    item.stock <= 0 || !item.isAvailable
                      ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0'
                      : 'bg-[#BF3A20] text-white hover:bg-[#D44B2F]'
                  }`}
                >
                  Thêm món
                </Button>
              </div>
            ))}

            {menuItems.length === 0 && (
              <p className="text-sm font-mono text-neutral-400 text-center py-8">[ Quán ăn này chưa cập nhật món ăn nào ]</p>
            )}
          </div>
        </section>

      </main>

      {/* Floating Bar Giỏ Hàng nếu có đồ ăn */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-[90%] bg-neutral-900 text-white p-4 shadow-retro-lg flex items-center justify-between border-2 border-white z-50">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 border border-white rounded-sm">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-xs font-mono">GIỎ HÀNG CỦA BẠN</p>
              <p className="text-sm font-bold font-body">{totalItems} món • <span className="price-text text-secondary-300">{totalPrice.toLocaleString('vi-VN')} đ</span></p>
            </div>
          </div>
          
          <Button variant="retro-primary" className="text-xs py-1.5 px-4 bg-primary-600" onClick={() => navigate('/checkout')}>
            Thanh Toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
