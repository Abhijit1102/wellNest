'use client';

import { useState, useEffect, useRef } from 'react';
import { chatApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/lib/types';
import { Send, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Create a new conversation
      const response = await chatApi.createConversation();
      if (response.success && response.data) {
        const convData = response.data as any;
        setConversationId(convData.id);
        setMessages([]);
      }
    } catch (err) {
      console.error('[v0] Failed to initialize chat:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversationId || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      user_id: '',
      content: inputMessage,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(conversationId, inputMessage);
      if (response.success && response.data) {
        const aiData = response.data as any;
        const aiMessage: ChatMessage = {
          id: Date.now().toString() + '1',
          conversation_id: conversationId,
          user_id: '',
          content: aiData.content || aiData.message || 'I understand. How can I help you further?',
          is_user: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('[v0] Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40">
      {/* Header - Fixed Height */}
      <div className="flex-shrink-0 border-b border-emerald-100 bg-white/50 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200 flex-shrink-0">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-playfair">
              AI Wellness Coach
            </h1>
            <p className="text-muted-foreground text-xs sm:text-base font-roboto-condensed mt-1">
              Chat with your personal AI wellness companion
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container - Flexible */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4">
        {/* Chat Card */}
        <Card className="border-2 border-emerald-200 h-full flex flex-col overflow-hidden shadow-lg">
          <CardHeader className="border-b-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50 flex-shrink-0 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-playfair text-emerald-900">
              <div className="p-1.5 bg-emerald-500 rounded-full flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Wellness Chat
            </CardTitle>
            <CardDescription className="text-emerald-700/70 text-xs sm:text-sm">
              A safe space to share your thoughts and receive supportive guidance
            </CardDescription>
          </CardHeader>

          {isInitializing ? (
            <CardContent className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                </div>
                <p className="text-muted-foreground font-medium text-sm sm:text-base">Initializing your wellness chat...</p>
              </div>
            </CardContent>
          ) : (
            <>
              {/* Messages Area - Scrollable */}
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground h-full flex flex-col justify-center">
                      <div className="text-5xl sm:text-6xl mb-4">👋</div>
                      <p className="mb-2 sm:mb-4 text-base sm:text-lg text-emerald-900 font-medium">
                        Welcome! I&apos;m your AI wellness companion.
                      </p>
                      <p className="mb-4 sm:mb-6 text-sm sm:text-base">How can I support you today?</p>
                      <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-6 inline-block">
                        <p className="font-bold text-emerald-900 text-sm sm:text-base">Try asking me about:</p>
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
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                                : 'bg-emerald-50 text-emerald-900 border-2 border-emerald-200'
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.is_user ? 'text-white/70' : 'text-emerald-600/60'
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
                          <div className="bg-emerald-50 text-emerald-900 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-emerald-200">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={scrollRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area - Fixed at Bottom */}
              <div className="border-t-2 border-emerald-200 p-3 sm:p-4 bg-gradient-to-br from-emerald-50/50 to-green-50/50 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 border-2 text-sm sm:text-base focus:border-emerald-500 focus-visible:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl flex-shrink-0"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center px-2">
                  💚 Our AI assistant is here to support, not replace, professional help.
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
