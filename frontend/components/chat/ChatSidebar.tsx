'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Conversation {
  id: string;
  created_at: string;
  preview?: string;
}

interface ChatSidebarProps {
  currentConversationId?: string;
  onNewChat?: () => void;
}

export function ChatSidebar({ currentConversationId, onNewChat }: ChatSidebarProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage (mock)
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // For now, load from localStorage (mock storage)
      const stored = localStorage.getItem('wellnest_conversations');
      if (stored) {
        const convs = JSON.parse(stored);
        // Sort by creation date, newest first
        convs.sort((a: Conversation, b: Conversation) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setConversations(convs);
      }
    } catch (err) {
      console.error('[Sidebar] Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
    router.push('/chat');
  };

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Delete this conversation?')) {
      try {
        // Remove from localStorage
        const stored = localStorage.getItem('wellnest_conversations');
        if (stored) {
          const convs = JSON.parse(stored);
          const filtered = convs.filter((c: Conversation) => c.id !== conversationId);
          localStorage.setItem('wellnest_conversations', JSON.stringify(filtered));
          setConversations(filtered);
        }

        // If viewing deleted conversation, redirect to chat
        if (currentConversationId === conversationId) {
          router.push('/chat');
        }
      } catch (err) {
        console.error('[Sidebar] Failed to delete conversation:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewChat}
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  currentConversationId === conv.id
                    ? 'bg-primary/20 border border-primary/40 text-foreground'
                    : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium truncate">
                        Chat {conv.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-xs mt-1 opacity-70">
                      {formatDate(conv.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
        <p>WellNest AI</p>
        <p className="text-[10px] mt-1">Your wellness companion</p>
      </div>
    </div>
  );
}
