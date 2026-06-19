import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Send, User, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import api from '../../services/api';

interface RecommendedItem {
  name: string;
  price: number;
  reason: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedItems?: RecommendedItem[];
}

const SmartCartAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { title: '🍱 Bữa trưa 300k', query: 'Lên thực đơn bữa trưa cho 4 người dưới 300k' },
    { title: '🥗 Thực đơn giảm cân', query: 'Tìm các món có thể ăn kiêng giảm cân' },
    { title: '🥜 Đồ ăn nhẹ healthy', query: 'Gợi ý đồ ăn nhẹ không chứa hải sản' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/ai/customer/history');
        if (res.data && res.data.data && res.data.data.length > 0) {
          const historyMessages = res.data.data.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.role === 'user' ? msg.content : (msg.content?.message || ''),
            recommendedItems: msg.role === 'assistant' ? msg.content?.recommended_items : undefined
          }));
          
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };
    
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: any = await api.post('/ai/customer/ask', { question });
      const data = res.data.data || res.data;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        recommendedItems: data.recommended_items
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Lỗi khi gọi AI:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: RecommendedItem) => {
    alert(`Đã thêm ${item.name} vào giỏ hàng! (Chức năng gọi API giỏ hàng)`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#FAF7F3] relative overflow-hidden">
      {/* Header */}
      <div className="bg-[#FEFCF9] border-b border-[#E8D8C6] px-4 py-2 flex items-center justify-center sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF3A20] to-[#E9C46A] flex items-center justify-center shadow-inner">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#5C1A0A] leading-tight">Smart Cart Assistant</h2>
              <p className="font-mono text-[10px] font-bold text-[#9E6E4A]">Lập thực đơn bằng AI</p>
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FAF7F3] text-[#7A5235] border border-[#E8D8C6] rounded-xl font-bold hover:bg-[#E8D8C6] transition-colors shadow-sm text-sm"
            onClick={() => window.location.href = '/cart'}
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Xem Giỏ Hàng</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full texture-paper custom-scrollbar relative z-0 pb-32">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
          
          {/* Hero Section (Hiển thị khi chưa có chat) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-10 sm:pt-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#BF3A20] to-[#E9C46A] flex items-center justify-center shadow-lg mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                <Sparkles className="text-white" size={40} />
              </div>
              <h1 className="font-display font-bold text-3xl text-[#2C1A0E] mb-3 text-center">Smart Cart AI</h1>
              <p className="font-body text-[#7A5235] text-center max-w-md mb-8">
                Trợ lý mua sắm cá nhân của bạn. Lập thực đơn theo ngân sách, tính toán khẩu phần và gợi ý món ăn dinh dưỡng.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
                {suggestedQuestions.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(q.query)}
                    className="p-4 bg-[#FEFCF9] border border-[#E8D8C6] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left flex flex-col items-start gap-2 group"
                  >
                    <span className="font-bold text-[#5C1A0A] font-body text-sm">{q.title}</span>
                    <span className="text-xs text-[#9E6E4A] font-mono opacity-80 group-hover:opacity-100 transition-opacity">Nhấp để thử →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-[#E8D8C6] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-[#D0B89A]">
                  <Sparkles size={20} className="text-[#5C1A0A]" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#BF3A20] to-[#E9C46A] text-[#FEFCF9] rounded-tr-sm' 
                    : 'bg-[#FEFCF9] text-[#2C1A0E] border border-[#E8D8C6] rounded-tl-sm'
                }`}>
                  <p className="font-body whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  
                  {/* Render Recommended Items if available */}
                  {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="font-bold text-sm text-[#7A5235] uppercase tracking-widest flex items-center gap-2 font-mono">
                        <CheckCircle2 size={16} className="text-[#BF3A20]" /> 
                        Đề xuất cho bạn
                      </p>
                      {/* Grid 3 cột theo đề xuất */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {msg.recommendedItems.map((item, idx) => (
                          <div key={idx} className="bg-[#FAF7F3] border border-[#E8D8C6] p-3 rounded-xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden group">
                            {/* Dấu tem xéo */}
                            <div className="absolute -top-1 -right-4 bg-[#BF3A20] text-white font-display italic text-[10px] px-5 py-0.5 rotate-[45deg] shadow-sm z-10">
                              Ngon!
                            </div>
                            
                            <div className="flex flex-col h-full">
                              <div>
                                <h4 className="font-bold font-body text-[#2C1A0E] text-[15px] pr-4">{item.name}</h4>
                                <div className="flex text-[#E9C46A] text-[10px] mt-1 mb-2">
                                  {'★'.repeat(5)}
                                </div>
                                <p className="text-xs font-body text-[#7A5235] line-clamp-3 mb-3">{item.reason}</p>
                              </div>
                              
                              <div className="mt-auto flex items-center justify-between">
                                <span className="font-mono font-bold text-[#BF3A20]">{formatPrice(item.price)}</span>
                                <button 
                                  onClick={() => handleAddToCart(item)}
                                  className="w-8 h-8 rounded-full bg-[#E8D8C6] hover:bg-[#BF3A20] hover:text-white text-[#5C1A0A] flex items-center justify-center transition-colors"
                                  title="Thêm vào giỏ"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-[#7A5235] flex items-center justify-center flex-shrink-0 mt-1 order-2 shadow-sm border border-[#5C3A22]">
                  <User size={20} className="text-[#FEFCF9]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 w-full justify-start animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-[#E8D8C6] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-[#D0B89A]">
                <Sparkles size={20} className="text-[#5C1A0A]" />
              </div>
              <div className="bg-[#FEFCF9] border border-[#E8D8C6] rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#BF3A20] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#BF3A20] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#BF3A20] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm text-[#9E6E4A] font-mono">AI đang lập kế hoạch...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="pb-4" />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-6 left-0 w-full px-4 z-10 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl pointer-events-auto">
          <div className="relative flex items-center bg-[#FEFCF9]/90 backdrop-blur-md border border-[#E8D8C6] rounded-2xl shadow-[0_8px_30px_rgba(44,26,14,0.12)] p-2 transition-all focus-within:border-[#BF3A20] focus-within:shadow-[0_8px_30px_rgba(191,58,32,0.15)]">
            <input
              type="text"
              className="w-full pl-4 pr-14 py-3 bg-transparent focus:outline-none text-[#2C1A0E] font-body text-[15px]"
              placeholder="Nhập yêu cầu dinh dưỡng, tìm kiếm món ăn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              disabled={loading}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2.5 bg-gradient-to-r from-[#BF3A20] to-[#9E2F18] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-2 opacity-70">
            <span className="font-mono text-[10px] text-[#7A5235]">Smart Cart AI có thể mắc lỗi. Vui lòng kiểm tra lại thực đơn.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCartAssistant;
