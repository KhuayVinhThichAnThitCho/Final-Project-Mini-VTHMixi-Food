import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
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
  const { user } = useAuthStore();
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
    <div className="flex flex-col md:flex-row h-[75vh] bg-white border-2 border-neutral-900 shadow-retro">
      {/* Sidebar - Danh sách khách hàng */}
      <div className="w-full md:w-1/3 border-r-2 border-neutral-900 flex flex-col bg-[#FEFCF9]">
        <div className="p-4 border-b-2 border-neutral-900 bg-[#BF3A20] text-white">
          <h2 className="font-bold font-mono">Tin nhắn khách hàng</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-sm text-neutral-500 font-mono text-center">Không có cuộc hội thoại nào</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadMessages(conv)}
                className={`flex items-center gap-3 p-4 border-b border-neutral-200 cursor-pointer transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-amber-100' : 'hover:bg-neutral-100'
                }`}
              >
                {conv.user.avatar ? (
                  <img src={conv.user.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-neutral-300 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold border border-neutral-300">
                    {conv.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-neutral-900 truncate">{conv.user.name}</h3>
                  <p className="text-xs text-neutral-500 truncate">
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
      <div className="w-full md:w-2/3 flex flex-col bg-[#FEFCF9]">
        {activeConversation ? (
          <>
            <div className="p-4 border-b-2 border-neutral-900 flex items-center gap-3 bg-white">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold">
                {activeConversation.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">{activeConversation.user.name}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.senderType === 'VENDOR';
                return (
                  <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-md px-4 py-2 ${isMine ? 'bg-[#BF3A20] text-white border border-[#BF3A20]' : 'bg-neutral-100 text-neutral-900 border border-neutral-300'}`}>
                      {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="attached" className="max-w-full rounded-sm mt-1 border border-neutral-200" />
                      )}
                      <div className={`text-[10px] mt-1 ${isMine ? 'text-white/70 text-right' : 'text-neutral-500'}`}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t-2 border-neutral-900 flex gap-2">
              <button type="button" className="p-2 text-neutral-500 hover:text-[#BF3A20] transition-colors border-2 border-neutral-300 rounded-sm">
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border-2 border-neutral-900 rounded-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#BF3A20] font-body text-sm"
              />
              <button
                type="submit"
                disabled={!text.trim() || !isConnected}
                className="bg-[#BF3A20] text-white p-2 rounded-sm border-2 border-neutral-900 disabled:opacity-50 hover:bg-[#A3301A] transition-colors flex items-center justify-center min-w-[50px]"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="font-mono text-sm">Chọn một cuộc hội thoại để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorChat;
