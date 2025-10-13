import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { getUnreadCount } from '../lib/api';

interface ChatNotificationProps {
  userId: string;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const { unreadCount: count } = await getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="relative">
        <MessageCircle className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="relative">
      <MessageCircle className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default ChatNotification;
