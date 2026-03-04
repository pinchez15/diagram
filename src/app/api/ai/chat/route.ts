import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';
import { buildChatSystemPrompt } from '@/lib/ai/chat-prompt';
import { chatWithDiagram, type ChatMessage } from '@/lib/ai/claude';
import { validateDiagramSchema } from '@/lib/schema/validate';
import type { DiagramType, DiagramSchema } from '@/types/diagram';

export const runtime = 'nodejs';

const MAX_AI_GENERATIONS_FREE = 50;

interface ChatRequest {
  messages: ChatMessage[];
  currentDiagram: DiagramSchema | null;
  diagramType: DiagramType;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ChatRequest;
    const { messages, currentDiagram = null, diagramType = 'workflow' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Check API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-placeholder')) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Set it in your Vercel environment variables.' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();

    // Check plan — gracefully handle errors
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError) {
      console.error('[ai/chat] Profile query error:', profileError.message);
    }

    const plan = profile?.plan || 'individual';

    // Check usage — gracefully handle errors
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('ai_generation_count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('[ai/chat] Usage query error:', usageError.message);
    }

    const aiCount = usage?.ai_generation_count || 0;

    const systemPrompt = buildChatSystemPrompt(diagramType, currentDiagram);

    // Attempt with one retry on validation failure
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
          // Check usage limit before counting
          if (plan === 'individual' && aiCount >= MAX_AI_GENERATIONS_FREE) {
            return NextResponse.json({
              message: "I'd love to update your diagram, but you've reached the free plan AI generation limit. Upgrade to continue!",
              diagram: null,
            });
          }

          const validation = validateDiagramSchema(parsed.diagram);
          if (!validation.success) {
            console.error(`[ai/chat] Diagram validation failed on attempt ${attempt + 1}:`, validation.error);
            if (attempt === 0) continue;
            // Return message without invalid diagram
            return NextResponse.json({
              message: parsed.message + "\n\n(Note: I tried to update the diagram but encountered a validation error. Please try again.)",
              diagram: null,
            });
          }

          // Increment usage — only when diagram is returned
          const { error: rpcError } = await supabase.rpc('increment_ai_count', { p_user_id: userId });
          if (rpcError) {
            console.error('[ai/chat] increment_ai_count RPC error:', rpcError.message);
          }

          return NextResponse.json({
            message: parsed.message,
            diagram: validation.data,
          });
        }

        // No diagram — just a chat message
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
      { error: `Internal server error: ${errMsg}` },
      { status: 500 }
    );
  }
}
