'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({
  inputMessage,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <div className="border-t-2 border-border p-3 sm:p-4 bg-primary/5 flex-shrink-0">
      <form onSubmit={onSubmit} className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isLoading}
          className="flex-1 border-2 text-sm sm:text-base focus:border-primary focus-visible:ring-primary/50"
        />
        <Button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl flex-shrink-0"
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
  );
}
