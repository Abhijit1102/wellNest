'use client';

import { ChatMessage } from '@/lib/types';
import { useRef, useEffect } from 'react';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  scrollRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export function ChatMessages({ messages, isLoading, scrollRef }: ChatMessagesProps) {
  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, scrollRef]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground h-full flex flex-col justify-center">
          <div className="text-5xl sm:text-6xl mb-4">👋</div>
          <p className="mb-2 sm:mb-4 text-base sm:text-lg text-foreground font-medium">
            Welcome! I&apos;m your AI wellness companion.
          </p>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base">How can I support you today?</p>
          <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 bg-primary/5 border-2 border-primary/20 rounded-lg p-4 sm:p-6 inline-block">
            <p className="font-bold text-foreground text-sm sm:text-base">Try asking me about:</p>
            <ul className="text-muted-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>• How to manage stress and anxiety</li>
              <li>• Building healthy daily habits</li>
              <li>• Understanding your emotions</li>
              <li>• Mindfulness and meditation techniques</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm ${
                  msg.is_user
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-primary/5 text-foreground border-2 border-primary/20'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.is_user ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-primary/5 text-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-primary/20">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </>
      )}
    </div>
  );
}
