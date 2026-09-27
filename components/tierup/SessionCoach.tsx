'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  coachEventSchema,
  fallbackCoachEvents,
  type CoachRequest,
} from '@/lib/coach';

type Props = {
  request: CoachRequest;
  onDismiss: () => void;
};

type Status = 'streaming' | 'done' | 'error';

export default function SessionCoach({ request, onDismiss }: Props) {
  const [reflection, setReflection] = useState('');
  const [tip, setTip] = useState('');
  const [status, setStatus] = useState<Status>('streaming');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Coach request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages ("\n\n" separated).
          let sepIndex: number;
          while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, sepIndex).trim();
            buffer = buffer.slice(sepIndex + 2);
            if (!raw.startsWith('data:')) continue;
            const jsonStr = raw.slice(5).trim();
            let parsed: unknown;
            try {
              parsed = JSON.parse(jsonStr);
            } catch {
              continue;
            }
            const evt = coachEventSchema.safeParse(parsed);
            if (!evt.success) continue;

            if (evt.data.type === 'reflection') setReflection(evt.data.text);
            else if (evt.data.type === 'tip') setTip(evt.data.text);
            else if (evt.data.type === 'done') setStatus('done');
            else if (evt.data.type === 'error') setStatus('error');
          }
        }

        setStatus((s) => (s === 'streaming' ? 'done' : s));
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        // Client-side network failure → local fallback so UX still works.
        const events = fallbackCoachEvents(request);
        for (const ev of events) {
          if (ev.type === 'reflection') setReflection(ev.text);
          if (ev.type === 'tip') setTip(ev.text);
        }
        setStatus('error');
      }
    })();

    return () => controller.abort();
  }, [request]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close coach"
          className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-stone-100"
          style={{ color: 'var(--ink-muted)' }}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Sparkles size={16} />
          </div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--accent)' }}
          >
            Your session coach
          </p>
        </div>

        <h2
          id="coach-heading"
          className="mt-4 min-h-[3.5rem] text-xl leading-snug tracking-tight sm:text-2xl"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
        >
          {reflection || (
            <span
              className="inline-block h-5 w-3/4 animate-pulse rounded"
              style={{ backgroundColor: 'var(--paper-warm)' }}
              aria-hidden
            />
          )}
        </h2>

        <div
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--paper-warm)' }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--ink-muted)' }}
          >
            Try this next
          </p>
          <p
            className="mt-2 min-h-[2.5rem] text-sm leading-relaxed"
            style={{ color: 'var(--ink)' }}
          >
            {tip || (
              <span
                className="inline-block h-4 w-2/3 animate-pulse rounded"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                aria-hidden
              />
            )}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span
            className="text-[11px]"
            style={{ color: 'var(--ink-soft)' }}
            aria-live="polite"
          >
            {status === 'streaming' && 'Coach is thinking…'}
            {status === 'done' && 'Coached by AI · via Groq'}
            {status === 'error' && 'Offline tip (coach unavailable)'}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full px-6 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
