import { create } from 'zustand';

export interface MessageType {
  id: string;
  conversationId: string;
  senderType: 'USER' | 'VENDOR';
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ConversationType {
  id: string;
  userId: string;
  restaurantId: string;
  lastMessageAt: string;
  restaurant?: {
    id: string;
    name: string;
    logo?: string;
  };
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ChatStore {
  activeConversation: ConversationType | null;
  messages: MessageType[];
  conversations: ConversationType[];
  isChatOpen: boolean;
  isMinimized: boolean;
  setActiveConversation: (conversation: ConversationType | null) => void;
  setMessages: (messages: MessageType[]) => void;
  addMessage: (message: MessageType) => void;
  setConversations: (conversations: ConversationType[]) => void;
  setIsChatOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversation: null,
  messages: [],
  conversations: [],
  isChatOpen: false,
  isMinimized: false,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setConversations: (conversations) => set({ conversations }),
  
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
}));

export default useChatStore;
