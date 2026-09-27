import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import {
  coachRequestSchema,
  fallbackCoachEvents,
  type CoachEvent,
  type CoachRequest,
} from '@/lib/coach';

export const runtime = 'nodejs';

const MODEL = 'openai/gpt-oss-20b';

function sse(event: CoachEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function buildPrompt(req: CoachRequest): string {
  const status = req.completed
    ? req.elapsedMinutes >= req.targetMinutes
      ? `finished the full target (${req.targetMinutes} min planned, ${req.elapsedMinutes} min focused)`
      : `marked it done early (${req.targetMinutes} min planned, ${req.elapsedMinutes} min focused)`
    : `stepped away early (${req.targetMinutes} min planned, ${req.elapsedMinutes} min focused)`;

  return `A user just finished a focus session in a productivity app called TierUp.

Task: "${req.taskName}"
Category: ${req.category}
Outcome: ${status}

Reply with exactly two lines and nothing else:
Line 1: One warm, specific sentence acknowledging their effort. Reference the task name naturally. Under 20 words. No exclamation marks.
Line 2: One concrete practical tip tailored to their category and outcome. Under 20 words. Actionable, not generic.

Do not add labels, quotes, prefixes, greetings, or emoji. Just the two lines separated by a single newline.`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = coachRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request.', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const req = parsed.data;

  const apiKey = process.env.GROQ_API_KEY;
  const encoder = new TextEncoder();

  // No key configured → deterministic fallback (still 200 so UI stays smooth).
  if (!apiKey) {
    const events = fallbackCoachEvents(req);
    const stream = new ReadableStream({
      start(controller) {
        for (const ev of events) controller.enqueue(encoder.encode(sse(ev)));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Coach-Source': 'fallback-no-key',
      },
    });
  }

  const client = new Groq({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      let sentReflection = false;
      let buffer = '';

      function emit(ev: CoachEvent) {
        controller.enqueue(encoder.encode(sse(ev)));
      }

      function drainReflection() {
        if (sentReflection) return;
        const nl = buffer.indexOf('\n');
        if (nl === -1) return;
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        emit({ type: 'reflection', text: line });
        sentReflection = true;
      }

      try {
        const completion = await client.chat.completions.create({
          model: MODEL,
          max_tokens: 400,
          temperature: 0.7,
          stream: true,
          // gpt-oss models are "reasoning" models on Groq; keep the thinking
          // budget low so visible content actually shows up.
          reasoning_effort: 'low',
          messages: [{ role: 'user', content: buildPrompt(req) }],
        } as Parameters<typeof client.chat.completions.create>[0]);

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (!delta) continue;
          buffer += delta;
          drainReflection();
        }

        // Flush remaining buffer as the tip (or reflection if none yet).
        const rest = buffer.trim();
        if (!sentReflection) {
          const [first, ...rest2] = rest.split('\n');
          emit({ type: 'reflection', text: (first ?? '').trim() });
          const tip = rest2.join(' ').trim();
          if (tip) emit({ type: 'tip', text: tip });
        } else if (rest) {
          emit({ type: 'tip', text: rest });
        }

        emit({ type: 'done' });
      } catch (err) {
        // Upstream/API error → send deterministic fallback so UX doesn't break.
        const message =
          err instanceof Error ? err.message : 'Unknown upstream error.';
        console.error('[api/coach] upstream error:', message);
        for (const ev of fallbackCoachEvents(req)) emit(ev);
        emit({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Coach-Source': 'groq',
    },
  });
}
