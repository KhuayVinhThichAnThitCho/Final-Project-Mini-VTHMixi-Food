import React, { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { Send, Image as ImageIcon, MessageSquare } from 'lucide-react';
import api from '../../services/api';

interface Conversation {
  id: string;
  userId: string;
  restaurantId: string;
  lastMessageAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderType: 'USER' | 'VENDOR';
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

export const VendorChat: React.FC = () => {
  const { socket, isConnected } = useSocketContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res: any = await api.get('/chats/vendor');
        if (res.success) {
          setConversations(res.data);
        }
      } catch (error) {
        console.error('Failed to load conversations', error);
      }
    };
    fetchConversations();
  }, []);

  const loadMessages = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    try {
      const res: any = await api.get(`/chats/${conversation.id}/messages`);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeConversation) return;

    socket.emit('join_room', activeConversation.id);

    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId === activeConversation.id) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update conversations list order
      setConversations((prev) => {
        const index = prev.findIndex(c => c.id === message.conversationId);
        if (index > -1) {
          const updated = [...prev];
          updated[index].lastMessageAt = message.createdAt;
          return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        }
        return prev;
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_room', activeConversation.id);
    };
  }, [socket, activeConversation]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket || !isConnected || !activeConversation) return;

    socket.emit('send_message', {
      conversationId: activeConversation.id,
      senderType: 'VENDOR',
      text: text.trim()
    });

    setText('');
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-52px)] md:h-[calc(100vh-72px)] min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-modern animate-fade-in overflow-hidden">
      {/* Sidebar - Danh sách khách hàng */}
      <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-lg text-gray-800">Tin nhắn khách hàng</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-8 text-sm text-gray-500 text-center font-medium">Không có cuộc hội thoại nào</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadMessages(conv)}
                className={`flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all ${
                  activeConversation?.id === conv.id ? 'bg-primary-50/50 border-l-4 border-l-primary-500' : 'hover:bg-white border-l-4 border-l-transparent'
                }`}
              >
                {conv.user.avatar ? (
                  <img src={conv.user.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm">
                    {conv.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base truncate ${activeConversation?.id === conv.id ? 'text-primary-700' : 'text-gray-800'}`}>{conv.user.name}</h3>
                  <p className="text-xs text-gray-500 truncate font-medium mt-0.5">
                    {new Date(conv.lastMessageAt).toLocaleString('vi-VN', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {activeConversation.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{activeConversation.user.name}</h3>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang hoạt động
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gray-50/30">
              {messages.map((msg, idx) => {
                const isMine = msg.senderType === 'VENDOR';
                return (
                  <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                      isMine 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text && <p className="text-[15px] break-words leading-relaxed">{msg.text}</p>}
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="attached" className="max-w-full rounded-xl mt-2 border border-black/10" />
                      )}
                      <div className={`text-[10px] mt-2 font-medium ${isMine ? 'text-primary-100 text-right' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
              <button type="button" className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors rounded-xl">
                <ImageIcon size={22} />
              </button>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!text.trim() || !isConnected}
                className="bg-primary-600 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-primary-700 transition-all active:scale-[0.95] flex items-center justify-center shadow-modern-sm"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <p className="font-medium text-gray-500 text-lg">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorChat;
