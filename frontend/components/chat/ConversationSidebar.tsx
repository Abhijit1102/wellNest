'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { chatApi } from '@/lib/api';
import { ChatConversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ConversationSidebar({
  collapsed,
  onToggleCollapse,
}: ConversationSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const activeId = params?.conversationId as string | undefined;
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        const data = res.data as any;
        const list: ChatConversation[] = Array.isArray(data) ? data : data.conversations ?? [];
        list.sort(
          (a, b) =>
            new Date(b.updated_at ?? b.created_at).getTime() -
            new Date(a.updated_at ?? a.created_at).getTime()
        );
        setConversations(list);
      }
    } catch (err) {
      console.error('[Sidebar] Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
  if (redirectTo) {
    router.push(redirectTo);
    setRedirectTo(null);
  }
}, [redirectTo, router]);

  const handleNewConversation = async () => {
    setCreatingNew(true);
    try {
      const res = await chatApi.createConversation();
      if (res.success && res.data) {
        const data = res.data as any;
        const id: string = data.id || data.conversation_id;
        await loadConversations();
        router.push(`/chat/${id}`);
      }
    } catch (err) {
      console.error('[Sidebar] Failed to create conversation:', err);
    } finally {
      setCreatingNew(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
      e.stopPropagation();
      e.preventDefault();

      if (!window.confirm('Delete this conversation?')) return;

      try {
        await chatApi.deleteConversation(convId);

        const updated = conversations.filter((c) => c.id !== convId);
        setConversations(updated);

        // ✅ SAFE: only set state, DO NOT navigate here
        if (activeId === convId) {
          if (updated.length > 0) {
            setRedirectTo(`/chat/${updated[0].id}`);
          } else {
            setRedirectTo('/chat');
          }
        }

      } catch (err) {
        console.error('[Sidebar] Failed to delete conversation:', err);
      }
    };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Group by relative date
  const grouped = conversations.reduce<Record<string, ChatConversation[]>>(
    (acc, c) => {
      const label = formatDate(c.updated_at ?? c.created_at);
      if (!acc[label]) acc[label] = [];
      acc[label].push(c);
      return acc;
    },
    {}
  );

  return (
    <div
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-0 opacity-0' : 'w-72 opacity-100'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-sidebar-foreground">
            Conversations
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleNewConversation}
            disabled={creatingNew}
            className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
            title="New conversation"
          >
            {creatingNew ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
            title="Collapse"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={handleNewConversation}
            >
              <Plus className="h-3 w-3 mr-1" /> Start chatting
            </Button>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, group]) => (
            <div key={dateLabel} className="mb-2">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {dateLabel}
              </p>
              {group.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className={cn(
                    'group relative mx-2 mb-0.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150',
                    activeId === conv.id
                      ? 'bg-primary/15 border border-primary/30 shadow-sm'
                      : 'hover:bg-sidebar-primary/10 border border-transparent'
                  )}
                >
                  <p
                    className={cn(
                      'text-xs font-medium truncate pr-9',
                      activeId === conv.id
                        ? 'text-primary'
                        : 'text-sidebar-foreground/80'
                    )}
                  >
                    {conv.title ?? `Chat ${conv.id.slice(0, 8)}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {formatDate(conv.updated_at ?? conv.created_at)}
                  </p>

                  {/* Delete button on hover */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, conv.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground text-center">
        <p className="font-medium text-primary/70">WellNest AI</p>
        <p className="text-[10px] mt-0.5">Your wellness companion</p>
      </div>
    </div>
  );
}

/** Expand toggle shown when sidebar is collapsed */
export function ConversationSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground border border-border rounded-lg"
      title="Open conversations"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
