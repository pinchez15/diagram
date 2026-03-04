import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { DiagramGrid } from '@/features/dashboard/DiagramGrid';
import { EmptyState } from '@/features/dashboard/EmptyState';
import type { DiagramListItem } from '@/types/api';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServiceClient();
  const { data: diagrams } = await supabase
    .from('diagrams')
    .select('id, title, description, type, created_at, updated_at')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  const items = (diagrams ?? []) as DiagramListItem[];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} diagram{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {items.length === 0 ? <EmptyState /> : <DiagramGrid diagrams={items} />}
    </div>
  );
}
