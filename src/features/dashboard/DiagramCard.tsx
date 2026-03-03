'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Copy, Trash2 } from 'lucide-react';
import { Card } from '@/components';
import type { DiagramListItem } from '@/types/api';

const TYPE_BADGES: Record<string, string> = {
  workflow: 'bg-blue-100 text-blue-700',
  orgchart: 'bg-green-100 text-green-700',
  swimlane: 'bg-purple-100 text-purple-700',
};

interface DiagramCardProps {
  diagram: DiagramListItem;
}

export function DiagramCard({ diagram }: DiagramCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this diagram?')) return;
    await fetch(`/api/diagrams/${diagram.id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleDuplicate = async () => {
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
    router.refresh();
    setMenuOpen(false);
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

  return (
    <Card hoverable className="relative" onClick={() => router.push(`/diagram/${diagram.id}`)}>
      {/* Thumbnail placeholder */}
      <div className="mb-3 flex h-24 items-center justify-center rounded bg-neutral-100 text-neutral-300">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="8" y="14" width="7" height="7" rx="1" />
          <path d="M10 7h4M6.5 10v7.5M17.5 10v4" />
        </svg>
      </div>

      {/* Title + meta */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-neutral-900">{diagram.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGES[diagram.type] || 'bg-neutral-100 text-neutral-600'}`}>
              {diagram.type}
            </span>
            <span className="text-xs text-neutral-400">{timeAgo(diagram.updated_at)}</span>
          </div>
        </div>

        {/* Kebab menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-lg z-50">
              <button
                onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
