import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Phone, Camera, CheckCircle2, Loader2,
  Package, ArrowRight, X
} from 'lucide-react';
import shipperApi from '../../services/shipperApi';

const ShipperActiveOrder: React.FC = () => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'pickup' | 'delivery'>('pickup'); // Bước hiện tại
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [deliveryCodeInput, setDeliveryCodeInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchActiveOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipperApi.getMyDeliveries();
      const all: any[] = res?.data || [];
      // Đơn đang giao là delivering hoặc vừa nhận (ready + có shipperId)
      const active = all.find((o: any) => o.status === 'delivering') ||
        all.find((o: any) => o.status === 'ready' && o.shipperId);
      setOrder(active || null);
      if (active?.status === 'delivering') setStep('delivery');
      else setStep('pickup');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActiveOrder(); }, [fetchActiveOrder]);

  const handleSelectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePickup = async () => {
    if (!order) return;
    setUploading(true);
    try {
      await shipperApi.confirmPickup(order.id, photo || undefined);
      setOrder((prev: any) => ({ ...prev, status: 'delivering', pickupPhotoUrl: photo }));
      setStep('delivery');
      setPhoto(null);
    } catch (err: any) {
      alert(err?.message || 'Xác nhận thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!order) return;
    if (!deliveryCodeInput || deliveryCodeInput.length !== 4) {
      alert('Vui lòng nhập đầy đủ mã nhận hàng gồm 4 chữ số từ khách hàng.');
      return;
    }
    setUploading(true);
    try {
      await shipperApi.completeDelivery(order.id, photo || undefined, deliveryCodeInput);
      setDone(true);
    } catch (err: any) {
      alert(err?.message || 'Xác nhận thất bại!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-2xl animate-pulse" style={{ height: i === 0 ? 180 : 80 }} />
      ))}
    </div>
  );

  if (done) return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-modern max-w-md mx-auto p-8 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
        <CheckCircle2 size={40} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Giao Hàng Thành Công! 🎉</h2>
        <p className="text-gray-500 text-sm mt-2">Phí ship đã được thanh toán và cộng vào ví của bạn</p>
        <p className="text-primary-600 text-3xl font-bold mt-3">
          +{Number(order?.shippingFee || 15000).toLocaleString('vi-VN')}đ
        </p>
      </div>
      <button
        onClick={() => { setDone(false); setOrder(null); fetchActiveOrder(); }}
        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all duration-200 cursor-pointer shadow-modern-sm"
      >
        Nhận Đơn Hàng Mới
      </button>
    </div>
  );

  if (!order) return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
        <Package size={32} className="text-gray-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-gray-700 font-semibold text-base">Bạn chưa có đơn hàng đang giao nào</p>
        <p className="text-gray-400 text-sm mt-1.5">Vui lòng sang trang "Đơn Có Sẵn" để nhận đơn hàng mới đi giao</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Đơn Đang Giao</h1>

      {/* Order Info Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-modern-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-sm">#{order.id?.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            order.status === 'delivering'
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            {order.status === 'delivering' ? 'Đang Giao' : 'Đã Tiếp Nhận'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          {/* Restaurant */}
          <div className="flex items-start gap-3 p-4 bg-gray-50/80 border border-gray-100 rounded-xl">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lấy hàng tại</p>
              <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.restaurant?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{order.restaurant?.address}</p>
            </div>
          </div>
          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight size={18} className="text-gray-300" />
          </div>
          {/* Customer */}
          <div className="flex items-start gap-3 p-4 bg-gray-50/80 border border-gray-100 rounded-xl">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giao đến</p>
              <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{order.deliveryAddress}</p>
              {order.user?.phone && (
                <a
                  href={`tel:${order.user.phone}`}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
                >
                  <Phone size={11} />
                  Gọi điện cho khách: {order.user.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-modern-sm">
        <div className="flex items-center gap-3 mb-4">
          {/* Step 1 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
            step === 'delivery' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-primary-600 border-primary-600 text-white'
          }`}>
            {step === 'delivery' ? <CheckCircle2 size={16} /> : '1'}
          </div>
          <div className={`flex-1 h-1 rounded-full ${step === 'delivery' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
            step === 'delivery' ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span className={step === 'pickup' ? 'text-primary-600' : 'text-emerald-600'}>
            {step === 'pickup' ? '📦 Bước 1: Lấy hàng tại quán' : '✅ Đã hoàn thành lấy hàng'}
          </span>
          <span className={step === 'delivery' ? 'text-primary-600' : 'text-gray-400'}>
            🏠 Bước 2: Giao cho khách hàng
          </span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-modern-sm space-y-4">
        <div>
          <h3 className="font-bold text-gray-800 text-base">
            {step === 'pickup' ? '📸 Chụp ảnh lấy hàng tại quán' : '📸 Chụp ảnh xác nhận giao hàng'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {step === 'pickup'
              ? 'Hãy chụp lại đơn hàng để vendor đối chiếu và xác nhận'
              : 'Hãy chụp lại gói hàng trước cửa nhà khách để hoàn tất bằng chứng'}
          </p>
        </div>

        {/* Photo preview */}
        {photo ? (
          <div className="relative border border-gray-100 rounded-xl overflow-hidden shadow-modern-sm">
            <img src={photo} alt="Preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/80 flex items-center justify-center hover:bg-gray-900 transition"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/80 flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors duration-200">
              <Camera size={22} className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
            </div>
            <p className="text-sm font-medium text-gray-400 group-hover:text-primary-500 transition-colors duration-200">Chọn ảnh từ thiết bị</p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleSelectPhoto}
        />

        {step === 'delivery' && (
          <div className="border border-gray-100 p-4 rounded-xl space-y-2 bg-gray-50/50">
            <label className="block text-sm font-semibold text-gray-700">🔑 Nhập mã nhận hàng từ khách:</label>
            <input
              type="text"
              maxLength={4}
              placeholder="Nhập 4 chữ số..."
              value={deliveryCodeInput}
              onChange={(e) => setDeliveryCodeInput(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-center font-mono text-xl tracking-widest focus:border-primary-500 focus:outline-none"
            />
          </div>
        )}

        {/* Action button */}
        <button
          onClick={step === 'pickup' ? handlePickup : handleComplete}
          disabled={uploading}
          className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-modern-sm"
        >
          {uploading
            ? <Loader2 size={16} className="animate-spin" />
            : <CheckCircle2 size={16} />}
          {uploading
            ? 'Đang xử lý...'
            : step === 'pickup' ? 'Xác Nhận Đã Lấy Hàng' : 'Xác Nhận Giao Hàng Xong'}
        </button>
        {!photo && (
          <p className="text-xs text-gray-400 text-center">* Bạn có thể bấm xác nhận mà không cần chụp ảnh</p>
        )}
      </div>
    </div>
  );
};

export default ShipperActiveOrder;
