'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  FileText,
  Plus,
  LayoutTemplate,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { TEMPLATES } from '@/features/templates/templateData';
import type { DiagramListItem } from '@/types/api';

interface EditorSidebarProps {
  onNewDiagram: () => void;
  currentDiagramId: string | null;
}

export const EditorSidebar = memo(function EditorSidebar({
  onNewDiagram,
  currentDiagramId,
}: EditorSidebarProps) {
  const router = useRouter();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const diagramListVersion = useAppStore((s) => s.diagramListVersion);

  const [diagrams, setDiagrams] = useState<DiagramListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Fetch diagrams
  const fetchDiagrams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagrams');
      if (res.ok) {
        const data = await res.json();
        setDiagrams(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams, diagramListVersion]);

  const filteredDiagrams = diagrams.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this diagram?')) return;
    await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
    useAppStore.getState().incrementDiagramListVersion();
    setMenuOpenId(null);
  };

  const handleDuplicate = async (diagram: DiagramListItem) => {
    const res = await fetch(`/api/diagrams/${diagram.id}`);
    const original = await res.json();
    await fetch('/api/diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${diagram.title} (copy)`,
        type: diagram.type,
        canvas_data: original.canvas_data,
      }),
    });
    useAppStore.getState().incrementDiagramListVersion();
    setMenuOpenId(null);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Collapsed state — thin strip with chevron
  if (!sidebarOpen) {
    return (
      <div className="flex w-6 flex-shrink-0 flex-col items-center border-r border-neutral-200 bg-neutral-50 pt-2">
        <button
          onClick={toggleSidebar}
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNewDiagram}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
          title="New diagram"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Templates section */}
      <div className="border-b border-neutral-200 px-3 py-2">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <LayoutTemplate className="h-3 w-3" />
          Templates
        </h3>
        <div className="space-y-0.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/new?template=${t.id}`)}
              className="block w-full truncate rounded px-2 py-1 text-left text-xs text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              title={t.description}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* My Diagrams section */}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-2">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <FileText className="h-3 w-3" />
          My Diagrams
        </h3>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 w-full rounded border border-neutral-200 bg-white pl-7 pr-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Diagram list */}
        <div className="flex-1 overflow-y-auto">
          {loading && diagrams.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-400">Loading...</p>
          ) : filteredDiagrams.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-400">
              {search ? 'No matches' : 'No diagrams yet'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredDiagrams.map((d) => (
                <div
                  key={d.id}
                  className={`group relative flex items-center rounded px-2 py-1.5 text-xs cursor-pointer ${
                    d.id === currentDiagramId
                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                      : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                  onClick={() => router.push(`/diagram/${d.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{d.title}</div>
                    <div className="text-[10px] text-neutral-400">{timeAgo(d.updated_at)}</div>
                  </div>

                  {/* Kebab menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === d.id ? null : d.id);
                      }}
                      className="rounded p-0.5 text-neutral-400 opacity-0 hover:bg-neutral-300 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                    {menuOpenId === d.id && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(d);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                        >
                          <Copy className="h-3 w-3" /> Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
