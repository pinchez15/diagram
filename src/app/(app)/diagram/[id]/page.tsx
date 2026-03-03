import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { DiagramEditorWrapper } from '@/features/canvas/DiagramEditorWrapper';
import type { DiagramSchema } from '@/types/diagram';

export default async function DiagramEditorPage({
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
    .select('*')
    .eq('id', id)
    .eq('owner_id', userId)
    .single();

  if (error || !data) notFound();

  const schema = data.canvas_data as DiagramSchema;

  return <DiagramEditorWrapper diagramId={id} initialSchema={schema} />;
}
