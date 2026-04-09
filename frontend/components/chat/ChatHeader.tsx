'use client';

import { MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  conversationId?: string;
  isStarting?: boolean;
}

export function ChatHeader({ conversationId, isStarting = false }: ChatHeaderProps) {
  return (
    <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="p-2.5 bg-primary rounded-xl shadow-lg flex-shrink-0">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground font-playfair">
            AI Wellness Coach
          </h1>
          <p className="text-muted-foreground text-xs sm:text-base font-roboto-condensed mt-1">
            {isStarting 
              ? 'Start a conversation with your personal AI wellness companion'
              : `Chat ID: ${conversationId?.slice(0, 8)}...`}
          </p>
        </div>
      </div>
    </div>
  );
}
