import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import type { DiagramType, DiagramSchema } from '@/types/diagram';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasDiagram?: boolean;
}

interface UseAIChatOptions {
  diagramType: DiagramType;
}

export function useAIChat({ diagramType }: UseAIChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const serialize = useCanvasStore((s) => s.serialize);
  const loadDiagram = useCanvasStore((s) => s.loadDiagram);
  const pushSnapshot = useCanvasStore((s) => s.pushSnapshot);
  const nodes = useCanvasStore((s) => s.nodes);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Serialize current canvas state if there are nodes
      const currentDiagram: DiagramSchema | null = nodes.length > 0
        ? serialize({ type: diagramType, title: 'Diagram' })
        : null;

      // Build API messages from chat history (excluding the hasDiagram metadata)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          currentDiagram,
          diagramType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Chat failed (${res.status})`);
      }

      const data = await res.json() as { message: string; diagram: DiagramSchema | null };

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.message,
        hasDiagram: !!data.diagram,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If diagram was returned, load it onto the canvas
      if (data.diagram) {
        pushSnapshot();
        loadDiagram(data.diagram);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, nodes.length, serialize, diagramType, pushSnapshot, loadDiagram]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
