'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { DiagramCard } from './DiagramCard';
import type { DiagramListItem } from '@/types/api';

interface DiagramGridProps {
  diagrams: DiagramListItem[];
}

export function DiagramGrid({ diagrams }: DiagramGridProps) {
  const [search, setSearch] = useState('');

  const filtered = diagrams.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search diagrams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((diagram) => (
          <DiagramCard key={diagram.id} diagram={diagram} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-neutral-400">No diagrams match your search.</p>
        )}
      </div>
    </div>
  );
}
