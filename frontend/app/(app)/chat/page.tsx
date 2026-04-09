'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

/**
 * /chat index page:
 * - Loads existing conversations
 * - If any exist → redirect to the most recently updated one
 * - If none      → create a fresh conversation and redirect to it
 */
export default function ChatIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await chatApi.getConversations();
        if (res.success && res.data) {
          const data = res.data as any;
          const list = Array.isArray(data) ? data : data.conversations ?? [];
          if (list.length > 0) {
            // Sort newest first
            list.sort(
              (a: any, b: any) =>
                new Date(b.updated_at ?? b.created_at).getTime() -
                new Date(a.updated_at ?? a.created_at).getTime()
            );
            router.replace(`/chat/${list[0].id}`);
            return;
          }
        }
        // No conversations — create one
        const newRes = await chatApi.createConversation();
        if (newRes.success && newRes.data) {
          const newData = newRes.data as any;
          const id: string =
              newData.session_id || newData.id || newData.conversation_id;
          router.replace(`/chat/${id}`);
        }
      } catch (err) {
        console.error('[Chat] Failed to bootstrap chat:', err);
      }
    };

    bootstrap();
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading your conversations…</p>
      </div>
    </div>
  );
}
