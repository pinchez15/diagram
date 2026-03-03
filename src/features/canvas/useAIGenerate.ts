'use client';

import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import type { DiagramSchema, DiagramType } from '@/types/diagram';

export function useAIGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadDiagram = useCanvasStore((s) => s.loadDiagram);

  const generate = useCallback(async (prompt: string, type: DiagramType): Promise<DiagramSchema | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const schema: DiagramSchema = await res.json();
      loadDiagram(schema);
      return schema;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadDiagram]);

  return { generate, loading, error };
}
