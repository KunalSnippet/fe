import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { getUserChats, searchUsers, ApiChat, ApiUser } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Navbar } from '../components/layout/navbar';
import { Search, MessageCircle, Users, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const { currentChat, setCurrentChat, onlineUsers } = useChat();
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [userId]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const userChats = await getUserChats(userId);
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewChat = (user: ApiUser) => {
    // Create a new chat object for the UI
    const newChat: ApiChat = {
      _id: `temp-${Date.now()}`,
      participants: [
        { _id: userId, name: 'You', email: '', alias: '' },
        { _id: user.id, name: user.name, email: user.email, alias: user.alias }
      ],
      messages: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentChat(newChat);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getOtherParticipant = (chat: ApiChat) => {
    return chat.participants.find(p => p._id !== userId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-card-foreground">
            <MessageCircle className="h-5 w-5 text-primary" />
            Messages
          </h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background border-border focus:ring-primary"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="border-b border-border">
            <div className="p-2 text-sm font-medium text-muted-foreground bg-muted">
              Search Results
            </div>
            <ScrollArea className="h-32">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border transition-smooth hover-lift"
                    onClick={() => startNewChat(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-card-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {isUserOnline(user.id) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-glow"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No conversations yet</p>
              <p className="text-sm">Search for users to start chatting</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              if (!otherUser) return null;

              return (
                <div
                  key={chat._id}
                  className={`p-4 border-b border-border cursor-pointer transition-smooth hover-lift ${
                    currentChat?._id === chat._id 
                      ? 'bg-primary/10 border-primary/20 shadow-glow' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">{otherUser.name[0]}</AvatarFallback>
                      </Avatar>
                      {isUserOnline(otherUser._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full shadow-glow"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate text-card-foreground">{otherUser.name}</p>
                        {chat.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs shadow-glow">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <ChatWindow chat={currentChat} userId={userId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Chat Window Component
interface ChatWindowProps {
  chat: ApiChat;
  userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, userId }) => {
  const { sendMessage, markAsRead, startTyping, stopTyping, typingUsers, onlineUsers } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

  const otherUser = chat.participants.find(p => p._id !== userId);
  const isOtherUserTyping = otherUser ? typingUsers.get(otherUser._id) : false;

  useEffect(() => {
    // Mark messages as read when chat is opened
    if (chat._id && chat._id !== 'temp') {
      markAsRead(chat._id, userId);
    }
  }, [chat._id, userId, markAsRead]);

  const handleSendMessage = () => {
    if (!message.trim() || !otherUser) return;

    sendMessage({
      senderId: userId,
      receiverId: otherUser._id,
      content: message.trim(),
      messageType: 'text'
    });

    setMessage('');
    stopTyping(chat._id, userId, otherUser._id);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!otherUser) return;

    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping(chat._id, userId, otherUser._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(chat._id, userId, otherUser._id);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">{otherUser?.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-card-foreground">{otherUser?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {otherUser && onlineUsers.has(otherUser._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-background">
        <div className="space-y-4">
          {chat.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            chat.messages.map((msg) => {
              const isOwn = msg.sender._id === userId;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-smooth hover-lift ${
                      isOwn
                        ? 'gradient-primary text-primary-foreground shadow-glow'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                    }`}>
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {isOtherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 pr-20">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-background border-border focus:ring-primary"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
            className="gradient-primary text-primary-foreground shadow-glow hover-glow transition-smooth"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
