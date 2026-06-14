import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, MessageCircle, Minus } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useSocketContext } from '../../context/SocketContext';

export const ChatWidget: React.FC = () => {
  const { isChatOpen, isMinimized, setIsMinimized, activeConversation, messages, setIsChatOpen, addMessage, setActiveConversation } = useChatStore();
  const { socket, isConnected } = useSocketContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (!socket || !activeConversation) return;

    socket.emit('join_room', activeConversation.id);

    const handleReceiveMessage = (message: any) => {
      // Nhận tin nhắn và thêm vào state nếu thuộc conversation hiện tại
      if (message.conversationId === activeConversation.id) {
        addMessage(message);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_room', activeConversation.id);
    };
  }, [socket, activeConversation]);

  if (!isChatOpen || !activeConversation) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-[#BF3A20] text-white rounded-full flex items-center justify-center cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2 border-neutral-900 z-[100] hover:-translate-y-1 transition-transform"
      >
        <MessageCircle size={28} />
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket || !isConnected) return;

    socket.emit('send_message', {
      conversationId: activeConversation.id,
      senderType: 'USER',
      text: text.trim()
    });

    setText('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white border-2 border-neutral-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-sm flex flex-col z-[100] h-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#BF3A20] text-white p-3 border-b-2 border-neutral-900 rounded-t-sm">
        <div className="flex items-center gap-2">
          {activeConversation.restaurant?.logo ? (
            <img src={activeConversation.restaurant.logo} alt="Logo" className="w-8 h-8 rounded-full border border-white bg-white" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#BF3A20] font-bold">
              {activeConversation.restaurant?.name?.charAt(0) || 'R'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">{activeConversation.restaurant?.name || 'Nhà hàng'}</span>
            <span className="text-[10px] opacity-80">{isConnected ? '● Đang online' : '○ Mất kết nối'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="hover:bg-white/20 p-1 rounded-sm transition-colors">
            <Minus size={18} />
          </button>
          <button onClick={() => { setIsChatOpen(false); setActiveConversation(null); }} className="hover:bg-white/20 p-1 rounded-sm transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FEFCF9] text-base">
        {messages.map((msg, index) => {
          const isMine = msg.senderType === 'USER';
          return (
            <div key={msg.id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-md px-3 py-2 ${isMine ? 'bg-[#BF3A20] text-white border-2 border-[#BF3A20] shadow-sm' : 'bg-white text-neutral-800 border-2 border-neutral-200 shadow-sm'}`}>
                {msg.text && <p className="break-words">{msg.text}</p>}
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="attached" className="max-w-full rounded-sm mt-1" />
                )}
                <div className={`text-[10px] mt-1 ${isMine ? 'text-white/70 text-right' : 'text-neutral-400'}`}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t-2 border-neutral-200 flex gap-2">
        <button type="button" className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors">
          <ImageIcon size={20} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border-2 border-neutral-300 rounded-sm px-3 py-1.5 focus:border-[#BF3A20] focus:outline-none text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || !isConnected}
          className="bg-[#BF3A20] text-white p-2 rounded-sm disabled:opacity-50 hover:bg-[#A3301A] transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
