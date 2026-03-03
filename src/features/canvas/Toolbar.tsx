'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Download, Undo2, Redo2, LayoutDashboard, Maximize, MessageSquare } from 'lucide-react';
import { Button } from '@/components';
import { useCanvasStore } from '@/stores/canvasStore';

interface ToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  onAIGenerate: () => void;
  onAIChat: () => void;
  onExport: (format: string) => void;
  onAutoLayout: () => void;
  chatActive?: boolean;
}

export function Toolbar({ title, onTitleChange, saveStatus, onAIGenerate, onAIChat, onExport, onAutoLayout, chatActive }: ToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const undoStack = useCanvasStore((s) => s.undoStack);
  const redoStack = useCanvasStore((s) => s.redoStack);

  const statusText: Record<string, string> = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    error: 'Save failed',
  };

  const statusColor: Record<string, string> = {
    saved: 'text-success',
    saving: 'text-neutral-400',
    unsaved: 'text-warning',
    error: 'text-error',
  };

  return (
    <div className="flex h-10 items-center justify-between border-b border-neutral-200 bg-white px-3">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
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
      </div>

      {/* Right section */}
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
        <Button variant="ai" size="compact" onClick={onAIGenerate}>
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Generate</span>
        </Button>
        <Button
          variant={chatActive ? 'primary' : 'secondary'}
          size="compact"
          onClick={onAIChat}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Chat</span>
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
      </div>
    </div>
  );
}
