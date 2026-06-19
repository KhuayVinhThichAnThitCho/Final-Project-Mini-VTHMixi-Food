import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chartData?: any[];
  chartType?: string;
  chartTitle?: string;
  actionableAdvice?: string[];
}

const VendorCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là **AI Co-pilot** chuyên gia phân tích dữ liệu của bạn. Tôi đã được cung cấp quyền đọc dữ liệu doanh thu và đánh giá của quán bạn. Bạn muốn tôi phân tích điều gì hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Đánh giá hiệu quả kinh doanh tuần qua",
    "Tại sao khách hàng hay phàn nàn dạo gần đây?",
    "Doanh thu hôm qua thấp là do đâu?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/ai/copilot/history');
        if (res.data && res.data.data && res.data.data.length > 0) {
          const historyMessages = res.data.data.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.role === 'user' ? msg.content : (msg.content?.insight || ''),
            actionableAdvice: msg.role === 'assistant' ? msg.content?.actionable_advice : undefined,
            chartData: msg.role === 'assistant' ? msg.content?.chart_data : undefined,
            chartType: msg.role === 'assistant' ? msg.content?.chart_type : undefined,
            chartTitle: msg.role === 'assistant' ? msg.content?.chart_title : undefined
          }));
          
          setMessages(prev => {
            // Keep the welcome message as the first item, append history
            return [prev[0], ...historyMessages];
          });
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
      const res: any = await api.post('/ai/copilot/ask', { question });
      const data = res.data;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.insight,
        actionableAdvice: data.actionable_advice,
        chartData: data.chart_data,
        chartType: data.chart_type || 'bar',
        chartTitle: data.chart_title
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

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-[#FAF7F3] rounded-xl overflow-hidden border border-[#E8D8C6] shadow-card">
      {/* Header */}
      <div className="bg-[#FEFCF9] border-b border-[#E8D8C6] p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF3A20] to-[#E9C46A] flex items-center justify-center shadow-inner">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-[#5C1A0A]">Analytics Co-pilot</h2>
          <p className="text-xs font-mono text-[#9E6E4A]">Trợ lý AI phân tích kinh doanh</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#E8D8C6] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-[#5C1A0A]" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#BF3A20] text-[#FEFCF9] rounded-tr-sm' 
                  : 'bg-[#FEFCF9] text-[#2C1A0E] border border-[#E8D8C6] rounded-tl-sm'
              }`}>
                <p className="font-body whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {/* Render Chart if available */}
                {msg.chartData && msg.chartData.length > 0 && (
                  <div className="mt-4 w-full bg-white p-3 rounded-lg border border-gray-100">
                    {msg.chartTitle && (
                      <h4 className="text-center text-sm font-bold text-[#5C1A0A] mb-2">{msg.chartTitle}</h4>
                    )}
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {msg.chartType === 'pie' ? (
                          <PieChart>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#FEFCF9', border: '1px solid #E8D8C6', borderRadius: '8px' }}
                              itemStyle={{ color: '#BF3A20', fontWeight: 'bold' }}
                            />
                            <Pie 
                              data={msg.chartData} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={60}
                              label
                            >
                              {msg.chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#BF3A20' : '#E9C46A'} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                        ) : msg.chartType === 'line' ? (
                          <LineChart data={msg.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D8C6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9E6E4A', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9E6E4A', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#FEFCF9', border: '1px solid #E8D8C6', borderRadius: '8px' }}
                              itemStyle={{ color: '#BF3A20', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#BF3A20" strokeWidth={3} dot={{ fill: '#BF3A20', r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={msg.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D8C6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9E6E4A', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9E6E4A', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#FEFCF9', border: '1px solid #E8D8C6', borderRadius: '8px' }}
                              itemStyle={{ color: '#BF3A20', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {msg.chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#BF3A20' : '#E9C46A'} />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Render Actionable Advice */}
                {msg.actionableAdvice && msg.actionableAdvice.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E8D8C6]">
                    <p className="font-bold text-[#7A5235] text-sm mb-2 flex items-center gap-1">
                      <TrendingUp size={14} /> Chiến lược đề xuất:
                    </p>
                    <ul className="space-y-2">
                      {msg.actionableAdvice.map((advice, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2 bg-[#FAF7F3] p-2 rounded-md">
                          <span className="text-[#BF3A20] font-bold mt-0.5">•</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#7A5235] flex items-center justify-center flex-shrink-0 mt-1 order-2">
                <User size={16} className="text-[#FEFCF9]" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#E8D8C6] flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-[#5C1A0A]" />
            </div>
            <div className="bg-[#FEFCF9] border border-[#E8D8C6] rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm">
              <Loader2 className="animate-spin text-[#BF3A20]" size={16} />
              <span className="text-sm text-[#9E6E4A] font-mono">Đang phân tích dữ liệu...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#FEFCF9] border-t border-[#E8D8C6]">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-mono px-3 py-1.5 bg-[#FAF7F3] text-[#7A5235] border border-[#E8D8C6] rounded-full hover:bg-[#E8D8C6] transition-colors"
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-white border-2 border-[#E8D8C6] rounded-xl focus:outline-none focus:border-[#BF3A20] transition-colors shadow-inner font-body"
            placeholder="Hỏi bất kỳ điều gì về doanh thu, đánh giá, tỷ lệ chuyển đổi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            disabled={loading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-[#BF3A20] text-white rounded-lg hover:bg-[#A02D16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorCopilot;
