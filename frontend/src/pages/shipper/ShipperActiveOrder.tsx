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
    setUploading(true);
    try {
      await shipperApi.completeDelivery(order.id, photo || undefined);
      setDone(true);
    } catch (err: any) {
      alert(err?.message || 'Xác nhận thất bại!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500">
      <Loader2 size={36} className="animate-spin text-primary-600" />
      <p className="font-mono font-bold uppercase text-xs tracking-wider">Đang tải thông tin đơn...</p>
    </div>
  );

  if (done) return (
    <div className="border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro max-w-md mx-auto p-8 flex flex-col items-center justify-center py-16 gap-6 text-center">
      <div className="w-20 h-20 border-2 border-neutral-900 bg-[#E8F5E9] flex items-center justify-center shadow-retro-sm">
        <CheckCircle2 size={40} className="text-[#2D7A4F]" />
      </div>
      <div>
        <h2 className="font-heading italic font-bold text-2xl text-neutral-900">Giao Hàng Thành Công! 🎉</h2>
        <p className="text-neutral-500 text-sm mt-2">Phí ship đã được thanh toán và cộng vào ví của bạn</p>
        <p className="text-[#BF3A20] text-2xl font-bold font-mono mt-3">
          +{Number(order?.shippingFee || 15000).toLocaleString('vi-VN')}đ
        </p>
      </div>
      <button
        onClick={() => { setDone(false); setOrder(null); fetchActiveOrder(); }}
        className="px-6 py-3 bg-[#BF3A20] text-white border-2 border-neutral-900 font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#D44B2F] active:translate-y-[2px] transition cursor-pointer"
      >
        Nhận Đơn Hàng Mới
      </button>
    </div>
  );

  if (!order) return (
    <div className="border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro max-w-2xl mx-auto p-16 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 border-2 border-neutral-900 bg-[#FAF7F3] flex items-center justify-center mx-auto shadow-retro-sm">
        <Package size={32} className="text-neutral-500" strokeWidth={1.5} />
      </div>
      <p className="text-neutral-800 font-heading font-bold text-base">Bạn chưa có đơn hàng đang giao nào</p>
      <p className="text-neutral-500 text-xs mt-2">Vui lòng sang trang "Đơn Có Sẵn" để nhận đơn hàng mới đi giao</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-neutral-800">
      <h1 className="font-heading italic font-bold text-2xl lg:text-3xl text-neutral-900">Đơn Đang Giao</h1>

      {/* Order Info Card */}
      <div className="border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro overflow-hidden">
        <div className="p-4 border-b-2 border-neutral-900 bg-[#FAF7F3] flex items-center justify-between">
          <div>
            <p className="font-mono font-bold text-neutral-900 text-sm">#{order.id?.slice(-8).toUpperCase()}</p>
            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`px-2.5 py-0.5 border border-neutral-900 font-mono text-[9px] font-bold uppercase shadow-retro-sm ${
            order.status === 'delivering'
              ? 'bg-[#2563A8]/10 text-[#2563A8]'
              : 'bg-[#C98F0A]/10 text-[#C98F0A]'
          }`}>
            {order.status === 'delivering' ? 'ĐANG GIAO' : 'ĐÃ TIẾP NHẬN'}
          </span>
        </div>
        <div className="p-4 space-y-4">
          {/* Restaurant */}
          <div className="flex items-start gap-3 p-3.5 border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro-sm">
            <div className="w-8 h-8 border border-neutral-900 bg-[#BF3A20]/10 flex items-center justify-center flex-shrink-0 shadow-retro-sm">
              <MapPin size={15} className="text-[#BF3A20]" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Lấy hàng tại</p>
              <p className="font-bold text-neutral-905 text-xs lg:text-sm mt-0.5">{order.restaurant?.name}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{order.restaurant?.address}</p>
            </div>
          </div>
          {/* Arrow */}
          <div className="flex justify-center my-1">
            <ArrowRight size={18} className="text-neutral-400" />
          </div>
          {/* Customer */}
          <div className="flex items-start gap-3 p-3.5 border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro-sm">
            <div className="w-8 h-8 border border-neutral-900 bg-[#C98F0A]/10 flex items-center justify-center flex-shrink-0 shadow-retro-sm">
              <MapPin size={15} className="text-[#C98F0A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Giao đến</p>
              <p className="font-bold text-neutral-905 text-xs lg:text-sm mt-0.5">{order.user?.name}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{order.deliveryAddress}</p>
              {order.user?.phone && (
                <a
                  href={`tel:${order.user.phone}`}
                  className="inline-flex items-center gap-1.5 mt-3.5 px-2.5 py-1 bg-[#F5EFE6] border border-neutral-300 text-[10px] text-neutral-700 font-mono font-bold uppercase hover:border-neutral-900 hover:text-neutral-905 active:translate-y-[1px] transition shadow-retro-sm"
                >
                  <Phone size={10} />
                  Gọi điện cho khách: {order.user.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-[#FAF7F3] border-2 border-neutral-900 p-4 shadow-retro-sm space-y-3">
        <div className="h-4 bg-[#FAF7F3] border-2 border-neutral-900 shadow-retro-sm rounded-full overflow-hidden flex">
          <div className={`h-full transition-all duration-350 ${step === 'pickup' || step === 'delivery' ? 'bg-[#BF3A20]' : 'bg-transparent'} ${step === 'delivery' ? 'w-1/2' : 'w-1/2'}`} />
          <div className={`h-full transition-all duration-350 ${step === 'delivery' ? 'bg-[#2D7A4F]' : 'bg-transparent'} w-1/2`} />
        </div>
        <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
          <span className={step === 'pickup' ? 'text-[#BF3A20]' : 'text-[#2D7A4F]'}>
            {step === 'pickup' ? '📦 Bước 1: Lấy hàng tại quán' : '✅ Đã hoàn thành lấy hàng'}
          </span>
          <span className={step === 'delivery' ? 'text-[#BF3A20]' : 'text-neutral-400'}>
            🏠 Bước 2: Giao cho khách hàng
          </span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="border-2 border-neutral-900 bg-[#FEFCF9] p-5 shadow-retro space-y-4">
        <div>
          <h3 className="font-heading font-bold text-neutral-900 text-sm lg:text-base">
            {step === 'pickup' ? '📸 Chụp ảnh lấy hàng tại quán' : '📸 Chụp ảnh xác nhận giao hàng'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            {step === 'pickup'
              ? 'Hãy chụp lại đơn hàng để vendor đối chiếu và xác nhận'
              : 'Hãy chụp lại gói hàng trước cửa nhà khách để hoàn tất bằng chứng'}
          </p>
        </div>

        {/* Photo preview */}
        {photo ? (
          <div className="relative border-2 border-neutral-900 shadow-retro-sm rounded-sm overflow-hidden">
            <img src={photo} alt="Preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-neutral-400 bg-[#FAF7F3] flex flex-col items-center justify-center gap-3 hover:border-neutral-900 hover:bg-neutral-100/50 cursor-pointer transition-all group"
          >
            <Camera size={28} className="text-neutral-400 group-hover:text-neutral-700 transition" />
            <p className="text-xs text-neutral-500 font-mono group-hover:text-neutral-700 uppercase tracking-wide">Chọn ảnh từ thiết bị</p>
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

        {/* Action button */}
        <button
          onClick={step === 'pickup' ? handlePickup : handleComplete}
          disabled={uploading}
          className="w-full py-3.5 border-2 border-neutral-900 bg-[#BF3A20] text-white font-mono font-bold uppercase text-xs shadow-retro-sm hover:bg-[#D44B2F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {uploading
            ? <Loader2 size={16} className="animate-spin" />
            : <CheckCircle2 size={16} />}
          {uploading
            ? 'ĐANG XỬ LÝ...'
            : step === 'pickup' ? 'XÁC NHẬN ĐÃ LẤY HÀNG' : 'XÁC NHẬN GIAO HÀNG XONG'}
        </button>
        {!photo && (
          <p className="text-[10px] font-mono text-neutral-400 text-center uppercase tracking-wide">* Bạn có thể bấm xác nhận mà không cần chụp ảnh</p>
        )}
      </div>
    </div>
  );
};

export default ShipperActiveOrder;
