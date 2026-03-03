import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { PresentationView } from '@/features/canvas/PresentationView';
import type { DiagramSchema } from '@/types/diagram';

export default async function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('diagrams')
    .select('canvas_data')
    .eq('id', id)
    .eq('owner_id', userId)
    .single();

  if (error || !data) notFound();

  return <PresentationView schema={data.canvas_data as DiagramSchema} diagramId={id} />;
}
