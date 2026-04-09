'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { chatApi } from '@/lib/api';
import { ChatMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WellnestChatWindowProps {
  conversationId: string;
}

export function WellnestChatWindow({ conversationId }: WellnestChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    'How can I manage stress and anxiety?',
    'Help me build healthier daily habits',
    'I need help understanding my emotions',
    'Teach me a quick mindfulness technique',
  ];

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;
    setIsFetchingHistory(true);
    setMessages([]);
    try {
      const res = await chatApi.getConversation(conversationId);
      if (res.success && res.data) {
        const data = res.data as any;
        const history: ChatMessage[] = data.messages ?? [];
        setMessages(history);
      }
    } catch (err) {
      console.error('[ChatWindow] Failed to load history:', err);
    } finally {
      setIsFetchingHistory(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      conversation_id: conversationId,
      user_id: '',
      content: text,
      is_user: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(conversationId, text);
      if (res.success && res.data) {
        const aiData = res.data as any;
        const aiMsg: ChatMessage = {
          id: `${Date.now()}-ai`,
          conversation_id: conversationId,
          user_id: '',
          content:
            aiData.content || aiData.message || `I'm here to support you. Could you tell me more?`,
          is_user: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('[ChatWindow] Failed to send message:', err);
      const errMsg: ChatMessage = {
        id: `${Date.now()}-err`,
        conversation_id: conversationId,
        user_id: '',
        content: '⚠️ Something went wrong. Please try again.',
        is_user: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full bg-background border-border overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isFetchingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-sm px-6">
              {/* Avatar */}
              <div className="relative mx-auto w-16 h-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground font-playfair">
                  Your Wellness Companion
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm here to support your mental wellbeing. Share what's on your mind or try one of these:
                </p>
              </div>
              {/* Suggestion chips */}
              <div className="grid grid-cols-1 gap-2 text-left">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left text-xs px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-150 text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 lg:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={cn(
                    'max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.is_user
                      ? 'bg-primary text-primary-foreground rounded-tr-none shadow-md'
                      : 'bg-primary/5 text-foreground border border-primary/20 rounded-tl-none'
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1.5',
                      msg.is_user ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-primary/5 border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-2 items-center">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 lg:p-5 bg-background/80 backdrop-blur-sm">
        <div className="relative flex items-end gap-3 bg-muted/50 rounded-2xl border border-border focus-within:border-primary/50 focus-within:bg-background transition-all duration-200 px-4 py-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind… (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
            className={cn(
              'flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm',
              'min-h-[24px] max-h-[160px] leading-6'
            )}
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={cn(
              'shrink-0 h-9 w-9 rounded-xl transition-all duration-200',
              input.trim() && !isLoading
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          💚 WellNest AI supports your wellness journey — not a replacement for professional help.
        </p>
      </div>
    </Card>
  );
}
