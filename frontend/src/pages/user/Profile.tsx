import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Check, 
  X, 
  Award,
  Wallet,
  Calendar,
  Lock
} from 'lucide-react';
import Header from '../../components/organisms/Header';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';

interface Address {
  id: string;
  title: string;
  detail: string;
  recipientName: string;
  recipientPhone: string;
}

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  totalAmount: number;
  status: 'COMPLETED' | 'CANCELLED';
  itemsSummary: string;
  rating?: number;
  reviewText?: string;
}

const mockOrderItems: Record<string, Array<{ id: string; name: string; price: number; imageUrl: string; toppings: string[] }>> = {
  'order-1': [
    { id: 'menu-1', name: 'Cơm Tấm Sườn Bì Chả', price: 65000, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80', toppings: [] },
    { id: 'menu-3', name: 'Trà đá', price: 10000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=150&q=80', toppings: [] }
  ],
  'order-2': [
    { id: 'menu-4', name: 'Phở Tái Nạm', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=150&q=80', toppings: ['Sợi bánh thêm'] },
    { id: 'menu-5', name: 'Quẩy', price: 15000, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=150&q=80', toppings: [] }
  ],
  'order-3': [
    { id: 'menu-6', name: 'Bánh Mì Đặc Biệt', price: 110000, imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=150&q=80', toppings: [] },
    { id: 'menu-7', name: 'Nước sâm', price: 18000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=150&q=80', toppings: [] }
  ]
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { user } = useAuth();

  // Tab state: 'profile' (Hồ Sơ & Địa Chỉ) | 'orders' (Lịch Sử Đơn Hàng)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Personal Info form states
  const [name, setName] = useState(user?.name || 'Nguyễn Văn A');
  const [phone, setPhone] = useState('0987654321');
  const email = user?.email || 'nguyenvana@gmail.com';
  const [message, setMessage] = useState('');

  // Address book states
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      title: 'Nhà riêng',
      detail: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      recipientName: user?.name || 'Nguyễn Văn A',
      recipientPhone: '0987654321',
    },
    {
      id: 'addr-2',
      title: 'Văn phòng',
      detail: '33 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      recipientName: user?.name || 'Nguyễn Văn A',
      recipientPhone: '0987654321',
    },
  ]);

  // Order history states
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order-1',
      restaurantId: 'res-1',
      restaurantName: 'Quán Cơm Tấm Bãi Rác',
      date: '2026-06-05 12:15',
      totalAmount: 75000,
      status: 'COMPLETED',
      itemsSummary: 'Cơm Tấm Sườn Bì Chả, Trà đá',
    },
    {
      id: 'order-2',
      restaurantId: 'res-2',
      restaurantName: 'Phở Lệ Quận 5',
      date: '2026-06-03 19:40',
      totalAmount: 110000,
      status: 'CANCELLED',
      itemsSummary: 'Phở Tái Nạm, Quẩy',
    },
    {
      id: 'order-3',
      restaurantId: 'res-3',
      restaurantName: 'Bánh Mì Huỳnh Hoa',
      date: '2026-05-30 08:30',
      totalAmount: 128000,
      status: 'COMPLETED',
      itemsSummary: 'Bánh Mì Đặc Biệt, Nước sâm',
    },
  ]);

  // Address Modal/Dialog states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

  // Rating Modal/Dialog states
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Save personal info form handler
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      return;
    }
    setMessage('Đã lưu thông tin hồ sơ thành công!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Open address modal helper
  const handleOpenAddressModal = (address: Address | null) => {
    if (address) {
      setEditingAddress(address);
      setAddrTitle(address.title);
      setAddrDetail(address.detail);
      setAddrRecipient(address.recipientName);
      setAddrPhone(address.recipientPhone);
    } else {
      setEditingAddress(null);
      setAddrTitle('');
      setAddrDetail('');
      setAddrRecipient(name);
      setAddrPhone(phone);
    }
    setIsAddressModalOpen(true);
  };

  // Save Address form submit
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle.trim() || !addrDetail.trim() || !addrRecipient.trim() || !addrPhone.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }

    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? {
        ...a,
        title: addrTitle,
        detail: addrDetail,
        recipientName: addrRecipient,
        recipientPhone: addrPhone
      } : a));
      setMessage('Cập nhật địa chỉ nhận hàng thành công!');
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        title: addrTitle,
        detail: addrDetail,
        recipientName: addrRecipient,
        recipientPhone: addrPhone
      };
      setAddresses(prev => [...prev, newAddr]);
      setMessage('Thêm địa chỉ nhận hàng mới thành công!');
    }

    setIsAddressModalOpen(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Delete Address handler
  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      setMessage('Đã xóa địa chỉ thành công!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Order reorder handler
  const handleReorder = (orderId: string) => {
    const itemsToReorder = mockOrderItems[orderId];
    if (itemsToReorder) {
      itemsToReorder.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          toppings: item.toppings
        }, 'res-1');
      });
      alert('Đã đặt lại các món từ đơn hàng cũ vào giỏ hàng của bạn!');
      navigate('/cart');
    } else {
      alert('Không tìm thấy thông tin món ăn để đặt lại đơn này.');
    }
  };

  // Open order rating modal
  const handleOpenRatingModal = (order: Order) => {
    setRatingOrder(order);
    setRatingValue(5);
    setRatingComment('');
    setIsRatingModalOpen(true);
  };

  // Submit order rating
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrder) return;

    setOrders(prev => prev.map(o => o.id === ratingOrder.id ? {
      ...o,
      rating: ratingValue,
      reviewText: ratingComment
    } : o));

    setIsRatingModalOpen(false);
    setMessage(`Đã gửi đánh giá ${ratingValue}★ cho ${ratingOrder.restaurantName}. Cảm ơn bạn!`);
    setTimeout(() => setMessage(''), 4000);
  };

  // Saigon rating messages
  const getRatingFeedback = (stars: number) => {
    switch(stars) {
      case 1: return 'Tệ quá nghen!';
      case 2: return 'Chưa ngon lắm!';
      case 3: return 'Bình thường à!';
      case 4: return 'Ngon lành cành đào!';
      case 5: return 'Tuyệt đỉnh Sài Gòn!';
      default: return '';
    }
  };

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* Header */}
      <Header cartCount={totalItems} />

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Page Title: Lora Bold */}
        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide">
          Hồ sơ của bạn
        </h1>

        {/* Global Notifications */}
        {message && (
          <div className="border-2 border-emerald-800 bg-[#FAF7F3] p-3 text-xs font-mono font-bold text-emerald-800 mb-6 flex items-center gap-2 shadow-retro-sm">
            <Check size={16} className="text-emerald-700 animate-pulse" />
            <span>{message}</span>
          </div>
        )}

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (4/12): Wallet & Loyalty Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-retro bg-[#FEFCF9] relative overflow-hidden p-6 shadow-saigon-card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>
              
              {/* Wallet Header */}
              <div className="flex items-center gap-2 mb-4 border-b border-dashed border-neutral-200 pb-2">
                <Wallet className="text-[#BF3A20]" size={18} strokeWidth={1.5} />
                <h2 className="font-mono font-bold text-xs uppercase tracking-widest text-neutral-800">
                  Ví điện tử Saigon-Pay
                </h2>
              </div>

              {/* Wallet Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Số dư khả dụng</p>
                  <p className="font-mono text-2xl font-black text-[#BF3A20] mt-0.5">
                    150.000đ
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Đang tạm giữ</p>
                  <p className="font-mono text-sm font-semibold text-neutral-600">
                    45.000đ
                  </p>
                </div>

                <div className="bg-[#FAF0D2] border border-[#C98F0A]/30 p-3 rounded-sm">
                  <div className="flex items-center gap-1 text-[#C98F0A] mb-1">
                    <Award size={14} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Điểm tích lũy</span>
                  </div>
                  <p className="text-lg font-black text-neutral-800">85 Điểm</p>
                  <p className="text-[9px] text-neutral-500 font-body mt-1">
                    * Tích thêm 15 điểm để đổi phiếu quà tặng 20.000đ!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <span className="bg-[#BF3A20] text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-1.5 border-2 border-neutral-900 shadow-retro rotate-[-1deg] inline-block">
                Thành viên Đồng
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN (8/12): Main Tab Layout */}
          <div className="lg:col-span-8">
            
            {/* Tab switchers */}
            <div className="flex border-b-2 border-neutral-900 mb-6 bg-transparent gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border-t-2 border-l-2 border-r-2 border-neutral-900 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#BF3A20] text-white -mb-[2px] shadow-retro-sm translate-y-[1px]'
                    : 'bg-[#FEFCF9] text-neutral-600 hover:text-neutral-900 border-b border-transparent'
                }`}
              >
                Hồ Sơ & Địa Chỉ
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border-t-2 border-l-2 border-r-2 border-neutral-900 transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#BF3A20] text-white -mb-[2px] shadow-retro-sm translate-y-[1px]'
                    : 'bg-[#FEFCF9] text-neutral-600 hover:text-neutral-900 border-b border-transparent'
                }`}
              >
                Lịch Sử Đơn Hàng
              </button>
            </div>

            {/* TAB CONTENT 1: HỒ SƠ & ĐỊA CHỈ */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                
                {/* Personal Profile Form */}
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-saigon-card">
                  <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
                    <UserIcon className="text-[#BF3A20]" size={20} strokeWidth={1.5} />
                    <h2 className="text-lg font-heading font-bold text-neutral-900">
                      Thông tin cá nhân
                    </h2>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-4">
                    {/* Name Field */}
                    <div className="w-full">
                      <label className="block text-xs font-mono font-black uppercase text-neutral-500 mb-1 select-none">
                        Họ và tên thành viên
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                      />
                    </div>

                    {/* Email Field (Disabled) */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1 select-none">
                        <label className="block text-xs font-mono font-black uppercase text-neutral-500">
                          Địa chỉ thư điện tử
                        </label>
                        <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-0.5">
                          <Lock size={10} /> Không thể chỉnh sửa
                        </span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full bg-[#F0E9DE]/65 border-2 border-[#E8D8C6] opacity-65 cursor-not-allowed rounded px-3 py-2 text-sm text-neutral-500 focus:outline-none shadow-inner font-body"
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="w-full">
                      <label className="block text-xs font-mono font-black uppercase text-neutral-500 mb-1 select-none">
                        Số điện thoại liên lạc
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                      />
                    </div>

                    {/* Form actions */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-2.5 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 cursor-pointer"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>

                {/* Saigon Divider */}
                <SaigonDivider />

                {/* Address Book Section */}
                <div>
                  <h3 className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest border-b border-dashed border-neutral-200 pb-1.5 mb-4 select-none">
                    Sổ địa chỉ nhận hàng
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div 
                        key={address.id}
                        className="card-retro bg-[#FEFCF9] p-4 flex flex-col justify-between gap-3 relative shadow-sm border border-neutral-900"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-dashed border-neutral-100 pb-2 mb-2">
                            <span className="bg-[#FAF0D2] border border-[#C98F0A]/30 text-[10px] font-bold font-mono px-2 py-0.5 text-neutral-800 rounded-sm uppercase">
                              {address.title}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 font-body leading-relaxed">
                            {address.detail}
                          </p>
                          <div className="mt-3 text-[10px] text-neutral-500 font-mono">
                            <span className="font-bold text-neutral-700">{address.recipientName}</span> — {address.recipientPhone}
                          </div>
                        </div>

                        {/* Edit/Delete actions */}
                        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-2 mt-1 select-none">
                          <button
                            onClick={() => handleOpenAddressModal(address)}
                            className="text-[10px] font-mono font-bold text-neutral-600 hover:text-[#BF3A20] flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            <Pencil size={11} strokeWidth={1.5} /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-[10px] font-mono font-bold text-[#BF3A20] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 size={11} strokeWidth={1.5} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* "THÊM ĐỊA CHỈ MỚI" Dash border button */}
                    <button
                      onClick={() => handleOpenAddressModal(null)}
                      className="border-2 border-dashed border-neutral-400 bg-transparent hover:bg-neutral-100/50 min-h-[145px] flex flex-col items-center justify-center p-4 gap-2 transition-colors cursor-pointer group rounded-lg"
                    >
                      <div className="p-2 border border-dashed border-neutral-400 rounded-full group-hover:border-neutral-700 transition-colors">
                        <Plus size={18} strokeWidth={1.5} className="text-neutral-500 group-hover:text-neutral-700" />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-500 group-hover:text-neutral-700 uppercase tracking-wider">
                        Thêm địa chỉ mới
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: LỊCH SỬ ĐƠN HÀNG */}
            {activeTab === 'orders' && (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="card-retro bg-[#FEFCF9] p-5 flex flex-col gap-4 border border-neutral-900 shadow-sm relative"
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                      <div>
                        {/* Restaurant Name: Playfair Display Italic */}
                        <h3 className="text-lg font-display italic font-bold text-[#BF3A20]">
                          {order.restaurantName}
                        </h3>
                        {/* Date: Space Mono */}
                        <p className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center gap-1 select-none">
                          <Calendar size={11} /> {order.date}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-sm select-none ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : 'bg-[#BF3A20]/5 border-[#BF3A20] text-[#BF3A20]'
                      }`}>
                        {order.status === 'COMPLETED' ? '[ HOÀN THÀNH ]' : '[ ĐÃ HỦY ]'}
                      </span>
                    </div>

                    {/* Food Items Summary list */}
                    <p className="text-xs text-neutral-700 font-body border-t border-b border-dashed border-neutral-100 py-2.5">
                      <span className="font-mono font-semibold text-neutral-500 text-[10px] uppercase block mb-0.5 select-none">Món đã đặt:</span>
                      {order.itemsSummary}
                    </p>

                    <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                      {/* Price: Space Mono Bold, brick-red */}
                      <div className="font-mono text-sm font-bold text-neutral-800">
                        <span className="text-[10px] text-neutral-400 block font-normal select-none">TỔNG THANH TOÁN</span>
                        <span className="text-[#BF3A20] text-base">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {order.status === 'COMPLETED' && !order.rating && (
                          <button
                            onClick={() => handleOpenRatingModal(order)}
                            className="bg-transparent hover:bg-[#BF3A20] hover:text-white text-[#BF3A20] font-body font-bold text-[10px] uppercase py-2 px-3 border-2 border-[#BF3A20] transition-colors cursor-pointer select-none"
                          >
                            Đánh giá ngay
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(order.id)}
                          className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-bold text-[10px] uppercase py-2 px-3 border-2 border-neutral-900 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none"
                        >
                          Đặt lại đơn này
                        </button>
                      </div>
                    </div>

                    {/* Submitted Rating Details (if rated) */}
                    {order.rating && (
                      <div className="bg-[#FAF7F3] border border-dashed border-[#C98F0A]/30 p-3 rounded-sm">
                        <div className="flex items-center gap-1.5 mb-1 select-none">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">Đánh giá của bạn:</span>
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                fill={i < (order.rating || 0) ? '#D49E00' : 'none'} 
                                stroke={i < (order.rating || 0) ? '#D49E00' : '#888888'}
                                className="inline" 
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-amber-700 italic">
                            ({getRatingFeedback(order.rating)})
                          </span>
                        </div>
                        {order.reviewText && (
                          <p className="text-xs text-neutral-700 italic font-body">
                            "{order.reviewText}"
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-8 text-neutral-400 font-mono italic">
                    [ Chưa có lịch sử đơn hàng nào ]
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Retro address modal dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card-retro bg-[#FEFCF9] max-w-md w-full p-6 relative shadow-saigon-card border-2 border-neutral-900">
            <button 
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            
            <span className="bg-[#C98F0A] text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-900 rotate-[-1deg] inline-block mb-3 select-none">
              BƯU THIẾP ĐỊA CHỈ
            </span>

            <h3 className="text-xl font-heading font-black text-neutral-900 mb-4">
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">
                  Nhãn địa chỉ (ví dụ: Nhà riêng, Văn phòng...)
                </label>
                <input
                  type="text"
                  placeholder="Nhập nhãn..."
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                />
              </div>

              {/* Detail Input */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">
                  Địa chỉ chi tiết (Số nhà, Tên đường, Quận/Huyện)
                </label>
                <textarea
                  placeholder="Nhập địa chỉ nhận hàng..."
                  rows={3}
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                  className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body resize-none"
                />
              </div>

              {/* Recipient Name Input */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">
                  Họ tên người nhận
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên người nhận..."
                  value={addrRecipient}
                  onChange={(e) => setAddrRecipient(e.target.value)}
                  className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                />
              </div>

              {/* Recipient Phone Input */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">
                  Số điện thoại người nhận
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="bg-transparent hover:underline text-neutral-500 font-mono text-xs px-4 py-2 cursor-pointer select-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-2 px-5 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-sm transition-all cursor-pointer"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retro rating modal dialog */}
      {isRatingModalOpen && ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card-retro bg-[#FEFCF9] max-w-md w-full p-6 relative shadow-saigon-card border-2 border-neutral-900">
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            
            <span className="bg-[#BF3A20] text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-900 rotate-[-2deg] inline-block mb-3 select-none">
              Ý KIẾN KHÁCH HÀNG
            </span>

            <h3 className="text-xl font-heading font-black text-neutral-900 mb-1">
              Đánh giá món ăn
            </h3>
            <p className="text-xs font-display italic text-[#BF3A20] mb-4">
              {ratingOrder.restaurantName}
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              {/* Star selector */}
              <div className="flex flex-col items-center justify-center py-2 bg-[#FAF7F3] border border-dashed border-neutral-200 rounded-sm">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} Sao`}
                    >
                      <Star 
                        size={28} 
                        fill={star <= ratingValue ? '#D49E00' : 'none'} 
                        stroke={star <= ratingValue ? '#D49E00' : '#888888'} 
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <span className="mt-2 text-xs font-mono font-bold text-neutral-700">
                  {ratingValue} / 5 Sao — {getRatingFeedback(ratingValue)}
                </span>
              </div>

              {/* Review Text area */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">
                  Nhận xét của bạn về món ăn & dịch vụ
                </label>
                <textarea
                  placeholder="Hãy viết cảm nghĩ của bạn tại đây..."
                  rows={4}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] focus:ring-1 focus:ring-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body resize-none"
                />
              </div>

              {/* Submit Rating buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="bg-transparent hover:underline text-neutral-500 font-mono text-xs px-4 py-2 cursor-pointer select-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-2 px-5 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-sm transition-all cursor-pointer"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#FEFCF9] border-t border-[#E8D8C6] py-6 text-center text-xs text-neutral-400 mt-12 font-mono">
        <p className="font-display italic font-bold text-sm text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
        <p className="mt-1 text-[10px]">✿ Nét văn hóa ẩm thực Sài Gòn xưa trong lòng đô thị hiện đại ✿</p>
      </footer>

    </div>
  );
};

export default Profile;
