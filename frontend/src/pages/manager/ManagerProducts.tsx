import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, EyeOff, Trash2, Eye, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  isDeleted: boolean;
  banReason?: string;
  restaurant: {
    id: string;
    name: string;
  };
}

const ManagerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: 'hide' | 'unhide' | 'delete', productId: string}>({
    isOpen: false,
    type: 'hide',
    productId: ''
  });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/products') as any;
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if ((actionModal.type === 'hide' || actionModal.type === 'delete') && !reason.trim()) {
      alert('Vui lòng nhập lý do.');
      return;
    }

    try {
      await api.patch(`/manager/products/${actionModal.productId}/status`, {
        action: actionModal.type,
        reason: reason
      });
      fetchProducts();
      setActionModal({ ...actionModal, isOpen: false });
      setReason('');
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Quản Lý Sản Phẩm</h2>
        <div className="divider-saigon mt-2 max-w-xs"></div>
        <p className="text-[#9E6E4A] font-body mt-3">Kiểm duyệt và quản lý các sản phẩm vi phạm nội quy.</p>
      </div>

      <div className="flex justify-between items-center bg-[#FEFCF9] p-4 rounded-xl shadow-card border border-[#E8D8C6]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E6E4A]" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm, nhà hàng..." 
            className="w-full pl-10 pr-4 py-2 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-transparent font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#BF3A20] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-[#FEFCF9] rounded-xl shadow-card border border-[#E8D8C6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF0D2] border-b-2 border-[#E8D8C6]">
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Sản phẩm</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Cửa hàng</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Giá / Kho</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#E8D8C6] hover:bg-[#FAF7F3] transition-colors">
                    <td className="p-4">
                      <p className={`font-bold ${product.isDeleted ? 'text-gray-400 line-through' : 'text-[#2C1A0E]'}`}>{product.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-[#7A5235]">{product.restaurant.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#BF3A20] font-bold">{Number(product.price).toLocaleString('vi-VN')}đ</p>
                      <p className="text-xs text-[#9E6E4A]">Kho: {product.stock}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        {product.isDeleted ? (
                          <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-red-100 text-red-700">ĐÃ XÓA</span>
                        ) : !product.isAvailable ? (
                          <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-yellow-100 text-yellow-700">BỊ ẨN</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 text-green-700">HOẠT ĐỘNG</span>
                        )}
                        {product.banReason && (
                          <span className="text-[10px] text-red-500 italic max-w-[150px] truncate" title={product.banReason}>
                            Lý do: {product.banReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {!product.isDeleted && (
                        <div className="flex justify-end gap-2">
                          {product.isAvailable ? (
                            <button 
                              onClick={() => setActionModal({ isOpen: true, type: 'hide', productId: product.id })}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                              title="Ẩn sản phẩm"
                            >
                              <EyeOff size={18} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => setActionModal({ isOpen: true, type: 'unhide', productId: product.id })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Hiện sản phẩm"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => setActionModal({ isOpen: true, type: 'delete', productId: product.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#9E6E4A]">Không có sản phẩm nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lock/Unlock */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FEFCF9] rounded-xl shadow-2xl max-w-md w-full border-2 border-saigon-neutral-text overflow-hidden scale-in">
            <div className={`p-4 border-b-2 border-saigon-neutral-text ${actionModal.type === 'delete' ? 'bg-[#FAE4E0]' : 'bg-[#FAF0D2]'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={actionModal.type === 'delete' ? 'text-[#BF3A20]' : 'text-[#8C5F00]'} size={24} />
                <h3 className={`font-display font-bold text-lg ${actionModal.type === 'delete' ? 'text-[#5C1A0A]' : 'text-[#5C3A0A]'}`}>
                  {actionModal.type === 'hide' ? 'Ẩn Sản Phẩm' : actionModal.type === 'delete' ? 'Xóa Sản Phẩm' : 'Hiện Sản Phẩm'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#7A5235] font-body mb-4">
                {actionModal.type === 'hide' ? 'Sản phẩm sẽ bị ẩn khỏi menu của khách hàng.' : 
                 actionModal.type === 'delete' ? 'Sản phẩm này sẽ bị xóa mềm và không thể khôi phục trạng thái bán.' :
                 'Sản phẩm sẽ được hiển thị lại trên menu.'}
              </p>
              
              {(actionModal.type === 'hide' || actionModal.type === 'delete') && (
                <textarea
                  className="w-full p-3 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-white font-body mb-4"
                  rows={3}
                  placeholder="Nhập lý do xử lý vi phạm..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                  className="px-4 py-2 font-mono font-bold text-[#7A5235] border-2 border-[#E8D8C6] rounded-lg hover:bg-[#E8D8C6]/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 font-mono font-bold text-[#FEFCF9] rounded-lg shadow-retro-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none border-2 border-saigon-neutral-text ${
                    actionModal.type === 'delete' ? 'bg-[#BF3A20] hover:bg-[#A02D16]' : 'bg-[#C98F0A] hover:bg-[#B37A00]'
                  }`}
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProducts;
