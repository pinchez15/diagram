import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { buildChatSystemPrompt } from '@/lib/ai/chat-prompt';
import { chatWithDiagram, type ChatMessage } from '@/lib/ai/claude';
import { validateDiagramSchema } from '@/lib/schema/validate';
import type { DiagramType, DiagramSchema } from '@/types/diagram';

export const runtime = 'nodejs';

interface ChatRequest {
  messages: ChatMessage[];
  currentDiagram: DiagramSchema | null;
  diagramType: DiagramType;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Auth
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error('[ai/chat] Auth error:', authError);
      return NextResponse.json({ error: 'Auth failed: ' + (authError instanceof Error ? authError.message : String(authError)) }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — no userId from Clerk' }, { status: 401 });
    }

    // Step 2: Parse request body
    let body: ChatRequest;
    try {
      body = (await request.json()) as ChatRequest;
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, currentDiagram = null, diagramType = 'workflow' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Step 3: Usage check (non-blocking — skip if Supabase fails)
    let aiCount = 0;
    let plan = 'individual';
    try {
      const { createServiceClient } = await import('@/lib/supabase/server');
      const supabase = createServiceClient();

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('clerk_user_id', userId)
        .single();
      plan = profile?.plan || 'individual';

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: usage } = await supabase
        .from('usage')
        .select('ai_generation_count')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .single();
      aiCount = usage?.ai_generation_count || 0;
    } catch (dbError) {
      console.error('[ai/chat] Supabase check failed (continuing without usage tracking):', dbError instanceof Error ? dbError.message : dbError);
    }

    if (plan === 'individual' && aiCount >= 50) {
      return NextResponse.json({
        message: "You've reached the free plan AI generation limit. Upgrade to continue!",
        diagram: null,
      });
    }

    // Step 4: Build prompt and call Claude
    const systemPrompt = buildChatSystemPrompt(diagramType, currentDiagram);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[ai/chat] Attempt ${attempt + 1} — calling Claude...`);
        const rawResponse = await chatWithDiagram(systemPrompt, messages);
        console.log(`[ai/chat] Claude responded, ${rawResponse.length} chars`);

        // Extract JSON from response
        let jsonStr = rawResponse.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(jsonStr) as { message: string; diagram: DiagramSchema | null };

        if (!parsed.message) {
          throw new Error('Response missing "message" field');
        }

        // If diagram is present, validate it
        if (parsed.diagram) {
          const validation = validateDiagramSchema(parsed.diagram);
          if (!validation.success) {
            console.error(`[ai/chat] Diagram validation failed on attempt ${attempt + 1}:`, validation.error);
            if (attempt === 0) continue;
            return NextResponse.json({
              message: parsed.message + "\n\n(Note: diagram validation failed. Please try again.)",
              diagram: null,
            });
          }

          // Increment usage (non-blocking)
          try {
            const { createServiceClient } = await import('@/lib/supabase/server');
            const supabase = createServiceClient();
            await supabase.rpc('increment_ai_count', { p_user_id: userId });
          } catch {
            console.error('[ai/chat] Failed to increment usage count');
          }

          return NextResponse.json({
            message: parsed.message,
            diagram: validation.data,
          });
        }

        return NextResponse.json({
          message: parsed.message,
          diagram: null,
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[ai/chat] Error on attempt ${attempt + 1}:`, errMsg);
        if (attempt === 1) {
          return NextResponse.json(
            { error: `AI chat failed: ${errMsg}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ error: 'AI chat failed after retries' }, { status: 500 });
  } catch (outerError) {
    const errMsg = outerError instanceof Error ? outerError.message : String(outerError);
    console.error('[ai/chat] Unhandled error:', outerError instanceof Error ? outerError.stack : outerError);
    return NextResponse.json(
      { error: `Server error: ${errMsg}` },
      { status: 500 }
    );
  }
}
