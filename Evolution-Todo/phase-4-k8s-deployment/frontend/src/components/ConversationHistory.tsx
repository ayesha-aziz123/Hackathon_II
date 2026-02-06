'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatKitConfig } from './chatkit/ChatKitProvider';
import {
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  ChevronLeft,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

interface Conversation {
  id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationHistoryProps {
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onCreateNewConversation: () => void;
  onClose: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  currentConversationId,
  onSelectConversation,
  onCreateNewConversation,
  onClose
}) => {
  const config = useChatKitConfig();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();

    // Auto-refresh on window focus
    const handleFocus = () => {
      fetchConversations();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Clean up expired cache entries (run periodically)
  const cleanupExpiredCache = () => {
    const now = Date.now();
    const cachePrefix = 'conversations_';

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(cachePrefix)) {
        try {
          const cachedData = JSON.parse(localStorage.getItem(key)!);
          // Remove cache if older than 1 hour
          if (now - cachedData.timestamp > 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // If parsing fails, remove the corrupted cache entry
          localStorage.removeItem(key);
        }
      }
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Clean up expired cache entries periodically
      cleanupExpiredCache();

      // Try to load from localStorage cache first to prevent flicker
      const cachedConversations = localStorage.getItem(`conversations_${config.userId}`);
      if (cachedConversations) {
        try {
          const parsedCached = JSON.parse(cachedConversations);
          // Check if cache is less than 5 minutes old
          const cacheTime = parsedCached.timestamp;
          const now = Date.now();
          if (now - cacheTime < 5 * 60 * 1000) { // 5 minutes
            setConversations(parsedCached.data);
          }
        } catch (e) {
          console.error('Failed to parse cached conversations:', e);
        }
      }

      // Direct API call to get fresh data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/${config.userId}/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Direct API call error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.data?.conversations) {
        setConversations(data.data.conversations);

        // Cache the fresh data
        const cacheData = {
          data: data.data.conversations,
          timestamp: Date.now()
        };
        try {
          localStorage.setItem(`conversations_${config.userId}`, JSON.stringify(cacheData));
        } catch (e) {
          console.error('Failed to cache conversations:', e);
        }
      } else {
        setConversations([]);
        // Clear cache if API returns no data
        localStorage.removeItem(`conversations_${config.userId}`);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);

      // If there's cached data and we failed to fetch, use the cache
      const cachedConversations = localStorage.getItem(`conversations_${config.userId}`);
      if (cachedConversations) {
        try {
          const parsedCached = JSON.parse(cachedConversations);
          // Check if cache is less than 30 minutes old
          const cacheTime = parsedCached.timestamp;
          const now = Date.now();
          if (now - cacheTime < 30 * 60 * 1000) { // 30 minutes
            setConversations(parsedCached.data);
          }
        } catch (e) {
          console.error('Failed to parse cached conversations:', e);
        }
      }

      if (err instanceof Error) {
        setError(`Failed to load conversations: ${err.message}`);
      } else {
        setError('Failed to load conversations: Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        // Direct API call to test the endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/${config.userId}/conversations/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        if (id === currentConversationId) {
          onSelectConversation(0); // Switch to new conversation
        }
        fetchConversations(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={onCreateNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-gray-500 dark:text-gray-400">Loading conversations...</div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      )}

      {/* Conversations List */}
      {!loading && !error && (
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to see it here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conv.title}
                      </h3>
                      {!conv.is_active && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(conv.updated_at)}</span>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Messages auto-expire after 2 days</span>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;