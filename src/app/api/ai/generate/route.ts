import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/ai/prompt';
import { generateDiagram } from '@/lib/ai/claude';
import { validateDiagramSchema } from '@/lib/schema/validate';
import type { DiagramType } from '@/types/diagram';

const MAX_AI_GENERATIONS_FREE = 50;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, type = 'workflow' } = body as { prompt: string; type?: DiagramType };

  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('clerk_user_id', userId)
    .single();

  const plan = profile?.plan || 'individual';

  // Check usage from usage table
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
  const { data: usage } = await supabase
    .from('usage')
    .select('ai_generation_count')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .single();

  const aiCount = usage?.ai_generation_count || 0;

  if (plan === 'individual' && aiCount >= MAX_AI_GENERATIONS_FREE) {
    return NextResponse.json(
      { error: 'Free plan AI generation limit reached. Upgrade to continue.' },
      { status: 403 }
    );
  }

  const systemPrompt = buildSystemPrompt(type);

  // Attempt generation with one retry on validation failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawResponse = await generateDiagram(systemPrompt, prompt);

      // Extract JSON from response (handle potential markdown wrapping)
      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonStr);
      const validation = validateDiagramSchema(parsed);

      if (validation.success) {
        // Increment usage via the DB function
        await supabase.rpc('increment_ai_count', { p_user_id: userId });

        return NextResponse.json(validation.data);
      }

      // Validation failed — retry on first attempt
      if (attempt === 0) continue;

      return NextResponse.json(
        { error: 'Generated diagram failed validation', details: validation.error },
        { status: 422 }
      );
    } catch (error) {
      if (attempt === 1) {
        return NextResponse.json(
          { error: 'AI generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ error: 'AI generation failed after retries' }, { status: 500 });
}
