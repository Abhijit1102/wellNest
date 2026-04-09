'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ConversationSidebar, ConversationSidebarToggle } from '@/components/chat/ConversationSidebar';
import { WellnestChatWindow } from '@/components/chat/WellnestChatWindow';
import { HeartHandshake } from 'lucide-react';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-full overflow-hidden -m-6">
      {/* Conversation sidebar */}
      <ConversationSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(true)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-4 lg:p-6 gap-3">
        {/* Header row */}
        <div className="flex items-center gap-3 shrink-0">
          {sidebarCollapsed && (
            <ConversationSidebarToggle onClick={() => setSidebarCollapsed(false)} />
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <HeartHandshake className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-playfair">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Wellness Chat
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                A safe space to share your thoughts and receive supportive guidance
              </p>
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 min-h-0">
          <WellnestChatWindow conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
