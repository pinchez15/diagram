import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';

const MAX_DIAGRAMS_FREE = 5;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('diagrams')
    .select('id, title, description, type, created_at, updated_at')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Check usage limit for free users
  const { count, error: countError } = await supabase
    .from('diagrams')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Check plan from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('clerk_user_id', userId)
    .single();

  const plan = profile?.plan || 'individual';
  if (plan === 'individual' && (count ?? 0) >= MAX_DIAGRAMS_FREE) {
    return NextResponse.json(
      { error: 'Free plan limit reached. Upgrade to create more diagrams.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, type, canvas_data } = body;

  const { data, error } = await supabase
    .from('diagrams')
    .insert({
      owner_id: userId,
      title: title || 'Untitled Diagram',
      description: description || null,
      type: type || 'workflow',
      canvas_data: canvas_data || {
        schema_version: 1,
        metadata: { type: type || 'workflow', title: title || 'Untitled Diagram' },
        nodes: [],
        edges: [],
      },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
