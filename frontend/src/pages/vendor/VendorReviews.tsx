import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Reply, AlertTriangle, Loader2, AlertCircle, RefreshCcw, Send, X } from 'lucide-react';
import { vendorApi } from '../../services/vendorApi';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  vendorReply?: string;
  createdAt: string;
  user?: { name: string; avatar?: string };
  menuItem?: { name: string };
}

export const VendorReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const restRes = await vendorApi.getMyRestaurant();
      const restaurant = restRes?.data;
      if (!restaurant) throw new Error('Không tìm thấy thông tin quán');

      const reviewRes = await vendorApi.getMyReviews(restaurant.id);
      setReviews(reviewRes?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải đánh giá.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingId(reviewId);
    try {
      await vendorApi.replyToReview(reviewId, replyText.trim());
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, vendorReply: replyText.trim() } : r));
      setReplyingId(null);
      setReplyText('');
    } catch (err: any) {
      alert(err?.message || 'Phản hồi thất bại.');
    } finally {
      setSubmittingId(null);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const unreplied = reviews.filter(r => !r.vendorReply).length;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={40} className="animate-spin text-primary-500" />
      <p className="font-medium">Đang tải đánh giá...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-red-700">Không thể tải dữ liệu</h2>
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={fetchReviews} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
        <RefreshCcw size={18} /> Thử Lại
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Đánh Giá</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary-500" /> Theo dõi và phản hồi đánh giá của khách hàng
          </p>
        </div>
        <button onClick={fetchReviews} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
          <RefreshCcw size={16} /> Làm Mới
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm text-center py-8 relative overflow-hidden group hover:shadow-modern transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 group-hover:h-2 transition-all"></div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Đánh Giá Trung Bình</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-5xl font-bold text-gray-900 tracking-tight">{avgRating}</span>
            <Star size={28} fill="currentColor" className="text-amber-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm text-center py-8 relative overflow-hidden group hover:shadow-modern transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 group-hover:h-2 transition-all"></div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Tổng Đánh Giá</p>
          <p className="text-5xl font-bold text-gray-900 mt-4 tracking-tight">{reviews.length}</p>
        </div>
        <div className={`${unreplied > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border shadow-modern-sm text-center py-8 relative overflow-hidden group hover:shadow-modern transition-all duration-300`}>
          <div className={`absolute top-0 left-0 w-full h-1 ${unreplied > 0 ? 'bg-red-500' : 'bg-emerald-500'} group-hover:h-2 transition-all`}></div>
          <p className={`text-sm font-semibold uppercase tracking-wider ${unreplied > 0 ? 'text-red-700' : 'text-emerald-700'}`}>Chưa Phản Hồi</p>
          <p className={`text-5xl font-bold mt-4 tracking-tight ${unreplied > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{unreplied}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="font-bold text-xl border-b border-gray-200 pb-4 flex items-center gap-3 text-gray-800">
          <MessageSquare size={24} className="text-primary-500" /> Tất Cả Đánh Giá ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Star size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 font-medium">Quán chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-modern-sm flex flex-col md:flex-row hover:shadow-modern transition-all duration-300 overflow-hidden">
                {/* Left: Meta */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 md:w-64 shrink-0 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="font-bold text-lg text-gray-900 mb-1">
                    {review.user?.name || 'Ẩn danh'}
                  </span>
                  <span className="text-sm font-medium text-gray-400 mb-3">{formatDate(review.createdAt)}</span>
                  {review.menuItem?.name && (
                    <span className="text-xs font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 truncate max-w-full shadow-sm">
                      {review.menuItem.name}
                    </span>
                  )}
                </div>

                {/* Right: Content */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <p className="text-gray-700 text-base mb-5 leading-relaxed italic">
                    "{review.comment || 'Không có nội dung.'}"
                  </p>

                  {review.vendorReply ? (
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                      <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2 block">Phản hồi của quán:</span>
                      <p className="text-emerald-900 font-medium">{review.vendorReply}</p>
                    </div>
                  ) : replyingId === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        rows={3}
                        autoFocus
                        className="w-full bg-gray-50 border border-gray-200 focus:border-primary-500 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText.trim() || submittingId === review.id}
                          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-60"
                        >
                          {submittingId === review.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {submittingId === review.id ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                        </button>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(''); }}
                          disabled={submittingId === review.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                          <X size={16} /> Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-4 mt-auto">
                      <button
                        onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all active:scale-[0.98]"
                      >
                        <Reply size={18} /> Trả Lời
                      </button>
                      {review.rating <= 3 && (
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-500 rounded-xl font-semibold border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-[0.98]">
                          <AlertTriangle size={18} /> Báo Cáo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReviews;
