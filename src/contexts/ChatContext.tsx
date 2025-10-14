import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ApiChat } from '../lib/api';
import { sendMessage as sendMessageApi } from '../lib/api';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentChat: ApiChat | null;
  setCurrentChat: (chat: ApiChat | null) => void;
  sendMessage: (data: { senderId: string; receiverId: string; content: string; messageType?: 'text' | 'image' | 'file' }) => void;
  markAsRead: (chatId: string, userId: string, messageId?: string) => void;
  startTyping: (chatId: string, userId: string, receiverId: string) => void;
  stopTyping: (chatId: string, userId: string, receiverId: string) => void;
  onlineUsers: Set<string>;
  typingUsers: Map<string, boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState<ApiChat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!userId) return;

    // Resolve backend base URL for socket connection across environments
    const resolveSocketBaseUrl = () => {
      const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
      if (envUrl && /^https?:\/\//i.test(envUrl)) {
        return envUrl.replace(/\/$/, '');
      }
      // In production without VITE_API_URL, fallback to deployed backend used by REST
      if ((import.meta as any).env?.PROD) {
        return 'https://bwp-back-1.onrender.com';
      }
      // Local development
      return 'http://localhost:5000';
    };

    // Initialize socket connection
    const newSocket = io(resolveSocketBaseUrl(), {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 [CHAT] Connected to server');
      setIsConnected(true);
      newSocket.emit('join-chat', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [CHAT] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ [CHAT] Socket connection error:', err?.message || err);
    });

    newSocket.on('chat-status', (data) => {
      console.log('📱 [CHAT] Status:', data);
    });

    newSocket.on('user-online', (data) => {
      console.log('👤 [CHAT] User online:', data.userId);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    newSocket.on('online-users', (data: { users: string[] }) => {
      console.log('🟢 [CHAT] Online users list:', data.users);
      setOnlineUsers(new Set(data.users));
    });

    newSocket.on('user-offline', (data) => {
      console.log('👋 [CHAT] User offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    newSocket.on('receive-message', (data) => {
      console.log('💬 [CHAT] Received message:', data);
      // Handle incoming message
      if (currentChat && data.chatId === currentChat._id) {
        setCurrentChat(data.chat);
      }
    });

    newSocket.on('message-sent', (data) => {
      console.log('✅ [CHAT] Message sent:', data);
      // Update current chat with sent message
      // Always set to server chat; this also replaces temp chat with real id
      if (data?.chat) setCurrentChat(data.chat);
    });

    newSocket.on('message-error', (error) => {
      console.error('❌ [CHAT] Message error:', error);
    });

    newSocket.on('messages-read', (data) => {
      console.log('👀 [CHAT] Messages read:', data);
      // Handle read receipts
    });

    newSocket.on('user-typing', (data) => {
      console.log('⌨️ [CHAT] User typing:', data);
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data.isTyping);
        return newMap;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const sendMessage = async (data: { senderId: string; receiverId: string; content: string; messageType?: 'text' | 'image' | 'file' }) => {
    if (socket && isConnected) {
      socket.emit('send-message', data);
      return;
    }
    // Fallback to REST if socket isn't connected
    try {
      const result = await sendMessageApi(data);
      if (currentChat && result.chat && result.chat._id === currentChat._id) {
        setCurrentChat(result.chat);
      }
      console.log('✅ [CHAT] Message sent via REST fallback');
    } catch (e) {
      console.error('❌ [CHAT] Failed to send message via REST fallback:', e);
    }
  };

  const markAsRead = (chatId: string, userId: string, messageId?: string) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { chatId, userId, messageId });
    }
  };

  const startTyping = (chatId: string, userId: string, receiverId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { chatId, userId, receiverId });
    }
  };

  const stopTyping = (chatId: string, userId: string, receiverId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { chatId, userId, receiverId });
    }
  };

  const value: ChatContextType = {
    socket,
    isConnected,
    currentChat,
    setCurrentChat,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onlineUsers,
    typingUsers,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
