import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Trash2, Calendar, Loader2, AlertCircle, RefreshCcw, X, Save } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

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
}

interface VoucherForm {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  startDate: string;
  endDate: string;
}

const emptyForm: VoucherForm = {
  code: '',
  discountType: 'fixed_amount',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export const VendorPromotions: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
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
      const res = await vendorApi.getMyVouchers();
      setVouchers(res?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách khuyến mãi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCreate = async () => {
    if (!form.code.trim()) { setFormError('Mã giảm giá là bắt buộc.'); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setFormError('Giá trị giảm phải lớn hơn 0.'); return; }
    if (!form.startDate || !form.endDate) { setFormError('Ngày bắt đầu và kết thúc là bắt buộc.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { setFormError('Ngày kết thúc phải sau ngày bắt đầu.'); return; }

    setSaving(true);
    setFormError(null);
    try {
      const res = await vendorApi.createVoucher({
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setVouchers(prev => [res?.data, ...prev]);
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
      await vendorApi.deleteVoucher(id);
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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

  const isExpired = (v: Voucher) => new Date(v.endDate) < new Date();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải khuyến mãi...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchVouchers} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Khuyến Mãi</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
            <Tag size={16} className="text-primary-500" />
            {vouchers.filter(v => v.isActive && !isExpired(v)).length} mã đang hoạt động
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVouchers} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => { setForm(emptyForm); setFormError(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98]"
          >
            <Plus size={20} /> Tạo Mã Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm overflow-hidden">
        {vouchers.length === 0 ? (
          <div className="p-16 text-center">
            <Tag size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 font-medium">Chưa có mã khuyến mãi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-5 px-6">Mã Giảm Giá</th>
                  <th className="py-5 px-6">Loại & Mức Giảm</th>
                  <th className="py-5 px-6">Đơn Tối Thiểu</th>
                  <th className="py-5 px-6">Thời Gian</th>
                  <th className="py-5 px-6 text-center">Trạng Thái</th>
                  <th className="py-5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.map(promo => {
                  const expired = isExpired(promo);
                  const active = promo.isActive && !expired;
                  return (
                    <tr key={promo.id} className={`hover:bg-gray-50/50 transition-colors group ${!active ? 'opacity-60' : ''}`}>
                      <td className="py-5 px-6">
                        <span className="font-mono font-bold text-lg text-primary-600 select-all bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 inline-block">
                          {promo.code}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="font-bold text-gray-800">{formatDiscount(promo)}</span>
                        <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {promo.discountType === 'percentage' ? '%' : 'VND'}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-mono font-medium text-gray-600">
                        {Number(promo.minOrderAmount).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-5 px-6">
                        <span className="flex items-center gap-2 font-medium text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 w-max">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          active ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                          expired ? 'border-orange-200 text-orange-600 bg-orange-50' :
                          'border-gray-200 text-gray-500 bg-gray-100'
                        }`}>
                          {active ? 'Hoạt Động' : expired ? 'Hết Hạn' : 'Vô Hiệu'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {active && (
                          <button
                            onClick={() => handleDelete(promo.id, promo.code)}
                            disabled={deletingId === promo.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Vô hiệu hóa"
                          >
                            {deletingId === promo.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">🏷️ Tạo Mã Khuyến Mãi Mới</h2>
              <button onClick={() => !saving && setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mã Giảm Giá *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="Ví dụ: GIAM20K"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono font-bold tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại Giảm Giá *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'fixed_amount', label: 'Giảm Tiền Mặt (đ)' },
                    { val: 'percentage', label: 'Giảm Phần Trăm (%)' },
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.discountType === opt.val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" value={opt.val} checked={form.discountType === opt.val} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))} className="accent-primary-600" />
                      <span className="font-semibold text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá Trị Giảm * ({form.discountType === 'percentage' ? '%' : 'đ'})
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'percentage' ? '10' : '20000'}
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn Tối Thiểu (đ)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="50000"
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
              {form.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giảm Tối Đa (đ)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    placeholder="50000"
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Bắt Đầu *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Kết Thúc *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    min={form.startDate}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98] disabled:opacity-60">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Đang tạo...' : 'Tạo Mã'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPromotions;
