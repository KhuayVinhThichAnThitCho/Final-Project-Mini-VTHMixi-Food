import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Store, X } from 'lucide-react';
import adminApi from '../../services/adminApi';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── Confirm Dialog ───────────────────────────────────────────
const ConfirmDialog: React.FC<{
  title: string; message: string; confirmLabel: string; isDanger?: boolean;
  onConfirm: () => void; onCancel: () => void; isLoading?: boolean;
}> = ({ title, message, confirmLabel, isDanger, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
    <div className="bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} strokeWidth={1.5} className={isDanger ? 'text-red-500' : 'text-secondary-500'} />
          <div>
            <h3 className="font-heading font-bold text-neutral-900">{title}</h3>
            <p className="font-body text-sm text-neutral-600 mt-1">{message}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t-2 border-neutral-200 flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 border-2 border-neutral-200 font-mono text-sm text-neutral-600 hover:bg-neutral-50">Hủy</button>
        <button
          onClick={onConfirm} disabled={isLoading}
          className={`px-4 py-2 text-white border-2 font-mono text-sm font-bold uppercase tracking-wider shadow-retro-sm disabled:opacity-50 ${
            isDanger ? 'bg-red-600 border-red-700 hover:bg-red-500' : 'bg-primary-600 border-primary-700 hover:bg-primary-500'
          }`}
        >
          {isLoading ? 'Đang xử lý...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmHide, setConfirmHide] = useState<{ item: any; hide: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  // Fetch danh sách vendor để populate dropdown
  const { data: vendorData } = useQuery({
    queryKey: ['admin-vendors-for-filter', vendorSearch],
    queryFn: () => adminApi.getVendors({ search: vendorSearch || undefined, limit: 50 }),
  });
  const vendorList: any[] = (vendorData as any)?.vendors || [];

  // Fetch sản phẩm với filter restaurantId
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, selectedVendorId, includeDeleted, page],
    queryFn: () => adminApi.getProducts({
      search: search || undefined,
      restaurantId: selectedVendorId || undefined,
      includeDeleted,
      page,
      limit: 12,
    }),
  });

  const products: any[] = (data as any)?.products || [];
  const pagination = (data as any)?.pagination;

  const hideMutation = useMutation({
    mutationFn: ({ id, hide }: { id: string; hide: boolean }) =>
      adminApi.toggleProductVisibility(id, hide),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setConfirmHide(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.permanentDeleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setConfirmDelete(null); },
  });

  const handleSelectVendor = (vendor: any) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setShowVendorDropdown(false);
    setVendorSearch('');
    setPage(1);
  };

  const handleClearVendor = () => {
    setSelectedVendorId('');
    setSelectedVendorName('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">A-03</p>
        <h1 className="font-display italic text-3xl text-neutral-900">Quản Lý Sản Phẩm</h1>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────── */}
      <div className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Tìm kiếm tên */}
          <div className="relative flex-1 min-w-44">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 font-body text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* ── Vendor Dropdown ── */}
          <div className="relative min-w-52">
            {selectedVendorId ? (
              /* Đang filter theo vendor — hiển thị chip */
              <div className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 border-2 border-primary-400">
                <Store size={14} strokeWidth={1.5} className="text-primary-600 flex-shrink-0" />
                <span className="font-mono text-sm font-bold text-primary-700 truncate max-w-36">
                  {selectedVendorName}
                </span>
                <button
                  onClick={handleClearVendor}
                  className="ml-auto text-primary-400 hover:text-primary-700 flex-shrink-0"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              /* Chưa chọn vendor — nút mở dropdown */
              <button
                onClick={() => setShowVendorDropdown(v => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border-2 font-mono text-sm text-neutral-700 transition-colors ${
                  showVendorDropdown ? 'border-primary-500 bg-white' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Store size={15} strokeWidth={1.5} className="text-neutral-400" />
                <span className="flex-1 text-left">Lọc theo Vendor</span>
                <span className={`text-neutral-400 transition-transform ${showVendorDropdown ? 'rotate-180' : ''}`}>▾</span>
              </button>
            )}

            {/* Dropdown panel */}
            {showVendorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#FEFCF9] border-2 border-neutral-900 shadow-retro z-30">
                {/* Search in dropdown */}
                <div className="p-2 border-b border-neutral-200">
                  <div className="relative">
                    <Search size={13} strokeWidth={1.5} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tìm nhà hàng..."
                      value={vendorSearch}
                      onChange={e => setVendorSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 font-body text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="max-h-52 overflow-y-auto">
                  {vendorList.length === 0 ? (
                    <p className="px-3 py-3 font-mono text-xs text-neutral-400 text-center">Không tìm thấy</p>
                  ) : (
                    vendorList.map((vendor: any) => (
                      <button
                        key={vendor.id}
                        onClick={() => handleSelectVendor(vendor)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-primary-50 transition-colors border-b border-neutral-100 last:border-0 text-left"
                      >
                        <div className="w-6 h-6 bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200">
                          <Store size={12} strokeWidth={1.5} className="text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display italic text-sm text-neutral-900 truncate">{vendor.name}</p>
                          <p className="font-mono text-[10px] text-neutral-400 truncate">{vendor.address}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 ${
                          vendor.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {vendor.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggle hiển thị đã ẩn */}
          <div
            onClick={() => {
              setIncludeDeleted(v => !v);
              setPage(1);
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div
              className={`w-10 h-5 border-2 relative transition-colors ${includeDeleted ? 'bg-primary-600 border-primary-700' : 'bg-neutral-200 border-neutral-300'}`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white transition-transform ${includeDeleted ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-mono text-xs text-neutral-600 font-bold uppercase tracking-wide">Hiển thị đã ẩn</span>
          </div>
        </div>

        {/* Active filter info bar */}
        {(selectedVendorId || search) && (
          <div className="flex items-center gap-2 pt-1">
            <span className="font-mono text-xs text-neutral-400">Đang lọc:</span>
            {selectedVendorId && (
              <span className="inline-flex items-center gap-1 bg-primary-100 border border-primary-300 px-2 py-0.5 font-mono text-xs text-primary-700">
                🏪 {selectedVendorName}
                <button onClick={handleClearVendor} className="ml-1 hover:text-primary-900">✕</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 bg-secondary-100 border border-secondary-300 px-2 py-0.5 font-mono text-xs text-secondary-800">
                🔍 "{search}"
                <button onClick={() => setSearch('')} className="ml-1 hover:text-secondary-900">✕</button>
              </span>
            )}
            <span className="font-mono text-xs text-neutral-400 ml-auto">
              {pagination?.total ?? 0} sản phẩm
            </span>
          </div>
        )}
      </div>

      {/* Overlay đóng dropdown khi click ra ngoài */}
      {showVendorDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowVendorDropdown(false)} />
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#FEFCF9] border-2 border-neutral-200 p-4 animate-pulse space-y-3">
              <div className="h-32 bg-neutral-100" />
              <div className="h-4 bg-neutral-100 w-3/4" />
              <div className="h-3 bg-neutral-100 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <AlertCircle size={48} className="text-neutral-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="font-body text-neutral-400">
            {selectedVendorId ? `Nhà hàng "${selectedVendorName}" chưa có sản phẩm nào` : 'Không tìm thấy sản phẩm nào'}
          </p>
          {selectedVendorId && (
            <button onClick={handleClearVendor} className="mt-3 font-mono text-xs text-primary-600 hover:underline">
              Xem tất cả sản phẩm →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <div
              key={product.id}
              className={`bg-[#FEFCF9] border-2 border-neutral-200 shadow-saigon-card hover:shadow-saigon-card-hover transition-all duration-200 overflow-hidden ${
                !product.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-36 bg-neutral-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{ filter: 'sepia(8%) saturate(110%) brightness(98%)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🍜</span>
                  </div>
                )}
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-widest bg-[#FEFCF9] border-2 border-red-600 px-3 py-1 shadow-retro-sm">Đã ẩn</span>
                  </div>
                )}
                {product.stock === 0 && product.isAvailable && (
                  <div className="absolute top-2 right-2 bg-neutral-900/80 px-2 py-0.5">
                    <span className="font-mono text-[10px] text-white uppercase">Hết hàng</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="font-body text-sm font-semibold text-neutral-900 line-clamp-1">{product.name}</p>
                {/* Vendor name — click để filter */}
                <button
                  onClick={() => {
                    if (product.restaurant) {
                      handleSelectVendor(product.restaurant);
                    }
                  }}
                  className="font-mono text-xs text-neutral-400 mt-0.5 truncate w-full text-left hover:text-primary-600 transition-colors"
                  title="Click để lọc theo nhà hàng này"
                >
                  🏪 {product.restaurant?.name || '—'}
                </button>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-mono text-base font-bold text-primary-600">
                    {formatVND(product.price || 0)}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">
                    Đã bán: {product.soldCount || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => setConfirmHide({ item: product, hide: product.isAvailable })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wide transition-all ${
                      !product.isAvailable
                        ? 'border-green-300 text-green-700 hover:bg-green-50'
                        : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    {!product.isAvailable
                      ? <><Eye size={13} strokeWidth={1.5} /> Hiện</>
                      : <><EyeOff size={13} strokeWidth={1.5} /> Ẩn</>}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(product)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-red-300 text-red-700 font-mono text-xs font-bold uppercase hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={1.5} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-neutral-400">
            Trang {pagination.page} / {pagination.totalPages} — {pagination.total} sản phẩm
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center border-2 border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
      {confirmHide && (
        <ConfirmDialog
          title={confirmHide.hide ? 'Ẩn sản phẩm?' : 'Hiện lại sản phẩm?'}
          message={`${confirmHide.hide ? 'Ẩn' : 'Hiện lại'} sản phẩm "${confirmHide.item.name}"?`}
          confirmLabel={confirmHide.hide ? 'Ẩn sản phẩm' : 'Hiện lại'}
          onConfirm={() => hideMutation.mutate({ id: confirmHide.item.id, hide: confirmHide.hide })}
          onCancel={() => setConfirmHide(null)}
          isLoading={hideMutation.isPending}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Xóa sản phẩm?"
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${confirmDelete.name}"? Món ăn này sẽ được ẩn khỏi menu của khách hàng và lưu trữ lại trong cơ sở dữ liệu.`}
          confirmLabel="Xóa sản phẩm"
          isDanger
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminProducts;
