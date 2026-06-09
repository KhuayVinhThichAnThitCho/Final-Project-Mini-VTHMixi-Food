import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingCart } from 'lucide-react';
import Header from '../../components/organisms/Header';
import Button from '../../components/atoms/Button';
import useCart from '../../hooks/useCart';

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description: string;
}

const MOCK_RESTAURANT = {
  id: 'rest-1',
  name: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
  address: 'Hẻm 174 Nguyễn Thiện Thuật, Quận 3',
  rating: 4.8,
  menu: [
    { id: 'menu-1', name: 'Hủ tiếu mì sườn heo', price: 45000, description: 'Sườn heo non ninh nhừ ngọt nước lèo.' },
    { id: 'menu-2', name: 'Hủ tiếu mì hoành thánh', price: 40000, description: 'Hoành thánh tươi gói thịt băm thơm nức.' },
    { id: 'menu-3', name: 'Xí quách tô đặc biệt', price: 30000, description: 'Xương ống tủy béo ngậy chấm tương đen sa tế.' },
  ] as MenuItemData[],
};

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, totalItems, totalPrice } = useCart();

  // Ở thực tế sẽ gọi API lấy thông tin dựa trên `id`
  const restaurant = MOCK_RESTAURANT;
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
          <h1 className="text-3xl font-bold text-primary-600 mb-2">{restaurant.name}</h1>
          <p className="text-sm text-neutral-500 mb-4 font-body">{restaurant.address}</p>
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-[#E9C46A]/20 w-fit px-2 py-1 border border-secondary-300 rounded-sm">
            <Star size={14} fill="#C98F0A" className="text-secondary-500" />
            <span>{restaurant.rating} / 5.0 Đánh Giá</span>
          </div>
        </section>

        {/* Danh sách Thực đơn */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b-2 border-neutral-900 pb-2 mb-4">Thực Đơn Của Quán</h2>
          
          <div className="space-y-4">
            {restaurant.menu.map((item) => (
              <div key={item.id} className="card-retro flex justify-between items-center gap-4 bg-white">
                <div 
                  onClick={() => navigate(`/menu-items/${item.id}`)}
                  className="cursor-pointer group/item flex-grow"
                >
                  <h3 className="text-lg font-bold group-hover/item:text-primary-600 group-hover/item:underline transition-all duration-150">{item.name}</h3>
                  <p className="text-xs text-neutral-500 mb-2 font-body">{item.description}</p>
                  <span className="price-text font-bold text-primary-600">{item.price.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <Button
                  variant="retro"
                  onClick={() => addToCart(item, restaurant.id)}
                  className="py-1.5 px-3 text-xs bg-secondary-100 flex items-center gap-1"
                >
                  Thêm món
                </Button>
              </div>
            ))}
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
