import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  DollarSign, 
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Ticket,
  X,
  CheckCircle2,
  ChefHat,
  Home,
  ClipboardList
} from 'lucide-react';
import Header from '../../components/organisms/Header';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import orderApi from '../../services/orderApi';
import voucherApi from '../../services/voucherApi';
import { VoucherCard } from '../../components/molecules/VoucherCard';
import api from '../../services/api';
import restaurantApi from '../../services/restaurantApi';
import { authApi } from '../../services/authApi';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  toppings?: string[];
}

export const CheckoutTracking: React.FC = () => {
  const navigate = useNavigate();
  const { selectedItems, restaurantId, totalItems, totalPrice, clearSelected } = useCart();
  const { user, refetchMe } = useAuth();

  // Screen state: 'checkout' | 'tracking' | 'payment-simulation' | 'success'
  const [screen, setScreen] = useState<'checkout' | 'tracking' | 'payment-simulation' | 'success'>('checkout');
  const [successOrderData, setSuccessOrderData] = useState<{
    orderId: string;
    orderCode: string;
    totalAmount: number;
    restaurantName: string;
    paymentMethod: string;
    itemCount: number;
    deliveryCode?: string;
  } | null>(null);
  const [simulationData, setSimulationData] = useState<{
    type: 'VIETQR' | 'WALLET';
    orderId?: string;
    amount: number;
    code?: string;
    orderData?: any;
  } | null>(null);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [pin, setPin] = useState('');

  // System fees configuration
  const [feeConfigs, setFeeConfigs] = useState({
    platformFee: 5,
    minOrderAmount: 20000
  });

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET' | 'POINTS' | 'VIETQR'>('COD');
  const [activePaymentMethods, setActivePaymentMethods] = useState<{ COD: boolean; WALLET: boolean; POINTS: boolean; VIETQR?: boolean }>({
    COD: true,
    WALLET: true,
    POINTS: true,
    VIETQR: true
  });
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Ví voucher states
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [collectedVouchers, setCollectedVouchers] = useState<any[]>([]);
  const [loadingCollected, setLoadingCollected] = useState(false);

  // Restaurant state and fetching
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [restaurantsMap, setRestaurantsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!restaurantId) {
      setRestaurantInfo(null);
      return;
    }
    restaurantApi.getRestaurantById(restaurantId)
      .then((data) => {
        if (data) setRestaurantInfo(data);
      })
      .catch((err) => {
        console.error('Error fetching restaurant info in checkout:', err);
        setRestaurantInfo({ id: restaurantId, name: 'Quán ăn', address: '', deliveryFee: 15000 });
      });
  }, [restaurantId]);

  useEffect(() => {
    const uniqueIds = Array.from(new Set(selectedItems.map(item => item.restaurantId).filter(Boolean)));
    uniqueIds.forEach(id => {
      if (!restaurantsMap[id]) {
        restaurantApi.getRestaurantById(id)
          .then((data) => {
            if (data) {
              setRestaurantsMap(prev => ({ ...prev, [id]: data }));
            }
          })
          .catch((err) => {
            console.error('Error fetching restaurant info in checkout:', err);
            setRestaurantsMap(prev => ({ ...prev, [id]: { id, name: 'Quán ăn', address: '', deliveryFee: 15000 } }));
          });
      }
    });
  }, [selectedItems, restaurantsMap]);

  // Load ví voucher
  useEffect(() => {
    if (user) {
      const fetchCollected = async () => {
        try {
          setLoadingCollected(true);
          const res = await voucherApi.getMyCollectedVouchers();
          if (res && res.success) {
            setCollectedVouchers(res.data || []);
          }
        } catch (err) {
          console.error('Error fetching collected vouchers in checkout:', err);
        } finally {
          setLoadingCollected(false);
        }
      };
      fetchCollected();
    }
  }, [user]);

  // Custom Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'warning' | 'error' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showCustomAlert = (message: string, title: string = 'Thông Báo', type: 'info' | 'warning' | 'error' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  // QR Countdown Timer
  const [qrCountdown, setQrCountdown] = useState<number>(120);

  useEffect(() => {
    let timer: any;
    if (screen === 'payment-simulation' && simulationData?.type === 'VIETQR') {
      setQrCountdown(120);
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            showCustomAlert('Thời gian thanh toán (2 phút) đã hết. Vui lòng đặt lại đơn hàng.', 'Hết hạn', 'warning');
            setScreen('checkout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [screen, simulationData]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Fetch active vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setVouchersLoading(true);
        const res = await voucherApi.getVouchers();
        if (res && res.success) {
          setVouchers(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách voucher:', err);
      } finally {
        setVouchersLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  // Fetch active payment methods configuration
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        console.log('Fetching payment methods configuration...');
        const res = await api.get('/system/payment-methods');
        console.log('Payment methods response:', res);
        if (res && (res as any).success && (res as any).data) {
          const data = (res as any).data;
          console.log('Setting active payment methods state to:', data);
          setActivePaymentMethods(data);
          
          // Set default payment method to the first enabled one
          if (!data.COD) {
            if (data.WALLET) {
              setPaymentMethod('WALLET');
            } else if (data.POINTS) {
              setPaymentMethod('POINTS');
            }
          }
        }
      } catch (err) {
        console.error('Lỗi lấy cấu hình phương thức thanh toán:', err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Fetch platform fees configuration
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/system/fees');
        if (res && (res as any).success && (res as any).data) {
          const data = (res as any).data;
          setFeeConfigs({
            platformFee: Number(data.platformFee) || 5,
            minOrderAmount: Number(data.minOrderAmount) || 20000
          });
        }
      } catch (err) {
        console.error('Lỗi lấy cấu hình phí hệ thống:', err);
      }
    };
    fetchFees();
  }, []);

  // Lắng nghe kết quả thanh toán PayOS trả về
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const payment = params.get('payment');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const code = params.get('code');

    if (status && orderId) {
      if (status === 'success') {
        clearSelected();
        showCustomAlert('Thanh toán đơn hàng qua VietQR thành công!', 'Thành công', 'info');
        navigate(`/orders/history?orderId=${orderId}`);
      } else if (status === 'cancelled') {
        showCustomAlert('Bạn đã hủy thanh toán VietQR cho đơn hàng này.', 'Hủy thanh toán', 'info');
      } else if (status === 'pending' && payment === 'vietqr') {
        setSimulationData({
          type: 'VIETQR',
          orderId,
          amount: amount ? Number(amount) : 0,
          code: code || '',
        });
        setScreen('payment-simulation');
      }
      
      // Xoá các query params trên URL để tránh hiển thị lại alert khi reload trang
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Lấy số dư ví của người dùng từ API thực tế của database
  const fetchWalletBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res && (res as any).success && (res as any).data) {
        setWalletBalance(Number((res as any).data.balance));
      }
    } catch (err) {
      console.error('Lỗi lấy số dư ví:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  // Address state setup
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  
  // New address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleType, setNewTitleType] = useState('Nhà riêng');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDetail, setNewDetail] = useState('');

  // Load addresses from dynamic key: user_addresses_${user.id}
  useEffect(() => {
    if (!user) return;
    const storageKey = `user_addresses_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    let list = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi phân tích cú pháp địa chỉ từ localStorage:', e);
      }
    }
    
    setAddresses(list);
    if (list.length > 0) {
      setSelectedAddress(list[0]);
    } else {
      setSelectedAddress(null);
    }
  }, [user]);

  // Handle adding new address
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRecipient.trim() || !newPhone.trim() || !newDetail.trim()) {
      showCustomAlert('Vui lòng điền đầy đủ các thông tin địa chỉ.', 'Thiếu thông tin', 'warning');
      return;
    }

    const normalized = newDetail.trim().toLowerCase();
    const isHCM = 
      normalized.includes('hồ chí minh') ||
      normalized.includes('ho chi minh') ||
      normalized.includes('tp.hcm') ||
      normalized.includes('tphcm') ||
      normalized.includes('hcmc') ||
      normalized.includes('hcm') ||
      normalized.includes('sài gòn') ||
      normalized.includes('sai gon');

    if (!isHCM) {
      showCustomAlert('Hệ thống hiện tại chỉ hỗ trợ giao hàng tại khu vực TP. Hồ Chí Minh. Vui lòng nhập địa chỉ ở TP.HCM.', 'Ngoài khu vực phục vụ', 'warning');
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      title: newTitle.trim(),
      detail: newDetail.trim(),
      recipientName: newRecipient.trim(),
      recipientPhone: newPhone.trim()
    };
    const updatedList = [...addresses, newAddr];
    setAddresses(updatedList);
    if (user) {
      localStorage.setItem(`user_addresses_${user.id}`, JSON.stringify(updatedList));
    }
    setSelectedAddress(newAddr);
    setShowAddForm(false);

    // Tự động cập nhật làm địa chỉ mặc định trong hồ sơ chính nếu đây là địa chỉ đầu tiên
    if (addresses.length === 0) {
      authApi.updateProfile({ address: newDetail.trim(), phone: newPhone.trim() })
        .then((res) => {
          if (res && res.success && refetchMe) {
            refetchMe();
          }
        })
        .catch((err) => console.error('Lỗi tự động cập nhật hồ sơ chính:', err));
    }
  };

  const deliveryAddress = selectedAddress || {
    title: 'Chưa có địa chỉ',
    detail: 'Vui lòng thêm địa chỉ nhận hàng',
    recipientName: '',
    recipientPhone: ''
  };

  // Determine items to display (fallback to mock items if cart is empty for testing/demo robustness)
  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    if (selectedItems.length > 0) {
      return selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        toppings: item.toppings
      }));
    }
    return [
      { id: 'mock-1', name: 'Hủ Tiếu Gõ Thập Cẩm', price: 45000, quantity: 2, toppings: ['Trứng cút', 'Thịt xá xíu'] },
      { id: 'mock-2', name: 'Cà Phê Sữa Đá Sài Gòn', price: 20000, quantity: 1, toppings: [] }
    ];
  }, [selectedItems]);

  const subtotal = useMemo(() => {
    if (selectedItems.length > 0) return totalPrice;
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedItems, totalPrice, checkoutItems]);

  const deliveryFee = useMemo(() => {
    if (checkoutItems.length === 0) return 0;
    if (selectedItems.length === 0) {
      const fee = restaurantInfo ? Number(restaurantInfo.deliveryFee) : 15000;
      return isNaN(fee) ? 15000 : fee;
    }
    const uniqueIds = Array.from(new Set(selectedItems.map(item => item.restaurantId).filter(Boolean)));
    return uniqueIds.reduce((sum, id) => {
      const rest = restaurantsMap[id];
      const fee = rest ? Number(rest.deliveryFee) : 15000;
      return sum + (isNaN(fee) ? 15000 : fee);
    }, 0);
  }, [restaurantInfo, checkoutItems, selectedItems, restaurantsMap]);

  const platformFee = useMemo(() => {
    return Math.round(subtotal * (feeConfigs.platformFee / 100));
  }, [subtotal, feeConfigs.platformFee]);

  // Final Total calculation (Platform fee is paid by the restaurant, not charged to the user)
  const finalTotal = useMemo(() => {
    const total = subtotal + deliveryFee - discountAmount;
    return total > 0 ? total : 0;
  }, [subtotal, deliveryFee, discountAmount]);

  // Helper to validate and get eligible restaurant order for a voucher
  const getVoucherApplicability = (v: any) => {
    const now = new Date();
    const startDate = new Date(v.startDate);
    const endDate = new Date(v.endDate);
    if (now < startDate || now > endDate) {
      return { applicable: false, reason: 'Mã giảm giá đã hết hạn hoặc chưa có hiệu lực.', targetRestaurantId: null, maxSubtotal: 0 };
    }

    const uniqueRestaurantIds = Array.from(new Set(selectedItems.map(item => item.restaurantId).filter(Boolean)));
    
    let hasMatchingRestaurant = false;
    let hasEligibleSubOrder = false;
    let maxSubtotal = 0;
    let targetRestaurantId: string | null = null;
    
    for (const rId of uniqueRestaurantIds) {
      const restItems = selectedItems.filter(item => item.restaurantId === rId);
      const restSubtotal = restItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const isRestaurantMatch = !v.restaurantId || v.restaurantId === rId;
      if (isRestaurantMatch) {
        hasMatchingRestaurant = true;
        if (restSubtotal >= Number(v.minOrderAmount)) {
          hasEligibleSubOrder = true;
          if (restSubtotal > maxSubtotal) {
            maxSubtotal = restSubtotal;
            targetRestaurantId = rId;
          }
        }
      }
    }

    if (v.restaurantId && !hasMatchingRestaurant) {
      return { applicable: false, reason: `Chỉ áp dụng tại quán: ${v.restaurant?.name || 'Quán riêng'}`, targetRestaurantId: null, maxSubtotal: 0 };
    }

    if (!hasEligibleSubOrder) {
      return { 
        applicable: false, 
        reason: v.restaurantId 
          ? `Đơn hàng của quán này chưa đủ tối thiểu ${Number(v.minOrderAmount).toLocaleString('vi-VN')}đ`
          : `Không có đơn hàng lẻ của nhà hàng nào đạt tối thiểu ${Number(v.minOrderAmount).toLocaleString('vi-VN')}đ`,
        targetRestaurantId: null,
        maxSubtotal: 0
      };
    }

    return { applicable: true, reason: '', targetRestaurantId, maxSubtotal };
  };

  // Apply Coupon code object
  const applyVoucherObj = (voucher: any) => {
    setCouponError('');
    
    const check = getVoucherApplicability(voucher);
    if (!check.applicable) {
      setCouponError(check.reason);
      return;
    }

    let calculatedDiscount = 0;
    if (voucher.discountType === 'fixed_amount') {
      calculatedDiscount = Number(voucher.discountValue);
    } else if (voucher.discountType === 'percentage') {
      const calculated = (check.maxSubtotal * Number(voucher.discountValue)) / 100;
      calculatedDiscount = voucher.maxDiscountAmount ? Math.min(calculated, Number(voucher.maxDiscountAmount)) : calculated;
    }

    setDiscountAmount(calculatedDiscount);
    setAppliedCode(voucher.code);
    setCouponCode('');
  };

  // Apply Coupon code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === '') {
      setCouponError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const foundVoucher = vouchers.find(v => v.code.toUpperCase() === code);
    if (foundVoucher) {
      applyVoucherObj(foundVoucher);
    } else if (code === 'SAIGON90S') {
      setDiscountAmount(15000);
      setAppliedCode('SAIGON90S');
      setCouponCode('');
    } else {
      setCouponError('Mã không hợp lệ hoặc đã hết hạn.');
    }
  };

  // Confirm Order submission
  const handleConfirmOrder = () => {
    if (selectedItems.length === 0) {
      showCustomAlert('Giỏ hàng trống! Vui lòng chọn món ăn trước.', 'Giỏ hàng trống', 'warning');
      return;
    }
    if (subtotal < feeConfigs.minOrderAmount) {
      showCustomAlert(`Đơn hàng chưa đạt giá trị tối thiểu ${feeConfigs.minOrderAmount.toLocaleString('vi-VN')}đ để đặt hàng.`, 'Đơn hàng chưa đạt tối thiểu', 'warning');
      return;
    }
    if (!selectedAddress) {
      showCustomAlert('Vui lòng thêm địa chỉ nhận hàng trước khi thanh toán.', 'Thiếu địa chỉ', 'warning');
      return;
    }

    const normalized = selectedAddress.detail.toLowerCase();
    const isHCM = 
      normalized.includes('hồ chí minh') ||
      normalized.includes('ho chi minh') ||
      normalized.includes('tp.hcm') ||
      normalized.includes('tphcm') ||
      normalized.includes('hcmc') ||
      normalized.includes('hcm') ||
      normalized.includes('sài gòn') ||
      normalized.includes('sai gon');

    if (!isHCM) {
      showCustomAlert('Hệ thống hiện tại chỉ hỗ trợ giao hàng tại khu vực TP. Hồ Chí Minh. Vui lòng chọn địa chỉ khác ở TP.HCM.', 'Ngoài khu vực phục vụ', 'warning');
      return;
    }

    setShowConfirmModal(true);
  };

  const submitOrder = async () => {
    setShowConfirmModal(false);
    
    // Tách các món ăn theo nhà hàng để tạo các đơn tương ứng
    const uniqueRestaurantIds = Array.from(new Set(selectedItems.map(item => item.restaurantId).filter(Boolean)));
    
    if (uniqueRestaurantIds.length > 1 && paymentMethod === 'VIETQR') {
      showCustomAlert(
        'Thanh toán chuyển khoản VietQR hiện tại chỉ hỗ trợ đơn hàng đơn lẻ. Vui lòng sử dụng phương thức thanh toán bằng Ví điện tử Saigon-Pay hoặc Tiền mặt (COD) khi đặt món từ nhiều nhà hàng.',
        'Không hỗ trợ VietQR gộp',
        'warning'
      );
      return;
    }

    // Find which restaurant sub-order is eligible for the applied voucher
    let targetVoucherRestaurantId: string | null = null;
    if (appliedCode) {
      if (appliedCode === 'SAIGON90S') {
        // SAIGON90S is a fallback/mock coupon, apply it to the first restaurant
        targetVoucherRestaurantId = uniqueRestaurantIds[0] || null;
      } else {
        const wrapper = collectedVouchers.find(w => w.voucher?.code === appliedCode);
        const matchingVoucher = wrapper?.voucher;
        if (matchingVoucher) {
          const check = getVoucherApplicability(matchingVoucher);
          if (check.applicable) {
            targetVoucherRestaurantId = check.targetRestaurantId;
          }
        }
      }
    }

    const ordersData = uniqueRestaurantIds.map(rId => {
      const restItems = selectedItems.filter(item => item.restaurantId === rId);
      
      let voucherToUse: string | undefined = undefined;
      if (appliedCode && targetVoucherRestaurantId === rId) {
        voucherToUse = appliedCode;
      }
      
      return {
        restaurantId: rId,
        items: restItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: selectedAddress?.detail || '',
        paymentMethod: paymentMethod, // 'COD' | 'WALLET' | 'POINTS'
        voucherCode: voucherToUse
      };
    });

    if (paymentMethod === 'WALLET') {
      // Chuyển sang màn hình giả lập cổng thanh toán Saigon-Pay
      setSimulationData({
        type: 'WALLET',
        amount: finalTotal,
        orderData: ordersData // Lưu danh sách các đơn hàng con cần tạo
      });
      setPin(''); // Reset PIN nhập
      setScreen('payment-simulation');
      return;
    }

    setIsOrdering(true);
    try {
      const createdOrders: any[] = [];
      
      for (const singleOrderData of ordersData) {
        const res = await orderApi.createOrder(singleOrderData);
        if (res && res.success) {
          createdOrders.push(res.data);
        } else {
          throw new Error(res?.message || 'Có lỗi xảy ra khi gửi đơn hàng.');
        }
      }

      if (paymentMethod !== 'VIETQR') {
        clearSelected(); // Clear active items from cart store
      }
      if (refetchMe) {
        await refetchMe(); // Cập nhật số dư điểm của user
      }
      
      // Add to local notifications list for each created order
      createdOrders.forEach(order => {
        const orderId = order.id || order._id || '';
        const orderCode = order.code || '';
        const restName = restaurantsMap[order.restaurantId]?.name || 'Cửa hàng';
        try {
          if (!user) return;
          const storageKey = `user_notifications_${user.id}`;
          const stored = localStorage.getItem(storageKey);
          const customNotis = stored ? JSON.parse(stored) : [];
          const newNoti = {
            id: 'order_' + Date.now() + '_' + orderId,
            type: 'order' as const,
            title: 'Đặt đơn hàng mới thành công ✓',
            message: `Đơn hàng #${orderCode || orderId.slice(0, 8)} tại quán ${restName} đã được gửi đi. Đang chờ xác nhận!`,
            time: 'Vừa xong',
            isRead: false,
            createdAt: new Date().toISOString(),
            meta: { orderId, orderStatus: 'pending' }
          };
          customNotis.unshift(newNoti);
          localStorage.setItem(storageKey, JSON.stringify(customNotis));
        } catch (err) {
          console.error('Lỗi lưu thông báo đặt đơn hàng:', err);
        }
      });
      window.dispatchEvent(new Event('new_notification'));

      if (paymentMethod === 'VIETQR' && createdOrders[0]?.payosCheckoutUrl) {
        // Chuyển hướng đến trang thanh toán của PayOS
        window.location.href = createdOrders[0].payosCheckoutUrl;
      } else {
        // Hiển thị màn hình đặt hàng thành công
        setSuccessOrderData({
          orderId: createdOrders.map(o => o.id || o._id).join(','),
          orderCode: createdOrders.map(o => o.code || (o.id || o._id).slice(0, 8).toUpperCase()).join(', '),
          totalAmount: finalTotal,
          restaurantName: createdOrders.map(o => restaurantsMap[o.restaurantId]?.name || 'Cửa hàng').join(' & '),
          paymentMethod,
          itemCount: selectedItems.reduce((s, i) => s + i.quantity, 0),
          deliveryCode: createdOrders.map(o => o.deliveryCode).filter(Boolean).join(', '),
        });
        setScreen('success');
      }
    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err);
      showCustomAlert(err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng kiểm tra số dư ví/điểm.', 'Lỗi đặt hàng', 'error');
    } finally {
      setIsOrdering(false);
    }
  };

  // Stepper state definition for Tracking Screen
  const stages = [
    { label: 'Tiếp Nhận', desc: 'Chờ bưu cục duyệt' },
    { label: 'Xác Nhận', desc: 'Bếp đã nhận đơn' },
    { label: 'Chuẩn Bị', desc: 'Đầu bếp đang nấu' },
    { label: 'Đang Giao', desc: 'Anh Tư đang đi Cup 81' },
    { label: 'Hoàn Thành', desc: 'Giao hàng thành công' }
  ];
  
  const [currentStage, setCurrentStage] = useState(0);

  // Stepper dynamic progress bar simulation
  useEffect(() => {
    if (screen !== 'tracking') return;
    
    // Auto-advance stepper every 7 seconds
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [screen]);

  // Trigger notifications when stage changes
  useEffect(() => {
    if (screen !== 'tracking' || currentStage === 0) return;
    
    const getStageNotification = (stage: number) => {
      const restaurantName = restaurantInfo?.name || 'Cửa hàng';
      switch(stage) {
        case 1:
          return {
            title: 'Nhà hàng đã nhận đơn ✓',
            message: `Nhà hàng ${restaurantName} đã xác nhận đơn hàng của bạn.`
          };
        case 2:
          return {
            title: 'Đang chuẩn bị món 🍳',
            message: `Nhà hàng ${restaurantName} đang chuẩn bị các món ăn cho đơn hàng của bạn.`
          };
        case 3:
          return {
            title: 'Đơn hàng đang được giao 🏍️',
            message: `Bưu tá đang trên đường giao đơn hàng từ quán ${restaurantName} tới bạn. Dự kiến 15 phút nữa.`
          };
        case 4:
          return {
            title: 'Đơn hàng đã hoàn thành ✓',
            message: `Đơn hàng tại ${restaurantName} đã được giao thành công. Chúc bạn ngon miệng!`
          };
        default:
          return null;
      }
    };

    const notiData = getStageNotification(currentStage);
    if (notiData && user) {
      try {
        const storageKey = `user_notifications_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        const customNotis = stored ? JSON.parse(stored) : [];
        const newNoti = {
          id: `stage_${currentStage}_` + Date.now(),
          type: 'order' as const,
          title: notiData.title,
          message: notiData.message,
          time: 'Vừa xong',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        customNotis.unshift(newNoti);
        localStorage.setItem(storageKey, JSON.stringify(customNotis));
        window.dispatchEvent(new Event('new_notification'));
      } catch (err) {
        console.error('Lỗi khi cập nhật thông báo tiến trình đơn hàng:', err);
      }
    }
  }, [currentStage, screen, restaurantInfo, user]);

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      {/* CSS Injection for Shaking Emoji */}
      <style>{`
        @keyframes retro-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1.5px, -2px) rotate(-1deg); }
          20% { transform: translate(-2.5px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1.5px, -1.5px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-2.5px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1.5px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-retro-shake {
          animation: retro-shake 0.4s infinite;
        }
      `}</style>

      {/* Header */}
      <Header cartCount={totalItems} />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">

        {/* VIEW 0: SUCCESS SCREEN */}
        {screen === 'success' && successOrderData && (
          <div className="animate-fade-in">
            {/* CSS for animations */}
            <style>{`
              @keyframes bounce-in {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); }
                70% { transform: scale(0.95); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes confetti-fall {
                0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
              }
              @keyframes ring-pulse {
                0% { box-shadow: 0 0 0 0 rgba(45,122,79,0.4); }
                70% { box-shadow: 0 0 0 20px rgba(45,122,79,0); }
                100% { box-shadow: 0 0 0 0 rgba(45,122,79,0); }
              }
              @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards; }
              .animate-ring-pulse { animation: ring-pulse 1.5s ease-out infinite; }
              .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
              .animate-slide-up-1 { animation: slide-up 0.5s 0.1s ease-out both; }
              .animate-slide-up-2 { animation: slide-up 0.5s 0.2s ease-out both; }
              .animate-slide-up-3 { animation: slide-up 0.5s 0.3s ease-out both; }
              .animate-slide-up-4 { animation: slide-up 0.5s 0.4s ease-out both; }
              .confetti-dot {
                position: absolute;
                width: 8px; height: 8px;
                border-radius: 50%;
                animation: confetti-fall 2s ease-in infinite;
              }
            `}</style>

            <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">

              {/* ── HERO CARD ─────────────────────────────── */}
              <div className="relative bg-white border-2 border-neutral-900 shadow-retro overflow-hidden animate-slide-up">
                {/* Confetti dots */}
                {[
                  { left:'8%',  top:'12%', color:'#E9C46A', delay:'0s'   },
                  { left:'20%', top:'5%',  color:'#BF3A20', delay:'0.3s' },
                  { left:'50%', top:'8%',  color:'#2D7A4F', delay:'0.6s' },
                  { left:'75%', top:'4%',  color:'#E9C46A', delay:'0.9s' },
                  { left:'90%', top:'15%', color:'#BF3A20', delay:'0.2s' },
                  { left:'35%', top:'3%',  color:'#2563A8', delay:'0.5s' },
                ].map((d, i) => (
                  <div key={i} className="confetti-dot" style={{
                    left: d.left, top: d.top,
                    background: d.color,
                    animationDelay: d.delay,
                    animationDuration: `${1.8 + i * 0.3}s`
                  }} />
                ))}

                {/* Green hero area */}
                <div className="bg-gradient-to-br from-[#1a5c38] via-[#2D7A4F] to-[#3a9a63] px-8 pt-12 pb-16 text-center relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 50%)',
                    backgroundSize: '20px 20px'
                  }} />
                  {/* Decorative circles */}
                  <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border border-white/10" />
                  <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border border-white/10" />

                  {/* Animated checkmark */}
                  <div className="relative z-10">
                    <div className="animate-bounce-in inline-flex">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-5 animate-ring-pulse" style={{ boxShadow: '0 0 0 6px rgba(255,255,255,0.2)' }}>
                        <CheckCircle2 size={52} className="text-[#2D7A4F]" strokeWidth={2} />
                      </div>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">
                      Đặt Hàng Thành Công!
                    </h1>
                    <p className="text-green-100/90 text-sm font-medium">
                      Cảm ơn bạn đã tin tưởng GrabFood Mini 🙏
                    </p>

                    {/* Order code badge */}
                    <div className="inline-flex items-center gap-2 mt-4 bg-white/15 border border-white/30 px-4 py-2 text-white font-mono text-sm font-bold tracking-widest">
                      <span className="text-white/60 text-xs font-normal">MÃ ĐƠN</span>
                      #{successOrderData.orderCode}
                    </div>
                  </div>
                </div>

                {/* ── RECEIPT / TICKET BODY ──────────────── */}
                {/* Tear-line decoration */}
                <div className="relative h-0">
                  <div className="absolute left-0 right-0 flex items-center" style={{ top: '-14px' }}>
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-6 ${i % 2 === 0 ? 'bg-[#2D7A4F]' : 'bg-white'} rounded-full`} style={{ margin: '0 1px' }} />
                    ))}
                  </div>
                </div>

                <div className="px-6 pt-8 pb-2 space-y-5 animate-slide-up-1">

                  {/* Restaurant row */}
                  <div className="flex items-center gap-4 p-4 bg-[#FAFAF8] border border-neutral-200 rounded-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#BF3A20] to-[#D44B2F] flex items-center justify-center flex-shrink-0 shadow-retro-sm">
                      <ChefHat size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-0.5">Quán ăn</p>
                      <p className="font-bold text-neutral-900 text-base truncate">{successOrderData.restaurantName}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Số món</p>
                      <p className="font-mono font-bold text-neutral-900 text-lg">{successOrderData.itemCount}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Payment method */}
                    <div className="border-2 border-neutral-900 p-3.5 bg-[#FEFCF9] shadow-retro-sm text-center">
                      <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-2">Thanh toán</p>
                      <div className="flex items-center justify-center gap-1.5">
                        {successOrderData.paymentMethod === 'COD' && <DollarSign size={14} className="text-emerald-600" />}
                        {successOrderData.paymentMethod === 'WALLET' && <CreditCard size={14} className="text-blue-600" />}
                        {successOrderData.paymentMethod === 'POINTS' && <span className="text-amber-500 text-sm">★</span>}
                        {successOrderData.paymentMethod === 'VIETQR' && <span className="text-violet-600 text-xs font-bold">QR</span>}
                        <p className="font-bold text-neutral-900 text-xs">
                          {successOrderData.paymentMethod === 'COD' ? 'Tiền mặt' :
                           successOrderData.paymentMethod === 'WALLET' ? 'Ví SaiGon' :
                           successOrderData.paymentMethod === 'POINTS' ? 'Điểm' : 'VietQR'}
                        </p>
                      </div>
                    </div>

                    {/* Estimated time */}
                    <div className="border-2 border-neutral-900 p-3.5 bg-[#FEFCF9] shadow-retro-sm text-center">
                      <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-2">Dự kiến</p>
                      <p className="font-bold text-neutral-900 text-xs">25 – 35 phút</p>
                    </div>

                    {/* Status */}
                    <div className="border-2 border-[#2D7A4F] p-3.5 bg-[#E8F5E9] shadow-retro-sm text-center">
                      <p className="text-[9px] font-mono text-[#2D7A4F] uppercase tracking-widest mb-2">Trạng thái</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A4F] animate-pulse" />
                        <p className="font-bold text-[#2D7A4F] text-xs">Đã gửi</p>
                      </div>
                    </div>
                  </div>

                  {successOrderData.deliveryCode && (
                    <div className="border-2 border-[#2D7A4F] p-3 bg-[#E8F5E9] shadow-retro-sm text-center">
                      <p className="text-[10px] font-mono text-[#2D7A4F] uppercase tracking-widest mb-1 font-bold">Mã nhận hàng (Đưa cho bưu tá)</p>
                      <p className="font-mono font-black text-[#2D7A4F] text-2xl tracking-widest">{successOrderData.deliveryCode}</p>
                    </div>
                  )}

                  {/* Dashed divider */}
                  <div className="border-t-2 border-dashed border-neutral-200" />

                  {/* Total amount */}
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-xs text-neutral-500 font-mono uppercase tracking-wide">Tổng thanh toán</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Đã bao gồm phí giao hàng & thuế</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-mono font-bold text-[#BF3A20] leading-none">
                        {successOrderData.totalAmount.toLocaleString('vi-VN')}
                      </p>
                      <p className="text-sm font-mono text-neutral-600 mt-0.5">đồng</p>
                    </div>
                  </div>

                  {/* Dashed divider */}
                  <div className="border-t-2 border-dashed border-neutral-200" />
                </div>

                {/* ── DELIVERY TIMELINE ────────────────── */}
                <div className="px-6 pb-2 animate-slide-up-2">
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-4">Hành trình đơn hàng</p>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-neutral-200" />
                    {/* Active line (first step done) */}
                    <div className="absolute left-[18px] top-5 w-0.5 bg-[#2D7A4F]" style={{ height: '4px' }} />

                    <div className="space-y-4">
                      {[
                        { icon: '📝', label: 'Đã đặt hàng',     sub: 'Đơn hàng đang chờ quán xác nhận', done: true  },
                        { icon: '✅', label: 'Quán xác nhận',   sub: 'Bếp sẽ bắt đầu chuẩn bị ngay',   done: false },
                        { icon: '👨‍🍳', label: 'Đang nấu',       sub: 'Đầu bếp đang chế biến món',       done: false },
                        { icon: '🛵', label: 'Shipper lấy hàng', sub: 'Tài xế đang trên đường đến',     done: false },
                        { icon: '🎉', label: 'Giao thành công', sub: 'Hàng đã được giao đến tay bạn',   done: false },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-base transition-all ${
                            step.done
                              ? 'bg-[#2D7A4F] border-[#2D7A4F] shadow-retro-sm'
                              : 'bg-white border-neutral-300'
                          }`}>
                            {step.done
                              ? <CheckCircle2 size={16} className="text-white" strokeWidth={2.5} />
                              : <span className="text-[13px]">{step.icon}</span>}
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className={`text-sm font-bold ${step.done ? 'text-[#2D7A4F]' : 'text-neutral-500'}`}>
                              {step.label}
                              {step.done && <span className="ml-2 text-[10px] font-mono bg-[#2D7A4F]/10 text-[#2D7A4F] px-1.5 py-0.5 rounded">XONG</span>}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── INFO BANNER ─────────────────────── */}
                <div className="mx-6 mb-4 mt-5 animate-slide-up-3">
                  <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={13} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-800 mb-0.5">Thông báo quan trọng</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Đơn hàng đang được xử lý. Chúng tôi sẽ thông báo ngay khi quán xác nhận.
                        {successOrderData.paymentMethod === 'COD' && ' Hãy chuẩn bị tiền mặt khi nhận hàng.'}
                        {successOrderData.paymentMethod === 'WALLET' && ' Số dư ví đã được khấu trừ thành công.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── ACTION BUTTONS ────────────────── */}
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up-4">
                  <button
                    onClick={() => navigate(`/profile?tab=orders&orderId=${successOrderData.orderId}`)}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#BF3A20] text-white border-2 border-neutral-900 font-mono font-bold uppercase text-xs shadow-retro hover:bg-[#D44B2F] hover:shadow-retro-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  >
                    <ClipboardList size={15} /> Xem Chi Tiết Đơn Hàng
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#FEFCF9] text-neutral-700 border-2 border-neutral-900 font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#FAF7F3] hover:shadow-retro active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  >
                    <Home size={15} /> Về Trang Chủ
                  </button>
                </div>

                {/* Footer note */}
                <div className="border-t-2 border-dashed border-neutral-200 mx-6 mb-5 pt-4">
                  <p className="text-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    GrabFood Mini • {new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* VIEW 1: CHECKOUT SCREEN */}
        {screen === 'checkout' && (
          <div>
            {/* Title: Lora Bold */}
            <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8 border-b-2 border-neutral-900 pb-2 uppercase tracking-wide">
              Thanh Toán Đơn Hàng
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side (8/12): Delivery Info & Payment Selector */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Address Section */}
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-sm border-2 border-neutral-900">
                  <div className="flex items-center justify-between gap-2 mb-4 border-b border-dashed border-neutral-200 pb-2 select-none">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-[#BF3A20]" size={18} strokeWidth={1.5} />
                      <h2 className="font-mono font-bold text-xs uppercase tracking-widest text-neutral-800">
                        Địa chỉ nhận hàng
                      </h2>
                    </div>
                  </div>

                  {/* Address List */}
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <div className="border-2 border-dashed border-neutral-300 p-4 text-center text-xs font-mono text-neutral-500 bg-white">
                        📍 Chưa có địa chỉ nhận hàng nào. Vui lòng thêm địa chỉ nhận hàng dưới đây.
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <label 
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`flex items-start gap-3 p-3.5 border-2 rounded-md cursor-pointer select-none transition-all ${
                            selectedAddress?.id === addr.id
                              ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10'
                              : 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address_select"
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => setSelectedAddress(addr)}
                            className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 mt-0.5 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-[#FAF0D2] border border-[#C98F0A]/30 text-[9px] font-bold font-mono px-2 py-0.5 text-neutral-800 rounded-sm uppercase tracking-wide">
                                {addr.title}
                              </span>
                            </div>
                            <p className="text-sm font-semibold font-body text-neutral-800 break-words">{addr.detail}</p>
                            <p className="text-[10px] font-mono text-neutral-500 mt-1">
                              Người nhận: <span className="font-bold text-neutral-700">{addr.recipientName}</span> — SĐT: <span className="font-bold text-neutral-700">{addr.recipientPhone}</span>
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {/* New Address Inline Form */}
                  {showAddForm ? (
                    <form onSubmit={handleAddAddress} className="mt-4 p-4 border-2 border-dashed border-neutral-900 bg-[#FAF7F3] space-y-3">
                      <p className="text-xs font-mono font-bold uppercase text-neutral-700 border-b border-dashed border-neutral-200 pb-1">➕ Thêm Địa Chỉ Nhận Hàng Mới</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono font-black uppercase text-neutral-500 mb-1">Tên nhãn địa chỉ</label>
                          <select
                            value={newTitleType}
                            onChange={(e) => {
                              setNewTitleType(e.target.value);
                              if (e.target.value !== 'Khác') {
                                setNewTitle(e.target.value);
                              } else {
                                setNewTitle('');
                              }
                            }}
                            className="w-full bg-white border-2 border-neutral-900 focus:border-neutral-900 rounded px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none font-body cursor-pointer font-bold"
                          >
                            <option value="Nhà riêng">🏠 Nhà riêng</option>
                            <option value="Văn phòng">🏢 Văn phòng</option>
                            <option value="Trường học">🏫 Trường học</option>
                            <option value="Khác">✏️ Khác...</option>
                          </select>
                          
                          {newTitleType === 'Khác' && (
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="Nhập nhãn tùy chỉnh..."
                              className="mt-2 w-full bg-white border-2 border-neutral-900 focus:border-neutral-900 rounded px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none font-body"
                              required
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono font-black uppercase text-neutral-500 mb-1">Họ và tên người nhận</label>
                          <input
                            type="text"
                            value={newRecipient}
                            onChange={(e) => setNewRecipient(e.target.value)}
                            placeholder="Tên người nhận..."
                            className="w-full bg-white border-2 border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none font-body"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono font-black uppercase text-neutral-500 mb-1">Số điện thoại</label>
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Số điện thoại liên lạc..."
                            className="w-full bg-white border-2 border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none font-body"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono font-black uppercase text-neutral-500 mb-1">Địa chỉ chi tiết</label>
                          <input
                            type="text"
                            value={newDetail}
                            onChange={(e) => setNewDetail(e.target.value)}
                            placeholder="Số nhà, tên đường, phường/xã, quận..."
                            className="w-full bg-white border-2 border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none font-body"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-neutral-200">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-3 py-1.5 text-[10px] font-mono font-bold text-neutral-500 hover:underline cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-mono text-[10px] font-bold uppercase py-1.5 px-4 border-2 border-neutral-900 shadow-retro-sm cursor-pointer active:translate-y-0.5"
                        >
                          Lưu địa chỉ
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitleType('Nhà riêng');
                        setNewTitle('Nhà riêng');
                        setNewRecipient(user?.name || '');
                        setNewPhone((user as any)?.phone || '');
                        setNewDetail('');
                        setShowAddForm(true);
                      }}
                      className="mt-3 w-full bg-transparent hover:bg-neutral-50 border-2 border-dashed border-neutral-400 hover:border-neutral-900 font-mono font-bold text-xs uppercase tracking-wider py-2 text-center cursor-pointer transition-colors"
                    >
                      ➕ Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {/* 2. Payment Selector */}
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-sm border-2 border-neutral-900">
                  <div className="flex items-center gap-2 mb-4 border-b border-dashed border-neutral-200 pb-2">
                    <CreditCard className="text-[#BF3A20]" size={18} strokeWidth={1.5} />
                    <h2 className="font-mono font-bold text-xs uppercase tracking-widest text-neutral-800">
                      Phương thức thanh toán
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Method COD */}
                    <label 
                      onClick={() => {
                        if (!activePaymentMethods.COD) return;
                        setPaymentMethod('COD');
                      }}
                      title={!activePaymentMethods.COD ? "Phương thức thanh toán này hiện không hỗ trợ" : undefined}
                      className={`flex items-center justify-between p-4 border-2 rounded-md select-none transition-all ${
                        !activePaymentMethods.COD
                          ? 'border-neutral-200 bg-neutral-100 opacity-40 cursor-not-allowed'
                          : paymentMethod === 'COD'
                            ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10 cursor-pointer'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'COD'}
                          disabled={!activePaymentMethods.COD}
                          onChange={() => {
                            if (!activePaymentMethods.COD) return;
                            setPaymentMethod('COD');
                          }}
                          className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold font-body text-neutral-800">Tiền mặt (COD)</p>
                            {!activePaymentMethods.COD && (
                              <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                TẠM THỜI KHÔNG HỖ TRỢ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {!activePaymentMethods.COD ? "Tạm thời không hỗ trợ..." : "Trả khi nhận món"}
                          </p>
                        </div>
                      </div>
                      <DollarSign size={20} strokeWidth={1.5} className="text-neutral-500" />
                    </label>

                    {/* Method Internal Wallet */}
                    <label 
                      onClick={() => {
                        if (!activePaymentMethods.WALLET) return;
                        setPaymentMethod('WALLET');
                      }}
                      title={!activePaymentMethods.WALLET ? "Phương thức thanh toán này hiện không hỗ trợ" : undefined}
                      className={`flex items-center justify-between p-4 border-2 rounded-md select-none transition-all ${
                        !activePaymentMethods.WALLET
                          ? 'border-neutral-200 bg-neutral-100 opacity-40 cursor-not-allowed'
                          : paymentMethod === 'WALLET'
                            ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10 cursor-pointer'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'WALLET'}
                          disabled={!activePaymentMethods.WALLET}
                          onChange={() => {
                            if (!activePaymentMethods.WALLET) return;
                            setPaymentMethod('WALLET');
                          }}
                          className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold font-body text-neutral-800">Ví Saigon-Pay</p>
                            {!activePaymentMethods.WALLET && (
                              <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                KHÔNG HỖ TRỢ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {!activePaymentMethods.WALLET ? "Tạm thời không hỗ trợ..." : `Số dư: ${walletBalance !== null ? walletBalance.toLocaleString('vi-VN') + 'đ' : 'Đang tải...'}`}
                          </p>
                        </div>
                      </div>
                      <CreditCard size={20} strokeWidth={1.5} className="text-neutral-500" />
                    </label>

                    {/* Method Points Wallet */}
                    <label 
                      onClick={() => {
                        if (!activePaymentMethods.POINTS) return;
                        const pointsNeeded = Math.ceil(finalTotal / 1000);
                        const userPoints = user?.points || 0;
                        if (userPoints < pointsNeeded) {
                          showCustomAlert(`Bạn không đủ điểm tích lũy để thanh toán đơn hàng này (cần ${pointsNeeded} điểm, hiện có ${userPoints} điểm).`, 'Không đủ điểm tích lũy', 'warning');
                          return;
                        }
                        setPaymentMethod('POINTS');
                      }}
                      title={!activePaymentMethods.POINTS ? "Phương thức thanh toán này hiện không hỗ trợ" : undefined}
                      className={`flex items-center justify-between p-4 border-2 rounded-md select-none transition-all ${
                        !activePaymentMethods.POINTS
                          ? 'border-neutral-200 bg-neutral-100 opacity-40 cursor-not-allowed'
                          : paymentMethod === 'POINTS'
                            ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10 cursor-pointer'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer'
                      } ${((user?.points || 0) < Math.ceil(finalTotal / 1000) && activePaymentMethods.POINTS) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'POINTS'}
                          disabled={!activePaymentMethods.POINTS || (user?.points || 0) < Math.ceil(finalTotal / 1000)}
                          onChange={() => {
                            if (!activePaymentMethods.POINTS) return;
                            setPaymentMethod('POINTS');
                          }}
                          className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold font-body text-neutral-800">Điểm Tích Lũy</p>
                            {!activePaymentMethods.POINTS && (
                              <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                TẠM THỜI KHÔNG HỖ TRỢ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {!activePaymentMethods.POINTS
                              ? "Tạm thời không hỗ trợ..."
                              : `Số dư: ${user?.points || 0} điểm (cần ${Math.ceil(finalTotal / 1000)}đ)`
                            }
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-amber-600 font-mono">🪙</span>
                    </label>

                    {/* Method VIETQR */}
                    <label 
                      onClick={() => {
                        if (!activePaymentMethods.VIETQR) return;
                        setPaymentMethod('VIETQR');
                      }}
                      title={!activePaymentMethods.VIETQR ? "Phương thức thanh toán này hiện không hỗ trợ" : undefined}
                      className={`flex items-center justify-between p-4 border-2 rounded-md select-none transition-all ${
                        !activePaymentMethods.VIETQR
                          ? 'border-neutral-200 bg-neutral-100 opacity-40 cursor-not-allowed'
                          : paymentMethod === 'VIETQR'
                            ? 'border-neutral-900 bg-[#FAF7F3] ring-1 ring-neutral-900/10 cursor-pointer'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'VIETQR'}
                          disabled={!activePaymentMethods.VIETQR}
                          onChange={() => {
                            if (!activePaymentMethods.VIETQR) return;
                            setPaymentMethod('VIETQR');
                          }}
                          className="w-4 h-4 accent-[#BF3A20] border-2 border-neutral-900 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold font-body text-neutral-800">VietQR</p>
                            {!activePaymentMethods.VIETQR && (
                              <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                TẠM THỜI KHÔNG HỖ TRỢ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {!activePaymentMethods.VIETQR ? "Tạm thời không hỗ trợ..." : "Chuyển khoản VietQR"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-blue-600 font-mono">QR</span>
                    </label>
                  </div>
                </div>

                {/* 3. Coupon Input */}
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-sm border-2 border-neutral-900">
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 select-none">
                      Mã giảm giá bưu điện (Coupon)
                    </label>
                    <div className="flex border-2 border-neutral-900 bg-white max-w-md">
                      <input
                        type="text"
                        placeholder="Nhập mã coupon..."
                        className="w-full bg-transparent px-3 py-2 text-xs text-neutral-900 uppercase font-mono placeholder:text-neutral-400 focus:outline-none"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={appliedCode !== ''}
                      />
                      <button
                        type="submit"
                        className="bg-white text-[#BF3A20] font-body font-bold text-xs uppercase px-5 border-l-2 border-neutral-900 hover:bg-[#BF3A20]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={appliedCode !== ''}
                      >
                        ÁP DỤNG
                      </button>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="flex items-center justify-center gap-2 border-2 border-dashed border-[#BF3A20] text-[#BF3A20] bg-[#BF3A20]/5 hover:bg-[#BF3A20]/10 font-mono text-xs py-2 px-4 font-bold transition-all rounded-sm cursor-pointer"
                      >
                        <Ticket size={14} />
                        {appliedCode ? 'Thay đổi voucher' : 'Chọn từ ví Voucher'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] font-mono font-bold text-[#BF3A20] flex items-center gap-0.5 mt-1">
                        <AlertTriangle size={11} /> {couponError}
                      </p>
                    )}
                    {appliedCode && (
                      <div className="flex items-center justify-between max-w-md mt-1">
                        <p className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                          ✓ Đã áp dụng mã thư tín {appliedCode} (-{discountAmount.toLocaleString('vi-VN')}đ)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCode('');
                            setDiscountAmount(0);
                          }}
                          className="text-[10px] font-mono font-bold text-[#BF3A20] hover:underline"
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    )}
                    
                    {/* Dynamic vouchers list */}
                    {vouchersLoading ? (
                      <p className="text-[10px] font-mono text-neutral-400 italic">Đang tải mã giảm giá...</p>
                    ) : vouchers.length > 0 ? (
                      <div className="pt-2">
                        <p className="text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Mã giảm giá khả dụng:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                          {vouchers.map((v: any) => {
                            const isApplicable = getVoucherApplicability(v).applicable;
                            return (
                              <div 
                                key={v.id}
                                onClick={() => isApplicable && !appliedCode && applyVoucherObj(v)}
                                className={`p-2 border-2 rounded-md select-none transition-all flex flex-col justify-between cursor-pointer ${
                                  appliedCode === v.code
                                    ? 'border-neutral-900 bg-[#FAF7F3]'
                                    : isApplicable && !appliedCode
                                    ? 'border-dashed border-neutral-400 hover:border-neutral-900 hover:bg-neutral-50'
                                    : 'border-dashed border-neutral-200 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="bg-[#FAF0D2] border border-[#C98F0A]/30 text-[9px] font-bold font-mono px-1.5 py-0.5 text-neutral-800 rounded-sm uppercase">
                                    {v.code}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-[#BF3A20]">
                                    {v.discountType === 'fixed_amount' 
                                      ? `-${Number(v.discountValue).toLocaleString('vi-VN')}đ`
                                      : `-${v.discountValue}%`}
                                  </span>
                                </div>
                                <p className="text-[9.5px] font-body text-neutral-500">
                                  Đơn hàng tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] font-mono text-neutral-400 italic">Không có mã giảm giá nào khác khả dụng.</p>
                    )}

                    <p className="text-[9px] font-mono text-neutral-400 italic pt-1">
                      * Nhập mã giảm giá "SAIGON90S" để được giảm 15.000đ cước vận chuyển.
                    </p>
                  </form>
                </div>

              </div>

              {/* Right Side (4/12): Mini Order Bill Summary */}
              <div className="lg:col-span-4">
                <div className="card-retro bg-[#FEFCF9] p-6 shadow-saigon-card border-2 border-neutral-900 relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>
                  
                  <h2 className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest border-b border-dashed border-neutral-200 pb-1.5 mb-4 select-none">
                    Hóa đơn mua món
                  </h2>

                  {/* Checkout items list */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-4">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-xs border-b border-neutral-100 pb-2">
                        <div>
                          <p className="font-semibold text-neutral-900 font-body">
                            {item.quantity}x {item.name}
                          </p>
                          {item.toppings && item.toppings.length > 0 && (
                            <p className="text-[9px] text-[#9E6E4A] font-semibold mt-0.5">
                              + Topping: {item.toppings.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-neutral-700">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations details */}
                  <div className="space-y-2.5 font-mono text-[11px] text-neutral-600 border-t border-dashed border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span>Tạm tính món ăn:</span>
                      <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 italic">
                      <span>Phí nền tảng (Cửa hàng chịu):</span>
                      <span>-{platformFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span>+{deliveryFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Mã giảm giá:</span>
                        <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    
                    {/* Final Payment Total */}
                    <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-3 text-xs font-black">
                      <span className="text-neutral-700 uppercase select-none">Tổng cước:</span>
                      <span className="text-base text-[#BF3A20]">
                        {finalTotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA Button with loading simulation */}
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isOrdering || subtotal < feeConfigs.minOrderAmount}
                    className="w-full bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-body font-semibold text-xs py-3.5 px-6 uppercase tracking-widest border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all duration-150 cursor-pointer text-center mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOrdering ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Đang ký gửi bưu điện...
                      </>
                    ) : (
                      'XÁC NHẬN ĐẶT HÀNG'
                    )}
                  </button>

                  {/* Warning if below minimum order amount */}
                  {subtotal < feeConfigs.minOrderAmount && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-[#BF3A20] font-mono text-[10px] space-y-1">
                      <p className="font-bold uppercase flex items-center gap-1">
                        <AlertTriangle size={12} /> ĐƠN HÀNG CHƯA ĐẠT TỐI THIỂU
                      </p>
                      <p>Giá trị tối thiểu: {feeConfigs.minOrderAmount.toLocaleString('vi-VN')}đ. Vui lòng chọn thêm món ăn.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: ORDER TRACKING SCREEN */}
        {screen === 'tracking' && (
          <div className="max-w-3xl mx-auto">
            {/* Title: Lora Bold */}
            <h1 className="text-3xl font-heading font-bold text-[#2C1A0E] text-center mb-2 uppercase tracking-wide">
              Bếp đang chuẩn bị món cho bạn...
            </h1>
            <p className="text-center text-xs text-neutral-400 font-mono mb-8">
              Mã bưu gửi đơn hàng: <span className="font-bold">#GRB-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </p>

            <div className="space-y-8">
              
              {/* Stepper Horizontal Progress Bar */}
              <div className="card-retro bg-[#FEFCF9] p-6 shadow-sm border-2 border-neutral-900 relative">
                <div className="relative flex items-center justify-between gap-2 md:gap-4 pt-2">
                  {/* Progress Line */}
                  <div className="absolute top-[18px] left-0 w-full h-[3px] bg-neutral-200 -translate-y-1/2 z-0"></div>
                  
                  {/* Dynamic Active Line */}
                  <div 
                    className="absolute top-[18px] left-0 h-[3px] bg-[#BF3A20] -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
                  ></div>

                  {stages.map((stage, index) => {
                    const isCompleted = index <= currentStage;
                    const isCurrent = index === currentStage;

                    return (
                      <div key={stage.label} className="flex flex-col items-center z-10 flex-1 relative">
                        {/* Step Circle */}
                        <div
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-[#BF3A20] border-neutral-900 text-white scale-110 shadow-retro-sm'
                              : isCompleted
                              ? 'bg-[#BF3A20] border-neutral-900 text-white'
                              : 'bg-white border-[#D0B89A] text-[#D0B89A]'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {/* Step Label */}
                        <span
                          className={`text-[9px] md:text-[10px] font-bold mt-2 uppercase text-center tracking-wider max-w-[75px] ${
                            isCompleted ? 'text-neutral-900' : 'text-[#D0B89A]'
                          }`}
                        >
                          {stage.label}
                        </span>
                        {/* Step Description */}
                        <span className="text-[7.5px] text-neutral-400 hidden md:block text-center mt-0.5 leading-tight">
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shaking 🛵 Emoji and Delivery Details */}
              <div className="card-retro bg-[#FEFCF9] p-8 shadow-saigon-card border-2 border-neutral-900 flex flex-col items-center justify-center gap-6 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-grid-pattern opacity-5 pointer-events-none"></div>

                {/* Animated shake motor box */}
                <div className="p-6 bg-[#FAF7F3] border border-dashed border-neutral-300 rounded-lg w-full max-w-md flex flex-col items-center justify-center text-center shadow-inner select-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[2%] pointer-events-none"></div>
                  
                  {/* Moving 🛵 Emoji with Shake animation */}
                  <span className="text-7xl animate-retro-shake inline-block" role="img" aria-label="delivering scooter">
                    🛵
                  </span>

                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest">Thời gian dự kiến</p>
                    <p className="text-2xl font-mono font-black text-[#BF3A20]">25 - 35 phút</p>
                    <p className="text-[10px] text-neutral-400 font-body">Shipper của bạn đang chuẩn bị lăn bánh cút kít</p>
                  </div>
                </div>

                {/* Shipper Details (Saigon style) */}
                <div className="w-full max-w-md grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Người đưa thư tín</span>
                    <span className="font-bold text-neutral-800 text-sm">Anh Tư Xe Lôi</span>
                    <span className="text-[10px] text-neutral-400 block font-body">SĐT: 0909.888.777</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Ngựa sắt di chuyển</span>
                    <span className="font-bold text-[#BF3A20] text-sm">Honda Cub 81</span>
                    <span className="text-[10px] text-neutral-400 block">Biển số: 52-F4 9090</span>
                  </div>
                </div>
              </div>

              {/* Navigation Back Home */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="bg-transparent hover:bg-neutral-100 text-neutral-800 font-body font-bold text-xs uppercase tracking-widest py-3 px-6 border-2 border-neutral-900 shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Quay lại trang chủ đặt thêm
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal xác nhận đặt hàng */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
            <div className="card-retro bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <h2 className="text-xl font-heading font-black text-[#BF3A20] text-center mb-4 uppercase tracking-wide border-b-2 border-neutral-900 pb-2">
                ❀ Xác Nhận Gửi Bưu Phẩm ❀
              </h2>
              
              <p className="text-xs text-neutral-500 font-body mb-4 text-center">
                Vui lòng rà soát lại thông tin ký gửi đơn hàng của bạn trước khi chúng tôi xuất kho.
              </p>

              <div className="space-y-4 text-xs font-body mb-6">
                {/* Address detail */}
                <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Địa chỉ giao hàng</span>
                  <p className="font-semibold text-neutral-800">{deliveryAddress.detail}</p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">SĐT: {deliveryAddress.recipientPhone} ({deliveryAddress.recipientName})</p>
                </div>

                {/* Payment details */}
                <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1">Hình thức thanh toán</span>
                    <p className="font-semibold text-neutral-800">
                      {paymentMethod === 'COD' && 'Tiền mặt (COD)'}
                      {paymentMethod === 'WALLET' && 'Ví Saigon-Pay'}
                      {paymentMethod === 'POINTS' && 'Điểm Tích Lũy'}
                    </p>
                  </div>
                  <span className="text-lg">
                    {paymentMethod === 'COD' && '💵'}
                    {paymentMethod === 'WALLET' && '💳'}
                    {paymentMethod === 'POINTS' && '🪙'}
                  </span>
                </div>

                {/* Items summary */}
                <div className="p-3 bg-[#FAF7F3] border border-neutral-200 rounded-md">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase mb-1.5">Tóm tắt món đặt ({selectedItems.length} món)</span>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                    {checkoutItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-[11px]">
                        <span className="text-neutral-700 font-semibold">{item.quantity}x {item.name}</span>
                        <span className="font-mono font-bold text-neutral-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total payment */}
                <div className="flex justify-between items-center border-t border-dashed border-neutral-300 pt-3 font-mono font-black text-sm">
                  <span className="text-neutral-700 uppercase">TỔNG CƯỚC THANH TOÁN:</span>
                  <span className="text-base text-[#BF3A20]">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="py-2.5 px-4 font-body font-bold text-xs uppercase border-2 border-neutral-900 shadow-retro-sm bg-white hover:bg-neutral-50 active:translate-y-[1px] active:shadow-none text-center cursor-pointer transition-all"
                >
                  Quay lại
                </button>
                
                <button
                  onClick={submitOrder}
                  className="py-2.5 px-4 font-body font-bold text-xs uppercase border-2 border-neutral-900 shadow-retro bg-[#BF3A20] hover:bg-[#D44B2F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm text-white text-center cursor-pointer transition-all"
                >
                  Xác nhận đặt
                </button>
              </div>
            </div>
          </div>
        )}
        {/* VIEW 3: PAYMENT SIMULATION SCREEN */}
        {screen === 'payment-simulation' && simulationData && (
          <div className="max-w-md mx-auto my-8">
            {simulationData.type === 'VIETQR' ? (
              <div className="card-retro bg-[#FEFCF9] p-6 shadow-saigon-card border-2 border-neutral-900 flex flex-col items-center gap-6 relative">
                <div className="w-full border-b-2 border-neutral-900 pb-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-red-650 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded animate-pulse">
                    CHẾ ĐỘ GIẢ LẬP THANH TOÁN
                  </span>
                  <h1 className="text-xl font-heading font-black text-neutral-800 uppercase mt-2 select-none">
                    Cổng Thanh Toán VietQR
                  </h1>
                </div>

                {/* VietQR Image */}
                <div className="text-center font-mono font-bold text-[#BF3A20] text-sm mb-1 mt-2">
                  Mã QR sẽ hết hạn sau: {formatTime(qrCountdown)}
                </div>
                <div className="p-3 bg-white border-2 border-neutral-900 shadow-retro-sm">
                  <img 
                    src={`https://img.vietqr.io/image/bidv-5901160005-compact.png?amount=${simulationData.amount}&addInfo=Gfood%20${simulationData.code}&accountName=DUONG%20THE%20VINH`}
                    alt="Mã QR Thanh Toán"
                    className="w-64 h-64 object-contain"
                  />
                </div>

                <div className="text-center font-mono text-[10px] text-neutral-450 leading-relaxed">
                  Quét mã QR bằng ứng dụng ngân hàng để điền thông tin tự động, hoặc chuyển khoản tay theo thông tin dưới đây:
                </div>

                {/* Bank Details Table */}
                <div className="w-full bg-[#FAF7F3] border-2 border-neutral-900 p-4 font-body text-xs space-y-2">
                  <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1.5">
                    <span className="text-neutral-500 font-mono uppercase text-[9px]">Ngân hàng:</span>
                    <span className="font-bold text-neutral-800">BIDV (Đầu Tư & Phát Triển VN)</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1.5">
                    <span className="text-neutral-500 font-mono uppercase text-[9px]">Số tài khoản:</span>
                    <span className="font-bold text-neutral-800">5901160005</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1.5">
                    <span className="text-neutral-500 font-mono uppercase text-[9px]">Chủ tài khoản:</span>
                    <span className="font-bold text-neutral-800">DƯƠNG THẾ VINH</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-300 pb-1.5">
                    <span className="text-neutral-500 font-mono uppercase text-[9px]">Số tiền:</span>
                    <span className="font-bold text-[#BF3A20] text-sm">
                      {simulationData.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-neutral-500 font-mono uppercase text-[9px]">Nội dung CK:</span>
                    <span className="font-bold text-neutral-800 bg-amber-50 px-1 border border-amber-200">
                      Gfood {simulationData.code}
                    </span>
                  </div>
                </div>

                {/* Confirm / Simulated Webhook Button */}
                <button
                  onClick={async () => {
                    try {
                      setIsOrdering(true);
                      const res = await api.post('/payments/mock-success', {
                        orderId: simulationData.orderId,
                      });
                      if (res && (res as any).success) {
                        clearSelected();
                        showCustomAlert('Thanh toán thành công (Giả lập)!', 'Thành công', 'info');
                        setSuccessOrderData({
                          orderId: simulationData.orderId || '',
                          orderCode: (simulationData.orderId || '').slice(0, 8).toUpperCase(),
                          totalAmount: simulationData.amount,
                          restaurantName: restaurantInfo?.name || 'Cửa hàng',
                          paymentMethod: 'VIETQR',
                          itemCount: selectedItems.reduce((s, i) => s + i.quantity, 0),
                          deliveryCode: (res as any).data?.deliveryCode,
                        });
                        setScreen('success');
                      } else {
                        showCustomAlert('Không thể xác nhận thanh toán giả lập.', 'Lỗi', 'error');
                      }
                    } catch (err: any) {
                      console.error('Lỗi xác nhận thanh toán giả lập:', err);
                      showCustomAlert(err.message || 'Lỗi xác nhận thanh toán.', 'Lỗi', 'error');
                    } finally {
                      setIsOrdering(false);
                    }
                  }}
                  disabled={isOrdering}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-mono font-bold text-xs py-3.5 px-6 uppercase tracking-wider border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isOrdering ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN ĐÃ CHUYỂN KHOẢN (GIẢ LẬP)'}
                </button>

                <button
                  onClick={() => {
                    showCustomAlert('Hủy thanh toán đơn hàng.', 'Hủy', 'info');
                    setScreen('checkout');
                  }}
                  disabled={isOrdering}
                  className="w-full bg-white hover:bg-neutral-50 text-neutral-600 font-mono text-[10px] py-2 px-6 border-2 border-neutral-250 cursor-pointer"
                >
                  Quay lại trang đặt hàng
                </button>
              </div>
            ) : (
              <div className="card-retro bg-[#FEFCF9] p-6 shadow-saigon-card border-2 border-neutral-900 flex flex-col items-center gap-6 relative">
                {/* SAIGON-PAY SIMULATOR CONTENT */}
                <div className="w-full border-b-2 border-neutral-900 pb-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-primary-650 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded">
                    CỔNG GIAO DỊCH VÍ SAIGON-PAY
                  </span>
                  <h1 className="text-xl font-heading font-black text-neutral-800 uppercase mt-2 select-none">
                    Ví Điện Tử Saigon-Pay
                  </h1>
                </div>

                {/* Balance display */}
                <div className="w-full grid grid-cols-2 gap-4 text-center font-mono text-[10px]">
                  <div className="p-3 bg-[#FAF7F3] border-2 border-neutral-900 shadow-retro-sm">
                    <p className="text-neutral-450 uppercase font-bold">Số dư ví khả dụng</p>
                    <p className="text-xs font-black text-neutral-800 mt-1">
                      {walletBalance !== null ? `${walletBalance.toLocaleString('vi-VN')} đ` : 'Đang tải...'}
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF7F3] border-2 border-neutral-900 shadow-retro-sm">
                    <p className="text-neutral-450 uppercase font-bold">Cước thanh toán</p>
                    <p className="text-xs font-black text-[#BF3A20] mt-1">
                      {simulationData.amount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>

                {/* PIN Input field */}
                <div className="w-full space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 select-none">
                    Nhập mã PIN ví (Mặc định: 123456)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="******"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-[#FEFCF9] border-2 border-neutral-900 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#BF3A20]/20"
                  />
                  {walletBalance !== null && walletBalance < simulationData.amount && (
                    <p className="text-[9px] font-mono font-bold text-[#BF3A20] text-center uppercase tracking-wide">
                      ⚠️ Số dư ví không đủ để thanh toán đơn hàng này!
                    </p>
                  )}
                </div>

                {/* Pay button */}
                <button
                  onClick={async () => {
                    if (walletBalance !== null && walletBalance < simulationData.amount) {
                      showCustomAlert('Số dư tài khoản ví không đủ để thực hiện giao dịch này.', 'Không đủ số dư', 'warning');
                      return;
                    }
                    if (pin !== '123456') {
                      showCustomAlert('Mã PIN ví không đúng! Vui lòng kiểm tra lại. (Mã PIN mặc định là 123456)', 'Sai mã PIN', 'error');
                      return;
                    }

                    try {
                      setIsOrdering(true);
                      const createdOrders: any[] = [];
                      const isArray = Array.isArray(simulationData.orderData);
                      const ordersToSubmit = isArray ? simulationData.orderData : [simulationData.orderData];

                      for (const singleOrderData of ordersToSubmit) {
                        const res = await orderApi.createOrder(singleOrderData);
                        if (res && res.success) {
                          createdOrders.push(res.data);
                        } else {
                          throw new Error(res?.message || 'Không thể hoàn tất thanh toán qua ví.');
                        }
                      }

                      clearSelected();
                      if (refetchMe) {
                        await refetchMe();
                      }
                      await fetchWalletBalance(); // Cập nhật lại số dư ví cục bộ
                      
                      // Add to local notifications list for each order
                      createdOrders.forEach(order => {
                        const orderId = order.id || order._id || '';
                        const orderCode = order.code || '';
                        const restName = restaurantsMap[order.restaurantId]?.name || 'Cửa hàng';
                        try {
                          const storageKey = `user_notifications_${user?.id}`;
                          const stored = localStorage.getItem(storageKey);
                          const customNotis = stored ? JSON.parse(stored) : [];
                          const newNoti = {
                            id: 'order_' + Date.now() + '_' + orderId,
                            type: 'order' as const,
                            title: 'Đặt đơn hàng mới thành công ✓',
                            message: `Đơn hàng #${orderCode || orderId.slice(0, 8)} tại quán ${restName} đã được gửi đi. Đang chờ xác nhận!`,
                            time: 'Vừa xong',
                            isRead: false,
                            createdAt: new Date().toISOString(),
                            meta: { orderId, orderStatus: 'pending' }
                          };
                          customNotis.unshift(newNoti);
                          localStorage.setItem(storageKey, JSON.stringify(customNotis));
                        } catch (err) {
                          console.error('Lỗi lưu thông báo đặt đơn hàng:', err);
                        }
                      });
                      window.dispatchEvent(new Event('new_notification'));

                      showCustomAlert('Khấu trừ trực tiếp vào ví Saigon-Pay thành công!', 'Thành công', 'info');
                      setSuccessOrderData({
                        orderId: createdOrders.map(o => o.id || o._id).join(','),
                        orderCode: createdOrders.map(o => o.code || (o.id || o._id).slice(0, 8).toUpperCase()).join(', '),
                        totalAmount: simulationData.amount,
                        restaurantName: createdOrders.map(o => restaurantsMap[o.restaurantId]?.name || 'Cửa hàng').join(' & '),
                        paymentMethod: 'WALLET',
                        itemCount: selectedItems.reduce((s, i) => s + i.quantity, 0),
                        deliveryCode: createdOrders.map(o => o.deliveryCode).filter(Boolean).join(', '),
                      });
                      setScreen('success');
                    } catch (err: any) {
                      console.error('Lỗi thanh toán ví:', err);
                      showCustomAlert(err.message || 'Lỗi thanh toán qua ví.', 'Lỗi', 'error');
                    } finally {
                      setIsOrdering(false);
                    }
                  }}
                  disabled={isOrdering || (walletBalance !== null && walletBalance < simulationData.amount)}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-mono font-bold text-xs py-3.5 px-6 uppercase tracking-wider border-2 border-neutral-900 shadow-retro active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOrdering ? 'ĐANG KHẤU TRỪ VÍ...' : 'THANH TOÁN ĐƠN HÀNG'}
                </button>

                <button
                  onClick={() => {
                    setScreen('checkout');
                  }}
                  disabled={isOrdering}
                  className="w-full bg-white hover:bg-neutral-50 text-neutral-600 font-mono text-[10px] py-2 px-6 border-2 border-neutral-250 cursor-pointer"
                >
                  Hủy và quay lại
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#FEFCF9] border-t border-[#E8D8C6] py-6 text-center text-xs text-neutral-400 mt-12 font-mono">
        <p className="font-display italic font-bold text-sm text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
        <p className="mt-1 text-[10px]">✿ Bưu phẩm gửi nhanh - Ấm lòng thực khách phương xa ✿</p>
      </footer>

      {/* Custom Alert Modal */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 select-none">
          <div className="card-retro bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} 
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-900 cursor-pointer font-bold font-mono"
            >
              ✕
            </button>
            <h2 className={`text-sm font-heading font-black text-center mb-3 uppercase tracking-wide border-b-2 border-neutral-900 pb-2 ${
              alertConfig.type === 'error' ? 'text-[#BF3A20]' : alertConfig.type === 'warning' ? 'text-[#C98F0A]' : 'text-neutral-800'
            }`}>
              {alertConfig.type === 'error' && '❌ '}
              {alertConfig.type === 'warning' && '⚠️ '}
              {alertConfig.type === 'info' && '🔔 '}
              {alertConfig.title}
            </h2>
            <p className="text-xs text-neutral-700 font-body text-center leading-relaxed mb-5">
              {alertConfig.message}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                className="py-2 px-6 font-body font-bold text-xs uppercase border-2 border-neutral-900 shadow-retro bg-[#BF3A20] hover:bg-[#D44B2F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-sm text-white text-center cursor-pointer transition-all min-w-[100px]"
              >
                Đồng ý (OK)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Voucher Selection Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FEFCF9] border-4 border-neutral-900 shadow-retro w-full max-w-lg rounded-sm overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b-4 border-neutral-900 bg-[#FAF7F3] flex justify-between items-center select-none">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Ticket size={16} className="text-[#BF3A20]" />
                Chọn mã giảm giá của bạn
              </h2>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1 hover:bg-neutral-200 border-2 border-neutral-900 bg-white rounded-sm active:translate-y-[1px]"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-grow bg-neutral-50/50">
              {loadingCollected ? (
                <div className="flex justify-center items-center py-12 gap-2 text-xs font-mono text-[#BF3A20] font-bold">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#BF3A20]"></div>
                  <span>Đang tải ví voucher...</span>
                </div>
              ) : collectedVouchers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-neutral-500 font-mono">Ví voucher của bạn trống rỗng.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <p className="text-[10px] font-mono font-bold text-neutral-450 uppercase tracking-widest">
                    Voucher của bạn ({collectedVouchers.length})
                  </p>
                  
                  {collectedVouchers.map((wrapper) => {
                    const v = wrapper.voucher;
                    const appCheck = getVoucherApplicability(v);
                    const isApplicable = appCheck.applicable;
                    const reason = appCheck.reason;
                    const isUsed = wrapper.isUsed;
                    const isExpired = new Date(v.endDate) < new Date();

                    return (
                      <div
                        key={wrapper.id}
                        onClick={() => {
                          if (isApplicable && !isUsed && !isExpired) {
                            applyVoucherObj(v);
                            setIsVoucherModalOpen(false);
                          }
                        }}
                        className={`transition-all ${
                          isApplicable && !isUsed && !isExpired
                            ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <VoucherCard
                          voucher={v}
                          isCollected={true}
                          isUsed={isUsed}
                          compact={true}
                        />
                        {!isApplicable && !isUsed && !isExpired && (
                          <p className="text-[9px] font-mono text-[#BF3A20] font-bold mt-1 pl-1">
                            * {reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-3 border-t-2 border-neutral-900 bg-[#FAF7F3] flex justify-end">
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="btn-retro text-[10px] py-1 bg-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutTracking;
