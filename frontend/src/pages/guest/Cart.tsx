import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Ticket } from 'lucide-react';
import Header from '../../components/organisms/Header';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import useCart from '../../hooks/useCart';
import { MOCK_RESTAURANTS } from '../../utils/mockData';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, restaurantId, totalItems, totalPrice, updateQuantity, clearCart } = useCart();

  // Find the restaurant details
  const restaurant = useMemo(() => {
    if (!restaurantId) return null;
    return MOCK_RESTAURANTS.find((r) => r.id === restaurantId) || {
      id: restaurantId,
      name: 'Quán ăn chưa đặt tên',
      address: 'Hẻm phố Sài Gòn xưa',
      deliveryFee: 15000,
    };
  }, [restaurantId]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  // Apply Coupon code (interactive feature)
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'SAIGON90S') {
      setDiscountAmount(15000); // 15,000 VND discount
      setAppliedCode('SAIGON90S');
      setCouponCode('');
    } else if (couponCode.trim() === '') {
      setCouponError('Vui lòng nhập mã giảm giá.');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  // Calculations using useMemo
  const subtotal = totalPrice;
  const deliveryFee = restaurant ? (restaurant as any).deliveryFee || 15000 : 0;
  const finalTotal = useMemo(() => {
    const total = subtotal + deliveryFee - discountAmount;
    return total > 0 ? total : 0;
  }, [subtotal, deliveryFee, discountAmount]);

  // Handle Checkout submission
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Empty State View
  if (items.length === 0) {
    return (
      <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
        <Header cartCount={0} />
        
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="flex flex-col items-center gap-6 max-w-md card-retro bg-white p-8 relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-grid-pattern opacity-10 pointer-events-none"></div>
            
            {/* Centered Emoji 🛵 (32px / text-3xl) */}
            <span className="text-5xl animate-bounce select-none" role="img" aria-label="motorcycle">
              🛵
            </span>
            
            <h2 className="text-xl font-heading font-black text-neutral-900 leading-snug">
              Giỏ hàng của bạn đang trống rỗng như đường phố Sài Gòn mùng 1 Tết
            </h2>
            
            <p className="text-xs text-neutral-500 font-body">
              Hãy dạo quanh các con hẻm ẩm thực, chọn một vài món ngon nóng hổi để lấp đầy chiếc giỏ trống trải này nhé.
            </p>

            <button
              onClick={() => navigate('/')}
              className="btn-retro text-xs mt-2 bg-primary-600 hover:bg-[#D44B2F] text-white flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Quay lại đặt món
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* 1. Header Navigation */}
      <Header cartCount={totalItems} />

      {/* 2. Main Page Grid */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Title: Lora Bold */}
        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide">
          Giỏ hàng của bạn
        </h1>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (8/12): Items List */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Restaurant Info Header */}
            {restaurant && (
              <div className="card-retro bg-[#FEFCF9] border-l-4 border-l-[#BF3A20] p-4 flex flex-col gap-1">
                <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Đang đặt món từ</span>
                <h2 className="text-xl font-display italic font-bold text-[#BF3A20]">
                  {restaurant.name}
                </h2>
                <p className="text-xs text-neutral-500 font-body">
                  {restaurant.address}
                </p>
              </div>
            )}

            {/* Dishes list */}
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="card-retro bg-[#FEFCF9] p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
                >
                  <div className="flex items-center gap-4">
                    {/* Small Image aspect-square with sepia warm filter */}
                    <div className="w-16 h-16 bg-neutral-100 border border-neutral-950 overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover filter sepia-[8%] saturate-[115%] brightness-[96%]"
                      />
                    </div>

                    {/* Text Details */}
                    <div>
                      {/* Name: Be Vietnam Pro 600 */}
                      <h3 className="font-body font-semibold text-sm text-neutral-900 leading-snug">
                        {item.name}
                      </h3>
                      {/* Toppings list: small text color #9E6E4A */}
                      {item.toppings && item.toppings.length > 0 && (
                        <p className="text-[11px] text-[#9E6E4A] font-semibold mt-1">
                          + {item.toppings.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right controls: Price and count */}
                  <div className="flex items-center gap-6 ml-auto flex-shrink-0">
                    {/* Unit Price (Font Space Mono) */}
                    <span className="font-mono text-sm font-bold text-neutral-900">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>

                    {/* Quantity controls: [-] [ quantity ] [+] */}
                    <div className="flex items-center border border-neutral-900 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs hover:bg-neutral-100 transition-colors"
                        title={item.quantity === 1 ? 'Xóa khỏi giỏ' : 'Giảm số lượng'}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={12} strokeWidth={1.5} className="text-[#BF3A20]" />
                        ) : (
                          <Minus size={12} strokeWidth={1.5} />
                        )}
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-neutral-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs hover:bg-neutral-100 transition-colors"
                        title="Tăng số lượng"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={clearCart}
                className="text-xs font-mono font-bold text-[#BF3A20] hover:underline flex items-center gap-1 border border-dashed border-[#BF3A20]/40 px-3 py-1.5 bg-[#BF3A20]/5 rounded-sm"
              >
                <Trash2 size={12} />
                [ Dọn sạch giỏ hàng ]
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN (4/12): Invoice Summary Card */}
          <div className="lg:col-span-4">
            <div className="card-retro bg-[#FEFCF9] shadow-saigon-card p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>
              
              <h2 className="text-base font-mono font-black text-neutral-500 uppercase tracking-widest border-b border-dashed border-neutral-200 pb-1.5">
                Hóa đơn tóm tắt
              </h2>

              {/* Coupon code input field */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 select-none">
                  Mã giảm giá (Coupon)
                </label>
                <div className="flex border-2 border-neutral-900 bg-white">
                  <div className="flex items-center pl-2.5 text-neutral-400">
                    <Ticket size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập mã..."
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs text-neutral-900 uppercase font-mono placeholder:text-neutral-400 focus:outline-none"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={appliedCode !== ''}
                  />
                  <button
                    type="submit"
                    className="bg-neutral-950 text-white font-mono text-xs px-4 border-l-2 border-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={appliedCode !== ''}
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] font-mono font-bold text-[#BF3A20]">* {couponError}</p>
                )}
                {appliedCode && (
                  <p className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Đã áp dụng mã {appliedCode} (-15.000đ)
                  </p>
                )}
                <p className="text-[9px] font-mono text-neutral-400 italic">
                  * Nhập mã "SAIGON90S" để nhận ưu đãi 15.000đ
                </p>
              </form>

              {/* Saigon Divider decoration */}
              <SaigonDivider className="my-0" />

              {/* Price Details (Space Mono Font) */}
              <div className="space-y-3 font-mono text-xs text-neutral-800">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>+{deliveryFee.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                
                {/* Total Payment: red color text-lg */}
                <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-3 text-sm font-black">
                  <span className="text-[#2C1A0E] text-xs font-bold font-mono">Tổng thanh toán:</span>
                  <span className="text-lg text-[#BF3A20]">
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* CTA button: Proceed to checkout */}
              <button
                onClick={handleCheckout}
                className="w-full bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-3.5 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 cursor-pointer text-center"
              >
                Tiến hành thanh toán
              </button>

            </div>
          </div>

        </div>

      </main>

    </div>
  );
};

export default Cart;
