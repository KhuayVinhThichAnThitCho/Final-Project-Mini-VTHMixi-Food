import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Loader2, AlertCircle, RefreshCcw, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  isAvailable: boolean;
}

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image: string;
}

const CATEGORIES = ['Món chính', 'Món phụ', 'Đồ uống', 'Tráng miệng', 'Ăn vặt', 'Khác'];

const emptyForm: MenuItemForm = { name: '', description: '', price: '', category: 'Món chính', stock: '0', image: '' };

export const VendorMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorApi.getMyMenuItems();
      setMenuItems(res?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách thực đơn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenuItems(); }, [fetchMenuItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category,
      stock: String(item.stock),
      image: item.image || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Tên món ăn là bắt buộc.'); return; }
    if (!form.price || Number(form.price) <= 0) { setFormError('Giá món ăn phải lớn hơn 0.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock) || 0,
        image: form.image.trim() || undefined,
      };
      if (editingItem) {
        const res = await vendorApi.updateMenuItem(editingItem.id, data);
        setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...res?.data } : m));
      } else {
        const res = await vendorApi.createMenuItem(data);
        setMenuItems(prev => [res?.data, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${item.name}" không?`)) return;
    setDeletingId(item.id);
    try {
      await vendorApi.deleteMenuItem(item.id);
      setMenuItems(prev => prev.filter(m => m.id !== item.id));
    } catch (err: any) {
      alert(err?.message || 'Xóa thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    setTogglingId(item.id);
    try {
      await vendorApi.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !item.isAvailable } : m));
    } catch (err: any) {
      alert(err?.message || 'Cập nhật thất bại.');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải thực đơn...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchMenuItems} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Thực Đơn</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {menuItems.length} món · {menuItems.filter(m => m.isAvailable).length} còn hàng
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98]"
        >
          <Plus size={20} /> Thêm Món Mới
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-modern-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn, danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl pl-12 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-gray-400"
          />
        </div>
        <button onClick={fetchMenuItems} className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
          <RefreshCcw size={18} /> Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 font-medium">Không tìm thấy món ăn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-5 px-6 w-20">Ảnh</th>
                  <th className="py-5 px-6">Tên Món</th>
                  <th className="py-5 px-6">Danh Mục</th>
                  <th className="py-5 px-6">Giá Bán</th>
                  <th className="py-5 px-6">Tồn Kho</th>
                  <th className="py-5 px-6 text-center">Trạng Thái</th>
                  <th className="py-5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl relative overflow-hidden shadow-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-base text-gray-800">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{item.description}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold uppercase bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-lg text-gray-900">
                      {Number(item.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-gray-700">
                      {item.stock}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        disabled={togglingId === item.id}
                        className="flex items-center justify-center gap-1.5 mx-auto transition-all disabled:opacity-50"
                        title={item.isAvailable ? 'Nhấn để đánh dấu hết hàng' : 'Nhấn để bật lại'}
                      >
                        {togglingId === item.id ? (
                          <Loader2 size={20} className="animate-spin text-gray-400" />
                        ) : item.isAvailable ? (
                          <>
                            <ToggleRight size={24} className="text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">CÒN HÀNG</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={24} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400">HẾT HÀNG</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? '✏️ Chỉnh Sửa Món Ăn' : '➕ Thêm Món Mới'}
              </h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Món Ăn *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ví dụ: Hủ tiếu mì sườn"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô Tả</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về món ăn..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giá Bán (VND) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="55000"
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số Lượng Tồn</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 font-mono focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Danh Mục</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Ảnh</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-xl border border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-modern-sm hover:shadow-modern-glow transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Đang lưu...' : 'Lưu Món Ăn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMenu;
