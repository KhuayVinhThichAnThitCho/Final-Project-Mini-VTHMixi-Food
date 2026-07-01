import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Trash2, Calendar, Loader2, AlertCircle, RefreshCcw, X, Save, Store } from 'lucide-react';
import voucherApi from '../../services/voucherApi';
import api from '../../services/api';
import { MOCK_RESTAURANTS } from '../../utils/mockData';

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  restaurantId?: string | null;
  restaurant?: {
    name: string;
  } | null;
  maxUses?: number | null;
  usedCount: number;
}

interface VoucherForm {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  startDate: string;
  endDate: string;
  restaurantId: string; // empty means platform-wide
  maxUses: string;
}

const emptyForm: VoucherForm = {
  code: '',
  discountType: 'fixed_amount',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  restaurantId: '',
  maxUses: '',
};

export const AdminVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<VoucherForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voucherApi.getMyVouchers(); // Lấy tất cả vouchers hệ thống
      setVouchers(res?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách khuyến mãi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await api.get('/restaurants', { params: { limit: 100 } });
      if (res && (res as any).success) {
        const payload = (res as any).data;
        if (payload && Array.isArray(payload.restaurants)) {
          setRestaurants(payload.restaurants);
        } else if (Array.isArray(payload)) {
          setRestaurants(payload);
        } else {
          setRestaurants(MOCK_RESTAURANTS);
        }
      } else {
        setRestaurants(MOCK_RESTAURANTS);
      }
    } catch (err) {
      setRestaurants(MOCK_RESTAURANTS);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
    fetchRestaurants();
  }, [fetchVouchers, fetchRestaurants]);

  const handleCreate = async () => {
    if (!form.code.trim()) { setFormError('Mã giảm giá là bắt buộc.'); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setFormError('Giá trị giảm phải lớn hơn 0.'); return; }
    if (!form.startDate || !form.endDate) { setFormError('Ngày bắt đầu và kết thúc là bắt buộc.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { setFormError('Ngày kết thúc phải sau ngày bắt đầu.'); return; }

    setSaving(true);
    setFormError(null);
    try {
      const res = await voucherApi.createVoucher({
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        startDate: form.startDate,
        endDate: form.endDate,
        restaurantId: form.restaurantId || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      });
      
      const newV = res?.data;
      if (form.restaurantId) {
        const rest = restaurants.find(r => r.id === form.restaurantId);
        if (newV) {
          newV.restaurant = rest ? { name: rest.name } : null;
        }
      }
      if (newV) {
        setVouchers(prev => [newV, ...prev]);
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err?.message || 'Tạo mã thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Vô hiệu hóa mã "${code}"? Người dùng sẽ không thể dùng mã này nữa.`)) return;
    setDeletingId(id);
    try {
      await voucherApi.deleteVoucher(id);
      setVouchers(prev => prev.map(v => v.id === id ? { ...v, isActive: false } : v));
    } catch (err: any) {
      alert(err?.message || 'Xóa thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscount = (v: Voucher) =>
    v.discountType === 'percentage'
      ? `${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${Number(v.maxDiscountAmount).toLocaleString('vi-VN')} đ)` : ''}`
      : `${Number(v.discountValue).toLocaleString('vi-VN')} đ`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isExpired = (v: Voucher) => new Date(v.endDate) < new Date();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-450">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-mono text-xs uppercase font-bold text-neutral-600">Đang tải danh sách voucher hệ thống...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700 font-display italic">Không thể tải dữ liệu</h2>
      <p className="text-red-655 text-xs font-mono">{error}</p>
      <button onClick={fetchVouchers} className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-all border-2 border-neutral-900 shadow-retro-sm">
        <RefreshCcw size={16} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in text-neutral-800">
      <div className="flex justify-between items-end pb-4 border-b-2 border-neutral-200">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neutral-900 uppercase">
            Quản Lý Khuyến Mãi Hệ Thống
          </h1>
          <p className="text-xs font-mono font-bold text-neutral-400 mt-2 flex items-center gap-2 uppercase tracking-widest">
            <Tag size={14} className="text-[#BF3A20]" />
            {vouchers.filter(v => v.isActive && !isExpired(v)).length} mã đang hoạt động trên hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVouchers} className="flex items-center justify-center w-10 h-10 bg-white border-2 border-neutral-950 text-neutral-800 shadow-retro-sm hover:bg-neutral-50 active:translate-y-[1px] active:shadow-none transition-all">
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => { setForm(emptyForm); setFormError(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-[#BF3A20] text-white border-2 border-neutral-950 px-6 py-2 shadow-retro-sm hover:bg-[#D44B2F] active:translate-y-[1px] active:shadow-none transition-all font-mono font-bold uppercase text-xs"
          >
            <Plus size={16} /> Tạo Mã Mới
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-neutral-950 shadow-retro overflow-hidden rounded-sm">
        {vouchers.length === 0 ? (
          <div className="p-16 text-center select-none">
            <Tag size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-500 font-mono text-xs uppercase font-bold">Chưa có mã khuyến mãi nào được tạo</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-neutral-950 shadow-retro-sm">
            <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
              <thead className="bg-[#FAF7F3] border-b-2 border-neutral-950 font-mono uppercase">
                <tr className="text-neutral-700 font-bold tracking-wider">
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Mã Giảm Giá</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Phạm Vi Áp Dụng</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Mức Giảm</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Đơn Tối Thiểu</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Lượt Sử Dụng</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 font-black tracking-widest whitespace-nowrap">Thời Gian Hiệu Lực</th>
                  <th className="py-3.5 px-4 border-r border-neutral-200 text-center font-black tracking-widest whitespace-nowrap">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right font-black tracking-widest whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t border-neutral-200 bg-white">
                {vouchers.filter(Boolean).map(promo => {
                  const expired = isExpired(promo);
                  const active = promo.isActive && !expired;
                  const isPlatform = !promo.restaurantId;
                  return (
                    <tr key={promo.id} className={`hover:bg-neutral-50/50 transition-colors ${!active ? 'opacity-60 bg-neutral-50/20' : ''}`}>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap">
                        <span className="font-mono font-black text-xs text-[#BF3A20] select-all bg-red-50 border border-neutral-900 shadow-retro-sm px-2.5 py-1 rounded-sm inline-block">
                          {promo.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap">
                        {isPlatform ? (
                          <span className="text-red-700 bg-red-50 px-2.5 py-1 border border-neutral-900 shadow-retro-sm rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider inline-block">🎫 TOÀN SÀN</span>
                        ) : (
                          <span className="text-neutral-800 bg-yellow-50 px-2.5 py-1 border border-neutral-900 shadow-retro-sm rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            <Store size={11} className="text-[#C98F0A]" /> {promo.restaurant?.name || 'Quán riêng'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap font-mono font-bold text-neutral-900 text-xs">
                        {formatDiscount(promo)}
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap font-mono font-bold text-neutral-700 text-xs">
                        {Number(promo.minOrderAmount).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap font-mono text-neutral-600 text-xs">
                        <span className="font-black text-neutral-900">{promo.usedCount}</span>
                        <span className="text-neutral-400 font-bold"> / {promo.maxUses !== null && promo.maxUses !== undefined ? promo.maxUses : '∞'}</span>
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-neutral-100/80 border border-neutral-300 px-2.5 py-1 rounded-sm text-neutral-600 font-mono text-[10px]">
                          <Calendar size={11} className="text-neutral-500" />
                          {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-neutral-100 align-middle text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-sm border-2 border-neutral-900 shadow-retro-sm whitespace-nowrap tracking-wider inline-block ${
                          active ? 'text-emerald-700 bg-emerald-50' :
                          expired ? 'text-orange-650 bg-orange-50' :
                          'text-neutral-550 bg-neutral-50'
                        }`}>
                          {active ? '🟢 HOẠT ĐỘNG' : expired ? '⏰ HẾT HẠN' : '🔴 VÔ HIỆU'}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                        {active ? (
                          <button
                            onClick={() => handleDelete(promo.id, promo.code)}
                            disabled={deletingId === promo.id}
                            className="p-1.5 text-[#BF3A20] hover:bg-red-50 border-2 border-neutral-900 shadow-retro-sm hover:shadow-none active:translate-x-[1px] active:translate-y-[1px] rounded-sm transition-all disabled:opacity-50 cursor-pointer bg-white"
                            title="Vô hiệu hóa"
                          >
                            {deletingId === promo.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-450 italic font-mono select-none">Khóa</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tạo mã */}
      {showModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs" onClick={() => !saving && setShowModal(false)}>
          <div className="bg-white border-4 border-neutral-950 shadow-retro w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b-2 border-neutral-900 flex justify-between items-center sticky top-0 bg-[#FAF7F3] z-10">
              <h2 className="text-sm font-mono font-bold text-neutral-900 uppercase">🏷️ Tạo Mã Khuyến Mãi Mới</h2>
              <button onClick={() => !saving && setShowModal(false)} className="p-1 hover:bg-neutral-250 border-2 border-neutral-900 bg-white rounded-sm active:translate-y-[1px]">
                <X size={14} className="text-neutral-800" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 text-xs font-mono font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Mã Giảm Giá *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="Ví dụ: GIAM30K"
                  className="w-full bg-neutral-50 border-2 border-neutral-900 focus:border-primary-500 px-3 py-2 text-neutral-800 font-mono font-bold tracking-widest focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Phạm Vi Khuyến Mãi</label>
                <select
                  value={form.restaurantId}
                  onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))}
                  className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-xs font-mono focus:outline-none"
                >
                  <option value="">🎫 TOÀN SÀN (Mã áp dụng mọi quán)</option>
                  {restaurants.map((rest) => (
                    <option key={rest.id} value={rest.id}>
                      🏪 Cửa hàng: {rest.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-655 uppercase mb-1.5">Loại Giảm Giá *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'fixed_amount', label: 'Giảm Tiền Mặt (đ)' },
                    { val: 'percentage', label: 'Giảm Phần Trăm (%)' },
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center gap-2 p-3 border-2 cursor-pointer transition-all border-neutral-900 ${form.discountType === opt.val ? 'bg-[#FAF0D2]' : 'bg-white hover:bg-neutral-50'}`}>
                      <input type="radio" value={opt.val} checked={form.discountType === opt.val} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))} className="accent-neutral-900" />
                      <span className="font-mono font-bold text-[11px] text-neutral-700 uppercase">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">
                    Giá Trị Giảm * ({form.discountType === 'percentage' ? '%' : 'đ'})
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'percentage' ? '10' : '20000'}
                    min={0}
                    step={form.discountType === 'percentage' ? 5 : 5000}
                    className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-800 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Đơn Tối Thiểu (đ)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="50000"
                    min={0}
                    step={5000}
                    className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {form.discountType === 'percentage' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Giảm Tối Đa (đ)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    placeholder="50000"
                    min={0}
                    step={5000}
                    className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-850 font-mono focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Số Lượt Sử Dụng Tối Đa (Bỏ trống = Vô hạn)</label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="Ví dụ: 100"
                  min={1}
                  className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-850 font-mono focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Ngày Bắt Đầu *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-850 font-mono focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-650 uppercase mb-1.5">Ngày Kết Thúc *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    min={form.startDate}
                    className="w-full bg-neutral-50 border-2 border-neutral-900 px-3 py-2 text-neutral-850 font-mono focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t-2 border-neutral-900 bg-[#FAF7F3] flex justify-end gap-3 select-none">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-5 py-2.5 bg-white border-2 border-neutral-950 text-neutral-800 rounded-sm font-mono font-bold uppercase text-[11px] hover:bg-neutral-55 transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handleCreate} disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 bg-[#BF3A20] text-white border-2 border-neutral-950 shadow-retro-sm hover:bg-[#D44B2F] active:translate-y-[1px] active:shadow-none transition-all font-mono font-bold uppercase text-[11px] disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Đang tạo...' : 'Tạo Mã'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
