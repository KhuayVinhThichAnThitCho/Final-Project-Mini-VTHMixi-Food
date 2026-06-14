import React, { useState, useEffect, useCallback } from 'react';
import { Save, Camera, Clock, MapPin, Store, Loader2, AlertCircle, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface RestaurantData {
  id: string;
  name: string;
  address: string;
  status: 'open' | 'closed' | 'pending' | 'banned';
  deliveryFee: number;
  minOrderValue: number;
  operatingHours?: { open: string; close: string };
  logo?: string;
}

export const VendorSettings: React.FC = () => {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [status, setStatus] = useState<'open' | 'closed'>('open');
  const [logo, setLogo] = useState('');

  const fetchRestaurant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorApi.getMyRestaurant();
      const r = res?.data as RestaurantData;
      setRestaurant(r);
      setName(r.name || '');
      setAddress(r.address || '');
      setDeliveryFee(String(r.deliveryFee || '0'));
      setMinOrderValue(String(r.minOrderValue || '0'));
      setOpenTime(r.operatingHours?.open || '06:00');
      setCloseTime(r.operatingHours?.close || '22:00');
      setStatus(r.status === 'open' ? 'open' : 'closed');
      setLogo(r.logo || '');
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin quán.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);

  const handleSave = async () => {
    if (!name.trim()) { alert('Tên quán là bắt buộc.'); return; }
    if (!address.trim()) { alert('Địa chỉ là bắt buộc.'); return; }

    setSaving(true);
    setSaved(false);
    try {
      const res = await vendorApi.updateMyRestaurant({
        name: name.trim(),
        address: address.trim(),
        deliveryFee: Number(deliveryFee) || 0,
        minOrderValue: Number(minOrderValue) || 0,
        status,
        operatingHours: { open: openTime, close: closeTime },
        logo: logo.trim() || undefined,
      });
      setRestaurant(prev => prev ? { ...prev, ...res?.data } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = () => {
    setStatus(prev => prev === 'open' ? 'closed' : 'open');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải thông tin quán...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchRestaurant} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Cài Đặt Quán</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Cấu hình thông tin và hoạt động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-modern-sm text-center flex flex-col items-center p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

            <div className="relative mb-6 z-10">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center shadow-md overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo quán" className="w-full h-full object-cover" />
                ) : (
                  <Store size={48} className="text-primary-500 opacity-80" />
                )}
              </div>
              <label htmlFor="logo-input" className="absolute bottom-0 right-0 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors cursor-pointer">
                <Camera size={18} className="text-gray-600" />
              </label>
              <input
                id="logo-input"
                type="text"
                placeholder="URL ảnh logo..."
                value={logo}
                onChange={e => setLogo(e.target.value)}
                className="sr-only"
              />
            </div>

            <h2 className="font-bold text-xl mb-1 text-gray-800">{name || restaurant?.name}</h2>
            <p className="text-sm font-mono font-medium text-gray-400 mb-4">#{restaurant?.id?.slice(-6).toUpperCase()}</p>

            {/* Logo URL input */}
            <div className="w-full mb-4">
              <input
                type="text"
                placeholder="URL ảnh logo quán..."
                value={logo}
                onChange={e => setLogo(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>

            <div className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Trạng Thái:</span>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-all ${status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
              >
                {status === 'open' ? '🟢 Đang Mở Cửa' : '⚫ Đã Đóng Cửa'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-modern-sm overflow-hidden">
            <h3 className="text-lg font-bold border-b border-gray-100 p-6 bg-white flex items-center gap-3 text-gray-800">
              <Store size={20} className="text-primary-500" /> Thông Tin Cơ Bản
            </h3>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Quán *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" /> Địa Chỉ *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phí Giao Hàng (đ)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn Hàng Tối Thiểu (đ)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Giờ Mở Cửa
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Giờ Đóng Cửa
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 size={18} /> Đã lưu thành công!
                </div>
              )}
              {!saved && <div />}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;
