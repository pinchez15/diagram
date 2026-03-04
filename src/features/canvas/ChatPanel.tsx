'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import { useAIChat, type ChatMessage } from './useAIChat';
import type { DiagramType } from '@/types/diagram';

interface ChatPanelProps {
  diagramType: DiagramType;
  onClose: () => void;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? 'bg-brand-primary text-white rounded-lg rounded-br-sm'
            : 'bg-neutral-100 text-neutral-900 rounded-lg rounded-bl-sm'
        }`}
      >
        {message.content}
        {message.hasDiagram && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-brand-primary/10 px-1.5 py-0.5 text-xs font-medium text-brand-primary">
            <Sparkles className="h-3 w-3" />
            Diagram updated
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-lg rounded-bl-sm bg-neutral-100 px-3 py-2">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-primary" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-primary" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-primary" />
      </div>
    </div>
  );
}

export function ChatPanel({ diagramType, onClose }: ChatPanelProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat({ diagramType });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  return (
    <div className="flex w-[360px] flex-col border-l border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-neutral-200 px-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-sm font-semibold text-neutral-700">AI Chat</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-neutral-400 hover:text-neutral-600 p-0.5"
              title="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 mb-3">
              <Sparkles className="h-5 w-5 text-brand-primary" />
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Describe your organization, workflow, or process, and I&apos;ll build the diagram for you.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Example: &quot;Sam is the CEO, his direct reports are James, Gary and Janice...&quot;
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Describe your diagram..."
            rows={2}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            variant="ai"
            size="compact"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
