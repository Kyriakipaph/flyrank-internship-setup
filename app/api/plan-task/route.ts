import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import {
  buildPlanPrompt,
  fallbackPlan,
  planRequestSchema,
  taskPlanSchema,
  type PlanResponse,
} from '@/lib/planner';

export const runtime = 'nodejs';

const MODEL = 'openai/gpt-oss-20b';

function json(payload: PlanResponse, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = planRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request.', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { goal } = parsed.data;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return json({ plan: fallbackPlan(goal), source: 'fallback-no-key' });
  }

  const client = new Groq({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildPlanPrompt(goal) }],
      reasoning_effort: 'low',
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let planCandidate: unknown;
    try {
      planCandidate = JSON.parse(raw);
    } catch {
      console.error('[api/plan-task] JSON parse failed. Raw:', raw.slice(0, 500));
      return json({ plan: fallbackPlan(goal), source: 'fallback-error' });
    }

    const validated = taskPlanSchema.safeParse(planCandidate);
    if (!validated.success) {
      console.error(
        '[api/plan-task] schema validation failed:',
        validated.error.issues,
      );
      return json({ plan: fallbackPlan(goal), source: 'fallback-error' });
    }

    return json({ plan: validated.data, source: 'groq' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upstream error.';
    console.error('[api/plan-task] upstream error:', message);
    return json({ plan: fallbackPlan(goal), source: 'fallback-error' });
  }
}
