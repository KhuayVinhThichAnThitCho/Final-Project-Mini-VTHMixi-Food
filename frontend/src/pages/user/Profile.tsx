import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  Mail,
  Save,
  MapPin,
  CreditCard,
  Clock,
  Receipt
} from 'lucide-react';
import Header from '../../components/organisms/Header';
import SaigonDivider from '../../components/molecules/SaigonDivider';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import orderApi from '../../services/orderApi';
import favoriteApi from '../../services/favoriteApi';
import reviewApi from '../../services/reviewApi';
import { authApi } from '../../services/authApi';

interface Address {
  id: string;
  title: string;
  detail: string;
  recipientName: string;
  recipientPhone: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { user, refetchMe } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');

  // ─── Edit Profile States ───────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null); // base64 preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ─── Change Password States ────────────────────────────────
  const [isChangePwModalOpen, setIsChangePwModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  // ─── Global message ────────────────────────────────────────
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // ─── Address book (local state) ────────────────────────────
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const stored = localStorage.getItem('user_addresses');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi phân tích cú pháp địa chỉ từ localStorage:', e);
      }
    }
    return [
      {
        id: 'addr-1',
        title: 'Nhà riêng (Mặc định)',
        detail: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0987654321',
      },
      {
        id: 'addr-2',
        title: 'Văn phòng',
        detail: '33 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0987654321',
      },
    ];
  });

  // ─── Orders & Favorites ────────────────────────────────────
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const fetchRealOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await orderApi.getMyOrders();
      if (res && res.success) setRealOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchFavoriteItems = async () => {
    try {
      setFavoritesLoading(true);
      const res = await favoriteApi.getFavorites();
      if (res && res.success) {
        setFavoriteItems(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải món yêu thích:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => { fetchRealOrders(); }, []);
  useEffect(() => {
    if (activeTab === 'favorites') fetchFavoriteItems();
  }, [activeTab]);

  // Sync addresses to localStorage
  useEffect(() => {
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Synchronize default addresses recipient name/phone once user object is loaded
  useEffect(() => {
    if (user && !localStorage.getItem('user_addresses')) {
      const defaultList = [
        {
          id: 'addr-1',
          title: 'Nhà riêng (Mặc định)',
          detail: (user as any).address || '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          recipientName: user.name || 'Nguyễn Văn A',
          recipientPhone: (user as any).phone || '0987654321',
        },
        {
          id: 'addr-2',
          title: 'Văn phòng',
          detail: '33 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          recipientName: user.name || 'Nguyễn Văn A',
          recipientPhone: (user as any).phone || '0987654321',
        },
      ];
      setAddresses(defaultList);
    }
  }, [user]);

  // Sync edit fields when user data loads
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone((user as any).phone || '');
      setEditAddress((user as any).address || '');
    }
  }, [user]);

  // ─── Avatar Upload Handler ─────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showMessage('Ảnh đại diện không được vượt quá 2MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (isEditingProfile) {
        setAvatarPreview(base64);
        setEditAvatar(base64);
      } else {
        try {
          setIsSavingProfile(true);
          showMessage('Đang tải ảnh đại diện lên...');
          const res = await authApi.updateProfile({ avatar: base64 });
          if (res && res.success) {
            await refetchMe?.();
            setAvatarPreview(null);
            setEditAvatar(null);
            showMessage('Cập nhật ảnh đại diện thành công! ✓');
          } else {
            showMessage(res?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện.', 'error');
          }
        } catch (err: any) {
          showMessage(err?.message || 'Lỗi kết nối máy chủ khi cập nhật ảnh đại diện.', 'error');
        } finally {
          setIsSavingProfile(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── Enter Edit Mode ───────────────────────────────────────
  const handleStartEdit = () => {
    setEditName(user?.name || '');
    setEditPhone((user as any)?.phone || '');
    setEditAddress((user as any)?.address || '');
    setAvatarPreview(null);
    setEditAvatar(null);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAvatarPreview(null);
    setEditAvatar(null);
  };

  // ─── Save Profile ──────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showMessage('Họ và tên không được để trống.', 'error');
      return;
    }
    try {
      setIsSavingProfile(true);
      const payload: { name?: string; phone?: string; avatar?: string; address?: string } = {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      };
      if (editAvatar) payload.avatar = editAvatar;

      const res = await authApi.updateProfile(payload);
      if (res && res.success) {
        await refetchMe?.();
        setIsEditingProfile(false);
        setAvatarPreview(null);
        setEditAvatar(null);
        showMessage('Cập nhật hồ sơ thành công! ✓');
      } else {
        showMessage(res?.message || 'Có lỗi xảy ra khi cập nhật.', 'error');
      }
    } catch (err: any) {
      showMessage(err?.message || 'Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Change Password ───────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Vui lòng điền đầy đủ tất cả các trường mật khẩu.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }
    try {
      setIsChangingPw(true);
      const res = await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      if (res && res.success) {
        setIsChangePwModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showMessage('Đổi mật khẩu thành công! Vui lòng đăng nhập lại lần sau.');
      } else {
        showMessage(res?.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 'error');
      }
    } catch (err: any) {
      showMessage(err?.message || 'Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsChangingPw(false);
    }
  };

  // ─── Address helpers ───────────────────────────────────────
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

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
      setAddrRecipient(user?.name || '');
      setAddrPhone((user as any)?.phone || '');
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle.trim() || !addrDetail.trim() || !addrRecipient.trim() || !addrPhone.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }
    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? {
        ...a, title: addrTitle, detail: addrDetail, recipientName: addrRecipient, recipientPhone: addrPhone
      } : a));
      showMessage('Cập nhật địa chỉ nhận hàng thành công!');
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        title: addrTitle, detail: addrDetail,
        recipientName: addrRecipient, recipientPhone: addrPhone
      };
      setAddresses(prev => [...prev, newAddr]);
      showMessage('Thêm địa chỉ nhận hàng mới thành công!');
    }
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      showMessage('Đã xóa địa chỉ thành công!');
    }
  };

  // ─── Order helpers ─────────────────────────────────────────
  const handleReorder = (order: any) => {
    if (order && order.items) {
      order.items.forEach((item: any) => {
        addToCart({
          id: item.menuItemId, name: item.name, price: Number(item.price),
          imageUrl: item.image || item.imageUrl || `https://placehold.co/150x150/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`
        }, order.restaurantId);
      });
      alert('Đã đặt lại các món từ đơn hàng cũ vào giỏ hàng của bạn!');
      navigate('/cart');
    } else {
      alert('Không tìm thấy thông tin món ăn để đặt lại đơn này.');
    }
  };

  // ─── Rating states & handlers ──────────────────────────────
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingOrderId, setRatingOrderId] = useState('');
  const [ratingMenuItemId, setRatingMenuItemId] = useState('');
  const [ratingMenuItemName, setRatingMenuItemName] = useState('');
  const [rewardType, setRewardType] = useState<'points' | 'voucher'>('points');
  const [reviewedKeys, setReviewedKeys] = useState<string[]>([]);
  const [rewardResult, setRewardResult] = useState<{ rewardPoints?: number; voucherCode?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState('');

  const handleOpenRatingModal = (orderId: string, menuItemId: string, menuItemName: string) => {
    setRatingOrderId(orderId);
    setRatingMenuItemId(menuItemId);
    setRatingMenuItemName(menuItemName);
    setRatingValue(5);
    setRatingComment('');
    setRewardType('points');
    setRewardResult(null);
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrderId || !ratingMenuItemId) return;
    try {
      const res = await reviewApi.createReview({
        orderId: ratingOrderId, menuItemId: ratingMenuItemId,
        rating: ratingValue, comment: ratingComment, rewardType
      });
      if (res && res.success) {
        setReviewedKeys(prev => [...prev, `${ratingOrderId}-${ratingMenuItemId}`]);
        const reward = res.data;
        setRewardResult(reward);
        if (reward.rewardPoints) {
          showMessage(`Đã gửi đánh giá ${ratingValue}★ thành công! Bạn nhận được ${reward.rewardPoints} điểm tích lũy.`);
        } else if (reward.voucherCode) {
          showMessage(`Đã gửi đánh giá ${ratingValue}★ thành công! Bạn nhận được mã giảm giá: ${reward.voucherCode}`);
        } else {
          showMessage('Đã gửi đánh giá món ăn thành công. Cảm ơn bạn!');
        }
        setIsRatingModalOpen(false);
        if (refetchMe) await refetchMe();
      } else {
        alert(res?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
      }
    } catch (err: any) {
      alert(err.message || 'Gửi đánh giá thất bại. Bạn chỉ có thể đánh giá món ăn đã mua thành công.');
    }
  };

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

  // Avatar display URL
  const avatarSrc = avatarPreview || (user as any)?.avatar || null;
  const userInitial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      
      {/* Header */}
      <Header cartCount={totalItems} />

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        
        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide">
          Hồ sơ của bạn
        </h1>

        {/* Global Notifications */}
        {message && (
          <div className={`border-2 p-3 text-xs font-mono font-bold mb-6 flex items-center gap-2 shadow-retro-sm ${
            messageType === 'success'
              ? 'border-emerald-800 bg-[#FAF7F3] text-emerald-800'
              : 'border-[#BF3A20] bg-[#FFF5F3] text-[#BF3A20]'
          }`}>
            {messageType === 'success'
              ? <Check size={16} className="animate-pulse flex-shrink-0" />
              : <X size={16} className="flex-shrink-0" />
            }
            <span>{message}</span>
          </div>
        )}

        {/* Reward Result Notification */}
        {rewardResult && rewardResult.voucherCode && (
          <div className="border-2 border-dashed border-[#C98F0A] bg-[#FAF0D2] p-4 text-xs font-mono font-bold text-neutral-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-retro-sm">
            <div>
              <span className="text-[10px] text-[#C98F0A] uppercase tracking-wider block mb-1">🎁 Quà tặng đánh giá món</span>
              <p className="text-sm font-black text-neutral-900">Mã giảm giá 15.000đ: <span className="text-[#BF3A20] select-all bg-white px-2 py-0.5 border border-neutral-300 font-mono font-black">{rewardResult.voucherCode}</span></p>
              <span className="text-[9px] text-neutral-500 font-body block mt-1">* Hạn sử dụng: 30 ngày. Áp dụng cho mọi đơn hàng từ 30.000đ trở lên.</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(rewardResult.voucherCode || '');
                setCopiedCode(rewardResult.voucherCode || '');
                setTimeout(() => setCopiedCode(''), 3000);
              }}
              className="bg-white text-neutral-800 border-2 border-neutral-900 shadow-retro-sm text-[10px] uppercase font-bold py-2 px-3 hover:bg-neutral-50 cursor-pointer self-start sm:self-center"
            >
              {copiedCode === rewardResult.voucherCode ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP MÃ'}
            </button>
          </div>
        )}

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ══════════════════════════════════════════════════
              LEFT COLUMN (4/12): Avatar Card + Wallet Card
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">

            {/* ── Avatar & Quick Info Card ── */}
            <div className="card-retro bg-[#FEFCF9] relative overflow-hidden p-6 shadow-saigon-card text-center">
              <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>
              
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#BF3A20] shadow-retro-sm mx-auto bg-[#F0E9DE] flex items-center justify-center relative">
                  {/* Fallback initials in background */}
                  <span className="absolute text-4xl font-display font-black text-[#BF3A20] select-none z-0">
                    {userInitial}
                  </span>
                  
                  {/* Avatar image on top */}
                  {avatarSrc && (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {isSavingProfile && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-white"></div>
                    </div>
                  )}
                </div>
                {/* Camera overlay to trigger file input */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#BF3A20] border-2 border-white rounded-full flex items-center justify-center shadow-md hover:bg-[#D44B2F] transition-colors cursor-pointer z-20"
                  title="Đổi ảnh đại diện"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User name & email */}
              <h2 className="font-display italic font-bold text-lg text-neutral-900 leading-tight">
                {user?.name || 'Thành Viên'}
              </h2>
              <span className="inline-block bg-[#BF3A20] text-white text-[9px] font-mono font-black uppercase tracking-widest px-3 py-0.5 border border-neutral-900 mt-1 select-none">
                Thành viên Đồng
              </span>
              <p className="text-[11px] font-mono text-neutral-500 mt-1 flex items-center gap-1 justify-center">
                <Mail size={10} />
                {user?.email || '—'}
              </p>
              {(user as any)?.phone && (
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5 flex items-center gap-1 justify-center">
                  <Phone size={10} />
                  {(user as any).phone}
                </p>
              )}

              {/* Change Password shortcut */}
              <div className="mt-5 border-t border-dashed border-neutral-200 pt-4">
                <button
                  onClick={() => setIsChangePwModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-neutral-300 hover:border-[#BF3A20] text-neutral-500 hover:text-[#BF3A20] font-mono font-bold text-xs uppercase tracking-wider py-2 px-4 transition-all cursor-pointer"
                >
                  <KeyRound size={13} strokeWidth={1.5} />
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* ── Wallet & Points Card ── */}
            <div className="card-retro bg-[#FEFCF9] relative overflow-hidden p-6 shadow-saigon-card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4 border-b border-dashed border-neutral-200 pb-2">
                <Wallet className="text-[#BF3A20]" size={18} strokeWidth={1.5} />
                <h2 className="font-mono font-bold text-xs uppercase tracking-widest text-neutral-800">
                  Ví điện tử Saigon-Pay
                </h2>
              </div>

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
                  <p className="text-lg font-black text-neutral-800">{user?.points || 0} Điểm</p>
                  <p className="text-[9px] text-neutral-500 font-body mt-1">
                    * Mỗi lượt đánh giá thành công nhận ngay 50 điểm hoặc voucher 15k!
                  </p>
              </div>
            </div>
          </div>
        </div>

          {/* ══════════════════════════════════════════════════
              RIGHT COLUMN (8/12): Tabs
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-8">
            
            {/* Tab switchers */}
            <div className="flex border-b-2 border-neutral-900 mb-6 bg-transparent gap-2 flex-wrap">
              {(['profile', 'orders', 'favorites'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border-t-2 border-l-2 border-r-2 border-neutral-900 transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#BF3A20] text-white -mb-[2px] shadow-retro-sm translate-y-[1px]'
                      : 'bg-[#FEFCF9] text-neutral-600 hover:text-neutral-900 border-b border-transparent'
                  }`}
                >
                  {tab === 'profile' ? 'Hồ Sơ & Địa Chỉ' : tab === 'orders' ? 'Lịch Sử Đơn Hàng' : 'Món Ăn Yêu Thích'}
                </button>
              ))}
            </div>

            {/* ─────────── TAB 1: HỒ SƠ & ĐỊA CHỈ ─────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                
                {/* Personal Profile Form */}
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-saigon-card">
                  <div className="flex items-center justify-between gap-2 mb-6 border-b border-neutral-200 pb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="text-[#BF3A20]" size={20} strokeWidth={1.5} />
                      <h2 className="text-lg font-heading font-bold text-neutral-900">
                        Thông tin cá nhân
                      </h2>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={handleStartEdit}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#BF3A20] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        <Pencil size={11} strokeWidth={1.5} /> Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    /* ── Edit Mode ── */
                    <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-5">
                      
                      {/* Avatar preview in form */}
                      {avatarPreview && (
                        <div className="flex items-center gap-3 bg-[#FAF7F3] border border-dashed border-neutral-300 p-3 rounded-sm">
                          <img src={avatarPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#BF3A20]" />
                          <div className="flex-grow">
                            <p className="text-xs font-mono font-bold text-neutral-700">Ảnh đại diện mới</p>
                            <p className="text-[10px] text-neutral-400">Nhấn "Lưu lại" để áp dụng thay đổi</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setAvatarPreview(null); setEditAvatar(null); }}
                            className="text-neutral-400 hover:text-[#BF3A20] cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      {/* Avatar change button inline */}
                      <div>
                        <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-2">
                          Ảnh đại diện
                        </label>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="flex items-center gap-2 border-2 border-dashed border-neutral-400 hover:border-[#BF3A20] bg-transparent text-neutral-500 hover:text-[#BF3A20] font-mono text-xs font-bold uppercase py-2 px-4 transition-all cursor-pointer"
                        >
                          <Camera size={14} strokeWidth={1.5} />
                          {avatarPreview ? 'Chọn ảnh khác' : 'Chọn ảnh từ máy tính'}
                        </button>
                        <p className="text-[9px] text-neutral-400 mt-1 font-mono">Định dạng: JPG, PNG, GIF. Tối đa 2MB.</p>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-mono font-black uppercase text-neutral-500 mb-1.5">
                          Họ và tên <span className="text-[#BF3A20]">*</span>
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nhập họ và tên..."
                          className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2.5 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                        />
                      </div>

                      {/* Email (readonly) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-mono font-black uppercase text-neutral-500">
                            Địa chỉ email
                          </label>
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-0.5">
                            <Lock size={10} /> Không thể chỉnh sửa
                          </span>
                        </div>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-[#F0E9DE]/50 border-2 border-[#E8D8C6] opacity-60 cursor-not-allowed rounded px-3 py-2.5 text-sm text-neutral-500 focus:outline-none shadow-inner font-body"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-mono font-black uppercase text-neutral-500 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Nhập số điện thoại liên lạc..."
                          className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2.5 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                        />
                      </div>

                      {/* Default Address */}
                      <div>
                        <label className="block text-xs font-mono font-black uppercase text-neutral-500 mb-1.5">
                          Địa chỉ giao hàng mặc định
                        </label>
                        <textarea
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                          rows={3}
                          className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2.5 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body resize-none"
                        />
                        <p className="text-[9px] font-mono text-neutral-400 mt-1">Địa chỉ này sẽ được dùng mặc định khi đặt hàng.</p>
                      </div>

                      {/* Actions */}
                      <div className="pt-1 flex justify-end gap-2 border-t border-dashed border-neutral-200">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-neutral-500 hover:text-neutral-700 font-mono text-xs px-4 py-2 cursor-pointer hover:underline"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex items-center gap-2 bg-[#BF3A20] hover:bg-[#D44B2F] disabled:opacity-60 text-white font-mono font-bold text-xs py-2.5 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all cursor-pointer"
                        >
                          {isSavingProfile
                            ? <><div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-white"></div>Đang lưu...</>
                            : <><Save size={13} strokeWidth={1.5} />Lưu thay đổi</>
                          }
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ── View Mode ── */
                    <div className="space-y-4">
                      {/* Name */}
                      <div className="flex items-center gap-3 py-3 border-b border-dashed border-neutral-100">
                        <div className="w-8 h-8 rounded-full bg-[#F0E9DE] flex items-center justify-center flex-shrink-0">
                          <UserIcon size={14} className="text-[#BF3A20]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Họ và tên</p>
                          <p className="text-sm font-body font-semibold text-neutral-800 mt-0.5">{user?.name || '—'}</p>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="flex items-center gap-3 py-3 border-b border-dashed border-neutral-100">
                        <div className="w-8 h-8 rounded-full bg-[#F0E9DE] flex items-center justify-center flex-shrink-0">
                          <Mail size={14} className="text-[#BF3A20]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Địa chỉ email</p>
                          <p className="text-sm font-body font-semibold text-neutral-800 mt-0.5">{user?.email || '—'}</p>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 flex items-center gap-0.5 flex-shrink-0">
                          <Lock size={9} /> Cố định
                        </span>
                      </div>
                      {/* Phone */}
                      <div className="flex items-center gap-3 py-3 border-b border-dashed border-neutral-100">
                        <div className="w-8 h-8 rounded-full bg-[#F0E9DE] flex items-center justify-center flex-shrink-0">
                          <Phone size={14} className="text-[#BF3A20]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Số điện thoại</p>
                          <p className="text-sm font-body font-semibold text-neutral-800 mt-0.5">
                            {(user as any)?.phone || <span className="text-neutral-400 italic text-xs font-mono">Chưa cập nhật</span>}
                          </p>
                        </div>
                      </div>
                      {/* Default Address */}
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-8 h-8 rounded-full bg-[#F0E9DE] flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-[#BF3A20]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Địa chỉ mặc định</p>
                          <p className="text-sm font-body font-semibold text-neutral-800 mt-0.5">
                            {(user as any)?.address || <span className="text-neutral-400 italic text-xs font-mono">Chưa cập nhật</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <SaigonDivider />

                {/* Address Book Section */}
                <div>
                  <h3 className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest border-b border-dashed border-neutral-200 pb-1.5 mb-4 select-none">
                    Sổ địa chỉ nhận hàng
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="card-retro bg-[#FEFCF9] p-4 flex flex-col justify-between gap-3 shadow-sm border border-neutral-900">
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-dashed border-neutral-100 pb-2 mb-2">
                            <span className="bg-[#FAF0D2] border border-[#C98F0A]/30 text-[10px] font-bold font-mono px-2 py-0.5 text-neutral-800 rounded-sm uppercase">
                              {address.title}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 font-body leading-relaxed">{address.detail}</p>
                          <div className="mt-3 text-[10px] text-neutral-500 font-mono">
                            <span className="font-bold text-neutral-700">{address.recipientName}</span> — {address.recipientPhone}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-2 mt-1">
                          <button onClick={() => handleOpenAddressModal(address)} className="text-[10px] font-mono font-bold text-neutral-600 hover:text-[#BF3A20] flex items-center gap-0.5 hover:underline cursor-pointer">
                            <Pencil size={11} strokeWidth={1.5} /> Sửa
                          </button>
                          <button onClick={() => handleDeleteAddress(address.id)} className="text-[10px] font-mono font-bold text-[#BF3A20] hover:underline flex items-center gap-0.5 cursor-pointer">
                            <Trash2 size={11} strokeWidth={1.5} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}

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

            {/* ─────────── TAB 2: LỊCH SỬ ĐƠN HÀNG ─────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {ordersLoading ? (
                  <div className="text-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#BF3A20] inline-block mr-2"></div>
                    <span>Đang tải đơn hàng...</span>
                  </div>
                ) : realOrders.length > 0 ? (
                  realOrders.map((order) => {
                    const isCompleted = order.status === 'completed';
                    const isCancelled = order.status === 'cancelled';
                    return (
                      <div key={order.id} className="card-retro bg-[#FEFCF9] p-5 flex flex-col gap-4 border border-neutral-900 shadow-sm">
                        <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                          <div>
                            <h3 className="text-lg font-display italic font-bold text-[#BF3A20]">
                              {order.restaurant?.name || 'Cửa hàng ngon'}
                            </h3>
                            <p className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center gap-1 select-none">
                              <Calendar size={11} /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-sm select-none ${
                            isCompleted ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                            : isCancelled ? 'bg-[#BF3A20]/5 border-[#BF3A20] text-[#BF3A20]'
                            : 'bg-amber-50 border-amber-600 text-amber-800'
                          }`}>
                            {isCompleted ? '[ HOÀN THÀNH ]' : (isCancelled ? '[ ĐÃ HỦY ]' : `[ ${order.status.toUpperCase()} ]`)}
                          </span>
                        </div>

                        <div className="border-t border-b border-dashed border-neutral-100 py-2.5 space-y-2.5">
                          <span className="font-mono font-semibold text-neutral-500 text-[10px] uppercase block mb-1 select-none">Món ăn trong đơn:</span>
                          {order.items && order.items.map((item: any) => {
                            const isReviewed = reviewedKeys.includes(`${order.id}-${item.menuItemId}`);
                            return (
                              <div key={item.menuItemId} className="flex justify-between items-center text-xs">
                                <span className="text-neutral-700 font-body font-semibold">
                                  {item.quantity}x {item.name || 'Món ăn ngon'}
                                </span>
                                {isCompleted && (
                                  isReviewed ? (
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Đã đánh giá</span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenRatingModal(order.id, item.menuItemId, item.name)}
                                      className="bg-transparent hover:bg-[#BF3A20] hover:text-white text-[#BF3A20] font-body font-bold text-[9px] uppercase py-1 px-2 border border-[#BF3A20] transition-colors cursor-pointer select-none animate-pulse"
                                    >
                                      Đánh giá món
                                    </button>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                          <div className="font-mono text-sm font-bold text-neutral-800">
                            <span className="text-[10px] text-neutral-400 block font-normal select-none">TỔNG THANH TOÁN</span>
                            <span className="text-[#BF3A20] text-base">{Number(order.totalAmount).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedOrderDetail(order)}
                              className="bg-white hover:bg-neutral-50 text-neutral-800 font-body font-bold text-[10px] uppercase py-2.5 px-3 border-2 border-neutral-900 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none flex items-center gap-1"
                            >
                              📁 Chi tiết đơn
                            </button>
                            <button
                              onClick={() => handleReorder(order)}
                              className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-bold text-[10px] uppercase py-2.5 px-3 border-2 border-neutral-900 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none"
                            >
                              Đặt lại đơn này
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-neutral-400 font-mono italic">
                    [ Chưa có lịch sử đơn hàng nào ]
                  </div>
                )}
              </div>
            )}

            {/* ─────────── TAB 3: MÓN ĂN YÊU THÍCH ─────────── */}
            {activeTab === 'favorites' && (
              <div className="space-y-4">
                {favoritesLoading ? (
                  <div className="text-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#BF3A20] inline-block mr-2"></div>
                    <span>Đang tải món yêu thích...</span>
                  </div>
                ) : favoriteItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteItems.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/menu-items/${item.id}`)}
                        className="card-retro bg-[#FEFCF9] p-4 flex gap-4 border border-neutral-900 shadow-sm cursor-pointer hover:border-[#BF3A20] transition-colors"
                      >
                        <div className="w-16 h-16 overflow-hidden border border-neutral-200 rounded-sm flex-shrink-0">
                          <img
                            src={item.image || item.imageUrl}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://placehold.co/150x150/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                            }}
                            className="w-full h-full object-cover filter sepia-[5%]"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between font-mono">
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{item.name}</h4>
                            <p className="text-[10px] text-neutral-500 mt-0.5">✿ {item.restaurantName || 'Quán ăn ngon'}</p>
                          </div>
                          <div className="flex justify-between items-center border-t border-dashed border-neutral-100 pt-2 mt-2">
                            <span className="price-text font-bold text-[#BF3A20] text-xs">
                              {Number(item.price).toLocaleString('vi-VN')} đ
                            </span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const res = await favoriteApi.toggleFavorite(item.id);
                                  if (res && res.success) setFavoriteItems(prev => prev.filter(i => i.id !== item.id));
                                } catch (err) { console.error(err); }
                              }}
                              className="text-[10px] font-bold text-[#BF3A20] hover:underline"
                            >
                              Xóa yêu thích
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400 font-mono italic border border-dashed border-neutral-300 bg-white rounded-md select-none">
                    [ Bạn chưa có món ăn yêu thích nào. Hãy lướt thực đơn và thả tim món ruột nhé! ]
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════
          MODAL: Đổi mật khẩu
      ════════════════════════════════════════════════════════ */}
      {isChangePwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="card-retro bg-[#FEFCF9] max-w-md w-full p-6 relative shadow-saigon-card border-2 border-neutral-900">
            <button
              onClick={() => { setIsChangePwModalOpen(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <span className="bg-neutral-900 text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-700 rotate-[-1deg] inline-block mb-3 select-none">
              BẢO MẬT TÀI KHOẢN
            </span>

            <h3 className="text-xl font-heading font-black text-neutral-900 mb-1">Đổi mật khẩu</h3>
            <p className="text-xs font-mono text-neutral-500 mb-5">Nhập mật khẩu hiện tại để xác nhận danh tính, sau đó nhập mật khẩu mới.</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1.5">
                  Mật khẩu hiện tại <span className="text-[#BF3A20]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer">
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1.5">
                  Mật khẩu mới <span className="text-[#BF3A20]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự..."
                    className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body"
                  />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer">
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        newPassword.length >= i * 2
                          ? newPassword.length >= 10 ? 'bg-emerald-500' : newPassword.length >= 6 ? 'bg-amber-400' : 'bg-red-400'
                          : 'bg-neutral-200'
                      }`}></div>
                    ))}
                    <span className="text-[9px] font-mono text-neutral-400 ml-1">
                      {newPassword.length < 6 ? 'Yếu' : newPassword.length < 10 ? 'Trung bình' : 'Mạnh'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-[#BF3A20]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className={`w-full bg-[#F0E9DE] border-2 rounded px-3 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none transition-all shadow-inner font-body ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-[#BF3A20] focus:border-[#BF3A20]'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-[#E8D8C6] focus:border-[#BF3A20]'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer">
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-[#BF3A20] font-mono mt-1">⚠ Mật khẩu xác nhận chưa khớp</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[10px] text-emerald-600 font-mono mt-1">✓ Mật khẩu khớp</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-dashed border-neutral-200">
                <button
                  type="button"
                  onClick={() => { setIsChangePwModalOpen(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="bg-transparent hover:underline text-neutral-500 font-mono text-xs px-4 py-2 cursor-pointer select-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-60 text-white font-mono font-bold text-xs py-2.5 px-5 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-sm transition-all cursor-pointer"
                >
                  {isChangingPw
                    ? <><div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-white"></div> Đang đổi...</>
                    : <><KeyRound size={13} strokeWidth={1.5} />Đổi mật khẩu</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Địa chỉ
      ════════════════════════════════════════════════════════ */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="card-retro bg-[#FEFCF9] max-w-md w-full p-6 relative shadow-saigon-card border-2 border-neutral-900">
            <button onClick={() => setIsAddressModalOpen(false)} className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer">
              <X size={20} strokeWidth={1.5} />
            </button>
            <span className="bg-[#C98F0A] text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-900 rotate-[-1deg] inline-block mb-3 select-none">
              BƯU THIẾP ĐỊA CHỈ
            </span>
            <h3 className="text-xl font-heading font-black text-neutral-900 mb-4">
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng'}
            </h3>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">Nhãn địa chỉ</label>
                <input type="text" placeholder="Nhà riêng, Văn phòng..." value={addrTitle} onChange={(e) => setAddrTitle(e.target.value)} className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">Địa chỉ chi tiết</label>
                <textarea placeholder="Số nhà, Tên đường, Quận/Huyện..." rows={3} value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">Họ tên người nhận</label>
                <input type="text" placeholder="Nhập tên người nhận..." value={addrRecipient} onChange={(e) => setAddrRecipient(e.target.value)} className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">Số điện thoại người nhận</label>
                <input type="text" placeholder="Nhập số điện thoại..." value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="bg-transparent hover:underline text-neutral-500 font-mono text-xs px-4 py-2 cursor-pointer select-none">
                  Hủy bỏ
                </button>
                <button type="submit" className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-2 px-5 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-sm transition-all cursor-pointer">
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Đánh giá món ăn
      ════════════════════════════════════════════════════════ */}
      {isRatingModalOpen && ratingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="card-retro bg-[#FEFCF9] max-w-md w-full p-6 relative shadow-saigon-card border-2 border-neutral-900">
            <button onClick={() => setIsRatingModalOpen(false)} className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer">
              <X size={20} strokeWidth={1.5} />
            </button>
            <span className="bg-[#BF3A20] text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-900 rotate-[-2deg] inline-block mb-3 select-none">
              Ý KIẾN KHÁCH HÀNG
            </span>
            <h3 className="text-xl font-heading font-black text-neutral-900 mb-1">Đánh giá món ăn</h3>
            <p className="text-xs font-display italic text-[#BF3A20] mb-4">Món: {ratingMenuItemName}</p>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2 bg-[#FAF7F3] border border-dashed border-neutral-200 rounded-sm">
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setRatingValue(star)} className="text-amber-500 hover:scale-110 transition-transform cursor-pointer" title={`${star} Sao`}>
                      <Star size={28} fill={star <= ratingValue ? '#D49E00' : 'none'} stroke={star <= ratingValue ? '#D49E00' : '#888888'} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
                <span className="mt-2 text-xs font-mono font-bold text-neutral-700">{ratingValue} / 5 Sao — {getRatingFeedback(ratingValue)}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 select-none">Chọn phần quà bạn muốn nhận:</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['points', 'voucher'] as const).map(rt => (
                    <label key={rt} onClick={() => setRewardType(rt)} className={`flex items-center justify-between p-3 border-2 rounded-md cursor-pointer select-none transition-all ${rewardType === rt ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="reward" checked={rewardType === rt} onChange={() => setRewardType(rt)} className="w-3.5 h-3.5 accent-[#BF3A20] cursor-pointer" />
                        <div>
                          <p className="text-xs font-bold text-neutral-800">{rt === 'points' ? 'Tích lũy điểm' : 'Mã giảm giá (Voucher)'}</p>
                          <p className={`text-[9px] font-mono ${rt === 'points' ? 'text-neutral-400' : 'text-[#AD7800]'}`}>{rt === 'points' ? '+50 điểm tích lũy vào tài khoản' : 'Tặng ngay mã giảm 15.000đ khi mua hàng'}</p>
                        </div>
                      </div>
                      <span className="text-xs">{rt === 'points' ? '🪙' : '🎫'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black uppercase text-neutral-500 mb-1">Nhận xét của bạn</label>
                <textarea placeholder="Hãy viết cảm nghĩ của bạn tại đây..." rows={3} value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} className="w-full bg-[#F0E9DE] border-2 border-[#E8D8C6] focus:border-[#BF3A20] rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none transition-all shadow-inner font-body resize-none" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRatingModalOpen(false)} className="bg-transparent hover:underline text-neutral-500 font-mono text-xs px-4 py-2 cursor-pointer select-none">Hủy bỏ</button>
                <button type="submit" className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-2 px-5 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-sm transition-all cursor-pointer">
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Chi tiết đơn hàng lịch sử
      ════════════════════════════════════════════════════════ */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="card-retro bg-[#FEFCF9] max-w-xl w-full p-6 relative shadow-saigon-card border-2 border-neutral-900 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer p-1 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Header info */}
            <div className="border-b-2 border-neutral-900 pb-3 mb-4 select-none">
              <span className="bg-[#BF3A20] text-white text-[9px] font-mono font-bold px-2 py-0.5 border border-neutral-950 inline-block mb-2 uppercase tracking-widest">
                ĐƠN HÀNG KÝ GỬI
              </span>
              <h3 className="text-xl font-heading font-black text-neutral-900 flex items-center gap-1.5 font-display italic">
                <Receipt size={20} className="text-[#BF3A20]" />
                Chi Tiết Đơn Hàng
              </h3>
              <p className="text-[10px] font-mono text-neutral-500 mt-1">
                Mã đơn: <span className="font-bold text-neutral-800">#GRB-{selectedOrderDetail.id.slice(0, 8).toUpperCase()}</span>
                <span className="mx-2">•</span>
                Ngày gửi: <span className="font-bold text-neutral-800">{new Date(selectedOrderDetail.createdAt).toLocaleString('vi-VN')}</span>
              </p>
            </div>

            {/* Details scrollable box */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              
              {/* 1. Restaurant Details */}
              <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Cửa hàng phục vụ</span>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display italic font-bold text-[#BF3A20] text-sm">
                      {selectedOrderDetail.restaurant?.name || 'Cửa hàng ngon'}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      📍 {selectedOrderDetail.restaurant?.address || 'Quận 1, TP. Hồ Chí Minh'}
                    </p>
                  </div>
                  {selectedOrderDetail.restaurant?.id && (
                    <button
                      onClick={() => {
                        setSelectedOrderDetail(null);
                        navigate(`/restaurants/${selectedOrderDetail.restaurant.id}`);
                      }}
                      className="text-[9px] font-mono font-bold text-[#BF3A20] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Ghé quán ➔
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Order status & delivery details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Trạng thái đơn hàng</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={13} className="text-[#BF3A20]" />
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border rounded-xs ${
                      selectedOrderDetail.status === 'completed' 
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : selectedOrderDetail.status === 'cancelled'
                        ? 'bg-[#BF3A20]/5 border-[#BF3A20] text-[#BF3A20]'
                        : 'bg-amber-50 border-amber-600 text-amber-800'
                    }`}>
                      {selectedOrderDetail.status === 'completed' && 'HOÀN THÀNH'}
                      {selectedOrderDetail.status === 'cancelled' && 'ĐÃ HỦY'}
                      {selectedOrderDetail.status === 'pending' && 'CHỜ TIẾP NHẬN'}
                      {selectedOrderDetail.status === 'confirmed' && 'ĐÃ XÁC NHẬN'}
                      {selectedOrderDetail.status === 'preparing' && 'ĐANG CHUẨN BỊ'}
                      {selectedOrderDetail.status === 'ready' && 'ĐÃ CHUẨN BỊ XONG'}
                      {selectedOrderDetail.status === 'delivering' && 'ĐANG GIAO HÀNG'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-body mt-2 leading-relaxed">
                    {selectedOrderDetail.status === 'completed' && 'Đơn hàng đã được bưu tá giao thành công.'}
                    {selectedOrderDetail.status === 'cancelled' && 'Đơn hàng đã bị hủy bỏ.'}
                    {selectedOrderDetail.status === 'pending' && 'Chờ bưu cục tiếp nhận và phân phối đơn.'}
                    {selectedOrderDetail.status === 'confirmed' && 'Nhà hàng đã tiếp nhận đơn hàng của bạn.'}
                    {selectedOrderDetail.status === 'preparing' && 'Nhà bếp đang chế biến các món ngon cho bạn.'}
                    {selectedOrderDetail.status === 'ready' && 'Món ngon đã hoàn thành và sẵn sàng di chuyển.'}
                    {selectedOrderDetail.status === 'delivering' && 'Bưu tá di chuyển Honda Cub 81 đang giao tới.'}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Hình thức thanh toán</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CreditCard size={13} className="text-[#BF3A20]" />
                    <span className="text-xs font-semibold text-neutral-800">
                      {selectedOrderDetail.paymentMethod === 'COD' && 'Tiền mặt (COD)'}
                      {selectedOrderDetail.paymentMethod === 'WALLET' && 'Ví Saigon-Pay'}
                      {selectedOrderDetail.paymentMethod === 'POINTS' && '🪙 Điểm Tích Lũy'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-body mt-2 leading-relaxed">
                    {selectedOrderDetail.paymentMethod === 'COD' && 'Thanh toán trực tiếp cho bưu tá khi nhận món.'}
                    {selectedOrderDetail.paymentMethod === 'WALLET' && 'Đã khấu trừ trực tiếp vào số dư ví Saigon-Pay.'}
                    {selectedOrderDetail.paymentMethod === 'POINTS' && 'Đã thanh toán bằng điểm tích lũy của thành viên.'}
                  </p>
                </div>
              </div>

              {/* 3. Delivery address */}
              <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Địa chỉ ký nhận</span>
                <div className="flex gap-2 items-start mt-1">
                  <MapPin size={14} className="text-[#BF3A20] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-xs text-[#2C1A0E] font-semibold font-body leading-relaxed">
                    {selectedOrderDetail.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* 4. Order items details */}
              <div className="p-3 bg-[#FAF7F3] border border-[#E8D8C6] rounded-md">
                <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-2">Thực đơn ký gửi ({selectedOrderDetail.items?.length || 0} món)</span>
                <div className="space-y-2 border-b border-dashed border-neutral-200 pb-2.5 mb-2.5">
                  {selectedOrderDetail.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-semibold text-neutral-800 font-body">
                          {item.quantity}x {item.name || 'Món ăn ngon'}
                        </p>
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-[9px] text-[#9E6E4A] font-semibold mt-0.5">
                            + Topping: {item.toppings.join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-neutral-700">
                        {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal calculations */}
                <div className="space-y-1.5 font-mono text-[10px] text-neutral-500">
                  <div className="flex justify-between">
                    <span>Tạm tính món ăn:</span>
                    <span>
                      {(selectedOrderDetail.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0) || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển bưu điện:</span>
                    <span>+15.000đ</span>
                  </div>
                  {/* Tính trừ tiền voucher nếu tổng tiền không khớp với tạm tính + 15k */}
                  {(() => {
                    const sub = selectedOrderDetail.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0) || 0;
                    const shipping = 15000;
                    const final = Number(selectedOrderDetail.totalAmount);
                    const voucherDiff = sub + shipping - final;
                    if (voucherDiff > 0) {
                      return (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Mã giảm giá áp dụng:</span>
                          <span>-{voucherDiff.toLocaleString('vi-VN')}đ</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-2 text-xs font-black text-neutral-900">
                    <span className="uppercase">TỔNG CƯỚC KÝ GỬI:</span>
                    <span className="text-[#BF3A20] text-sm">
                      {Number(selectedOrderDetail.totalAmount).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="grid grid-cols-2 gap-3 border-t-2 border-neutral-900 pt-4 mt-4">
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="py-2.5 px-4 font-body font-bold text-xs uppercase border-2 border-neutral-900 shadow-retro-sm bg-white hover:bg-neutral-50 active:translate-y-[1px] active:shadow-none text-center cursor-pointer transition-all"
              >
                Đóng chi tiết
              </button>
              <button
                onClick={() => {
                  setSelectedOrderDetail(null);
                  handleReorder(selectedOrderDetail);
                }}
                className="py-2.5 px-4 font-body font-bold text-xs uppercase border-2 border-neutral-900 shadow-retro bg-[#BF3A20] hover:bg-[#D44B2F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm text-white text-center cursor-pointer transition-all"
              >
                Đặt lại đơn này
              </button>
            </div>

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
