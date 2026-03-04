'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Undo2, Redo2, LayoutDashboard, Blocks } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components';
import { useCanvasStore } from '@/stores/canvasStore';
import type { SaveStatus } from './useLazyDiagramSave';

interface ChatFirstToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: SaveStatus;
  onExport: (format: string) => void;
  onAutoLayout: () => void;
  onTogglePalette: () => void;
  paletteActive: boolean;
  nodeCount: number;
  edgeCount: number;
}

export function ChatFirstToolbar({
  title,
  onTitleChange,
  saveStatus,
  onExport,
  onAutoLayout,
  onTogglePalette,
  paletteActive,
  nodeCount,
  edgeCount,
}: ChatFirstToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const undoStack = useCanvasStore((s) => s.undoStack);
  const redoStack = useCanvasStore((s) => s.redoStack);

  const statusText: Record<SaveStatus, string> = {
    new: 'New',
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    error: 'Save failed',
  };

  const statusColor: Record<SaveStatus, string> = {
    new: 'text-neutral-400',
    saved: 'text-success',
    saving: 'text-neutral-400',
    unsaved: 'text-warning',
    error: 'text-error',
  };

  return (
    <div className="flex h-10 items-center justify-between border-b border-neutral-200 bg-white px-3">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm font-bold text-neutral-900 hover:text-brand-primary">
          Diagram
        </Link>
        <div className="h-4 w-px bg-neutral-200" />
        {isEditingTitle ? (
          <input
            autoFocus
            className="h-7 rounded border border-neutral-300 px-2 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
          />
        ) : (
          <button
            className="text-sm font-medium text-neutral-900 hover:text-brand-primary"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </button>
        )}
        <span className={`text-xs ${statusColor[saveStatus]}`}>{statusText[saveStatus]}</span>
        {nodeCount > 0 && (
          <span className="text-xs text-neutral-400">
            {nodeCount} node{nodeCount !== 1 ? 's' : ''}, {edgeCount} edge{edgeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="compact" onClick={undo} disabled={undoStack.length === 0}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="compact" onClick={redo} disabled={redoStack.length === 0}>
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
        <div className="mx-1 h-4 w-px bg-neutral-200" />
        <Button variant="ghost" size="compact" onClick={onAutoLayout}>
          <LayoutDashboard className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={paletteActive ? 'primary' : 'ghost'}
          size="compact"
          onClick={onTogglePalette}
        >
          <Blocks className="h-3.5 w-3.5" />
        </Button>
        <div className="relative">
          <Button variant="secondary" size="compact" onClick={() => setExportOpen(!exportOpen)}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-lg z-50">
              {['json', 'mermaid', 'png', 'svg'].map((fmt) => (
                <button
                  key={fmt}
                  className="block w-full px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { onExport(fmt); setExportOpen(false); }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-1">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
