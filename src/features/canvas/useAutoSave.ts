'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

const AUTO_SAVE_DELAY_MS = 2000;

export function useAutoSave(diagramId: string, title: string) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const serialize = useCanvasStore((s) => s.serialize);

  const save = useCallback(async () => {
    try {
      setSaveStatus('saving');
      const schema = serialize({ type: 'workflow', title });
      const payload = JSON.stringify(schema);

      // Skip save if nothing changed
      if (payload === lastSavedRef.current) {
        setSaveStatus('saved');
        return;
      }

      const res = await fetch(`/api/diagrams/${diagramId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (!res.ok) throw new Error('Save failed');

      lastSavedRef.current = payload;
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [diagramId, title, serialize]);

  // Auto-save on changes with debounce
  useEffect(() => {
    setSaveStatus('unsaved');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, title, save]);

  return { saveStatus, save };
}
