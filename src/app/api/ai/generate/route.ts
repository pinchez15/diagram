import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/ai/prompt';
import { generateDiagram } from '@/lib/ai/claude';
import { validateDiagramSchema } from '@/lib/schema/validate';
import type { DiagramType } from '@/types/diagram';

export const runtime = 'nodejs';

const MAX_AI_GENERATIONS_FREE = 50;

export async function POST(request: NextRequest) {
  try {
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

    // Check plan — gracefully handle missing profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError) {
      console.error('[ai/generate] Profile query error:', profileError.message);
    }

    const plan = profile?.plan || 'individual';

    // Check usage — gracefully handle missing usage table/row
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('ai_generation_count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine (first use)
      console.error('[ai/generate] Usage query error:', usageError.message, usageError.code);
    }

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
        console.log(`[ai/generate] Attempt ${attempt + 1} — calling Claude...`);
        const rawResponse = await generateDiagram(systemPrompt, prompt);
        console.log(`[ai/generate] Claude responded, ${rawResponse.length} chars`);

        // Extract JSON from response (handle potential markdown wrapping)
        let jsonStr = rawResponse.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(jsonStr);
        const validation = validateDiagramSchema(parsed);

        if (validation.success) {
          // Increment usage — non-blocking, don't fail the request if this errors
          const { error: rpcError } = await supabase.rpc('increment_ai_count', { p_user_id: userId });
          if (rpcError) {
            console.error('[ai/generate] increment_ai_count RPC error:', rpcError.message);
          }

          return NextResponse.json(validation.data);
        }

        console.error(`[ai/generate] Validation failed on attempt ${attempt + 1}:`, validation.error);
        if (attempt === 0) continue;

        return NextResponse.json(
          { error: 'Generated diagram failed validation', details: validation.error },
          { status: 422 }
        );
      } catch (error) {
        console.error(`[ai/generate] Error on attempt ${attempt + 1}:`, error instanceof Error ? error.message : error);
        if (attempt === 1) {
          return NextResponse.json(
            { error: 'AI generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ error: 'AI generation failed after retries' }, { status: 500 });
  } catch (outerError) {
    console.error('[ai/generate] Unhandled error:', outerError instanceof Error ? outerError.stack : outerError);
    return NextResponse.json(
      { error: 'Internal server error', details: outerError instanceof Error ? outerError.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
