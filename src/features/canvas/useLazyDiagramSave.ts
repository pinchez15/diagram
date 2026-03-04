'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useAppStore } from '@/stores/appStore';
import type { DiagramType } from '@/types/diagram';

export type SaveStatus = 'new' | 'saved' | 'saving' | 'unsaved' | 'error';

const AUTO_SAVE_DELAY_MS = 2000;

interface UseLazyDiagramSaveOptions {
  diagramId: string | null;
  title: string;
  diagramType: DiagramType;
}

export function useLazyDiagramSave({ diagramId, title, diagramType }: UseLazyDiagramSaveOptions) {
  const [currentId, setCurrentId] = useState<string | null>(diagramId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(diagramId ? 'saved' : 'new');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const isCreatingRef = useRef(false);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const serialize = useCanvasStore((s) => s.serialize);

  const save = useCallback(async () => {
    if (!currentId) return; // Can't auto-save without an ID

    try {
      setSaveStatus('saving');
      const schema = serialize({ type: diagramType, title });
      const payload = JSON.stringify(schema);

      if (payload === lastSavedRef.current) {
        setSaveStatus('saved');
        return;
      }

      const res = await fetch(`/api/diagrams/${currentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, canvas_data: schema }),
      });

      if (!res.ok) throw new Error('Save failed');

      lastSavedRef.current = payload;
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [currentId, title, serialize, diagramType]);

  // Auto-save on changes (only when we have an ID)
  useEffect(() => {
    if (!currentId) return;

    setSaveStatus('unsaved');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, title, save, currentId]);

  // Create diagram in DB, then switch to auto-save mode
  const createAndSave = useCallback(async (): Promise<string | null> => {
    if (currentId || isCreatingRef.current) return currentId;
    isCreatingRef.current = true;

    try {
      setSaveStatus('saving');
      const schema = serialize({ type: diagramType, title });

      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: diagramType,
          canvas_data: schema,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create diagram');
      }

      const data = await res.json();
      const newId = data.id as string;

      // Update URL without navigation
      window.history.replaceState(null, '', `/diagram/${newId}`);

      setCurrentId(newId);
      lastSavedRef.current = JSON.stringify(schema);
      setSaveStatus('saved');
      useAppStore.getState().incrementDiagramListVersion();

      return newId;
    } catch {
      setSaveStatus('error');
      return null;
    } finally {
      isCreatingRef.current = false;
    }
  }, [currentId, serialize, diagramType, title]);

  return { saveStatus, save, createAndSave, currentId };
}
