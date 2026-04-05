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
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Wellness Coach</h1>
        <p className="text-muted-foreground mt-2">
          Chat with your personal AI wellness companion. Get support, guidance, and thoughtful responses.
        </p>
      </div>

      {/* Chat Area */}
      <Card className="border-primary/20 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Wellness Chat
          </CardTitle>
          <CardDescription>
            A safe space to share your thoughts and receive supportive guidance
          </CardDescription>
        </CardHeader>

        {isInitializing ? (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground">Initializing your wellness chat...</p>
            </div>
          </CardContent>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-4xl mb-4">👋</div>
                    <p className="mb-4">
                      Welcome! I&apos;m your AI wellness companion. How can I support you today?
                    </p>
                    <div className="space-y-2 text-sm mt-6">
                      <p className="font-medium text-foreground">Try asking me about:</p>
                      <ul className="text-muted-foreground">
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
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            msg.is_user
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground border border-border'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
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
                        <div className="bg-muted text-foreground px-4 py-3 rounded-lg border border-border">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Our AI assistant is here to support, not replace, professional help. If you&apos;re in crisis, please reach out to a mental health professional.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
