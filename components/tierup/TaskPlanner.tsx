'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Sparkles, X, Loader2, AlertTriangle } from 'lucide-react';
import {
  planResponseSchema,
  type TaskPlan,
  type PlanResponse,
} from '@/lib/planner';
import { createTask } from '@/lib/tasks';
import { getCategory, type CategoryId } from '@/lib/categories';
import { getVibe, type VibeId } from '@/lib/vibes';
import type { CakeType } from '@/lib/tasks';

type Status = 'idle' | 'planning' | 'ready' | 'error' | 'creating';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function TaskPlanner({ onClose, onCreated }: Props) {
  const [goal, setGoal] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [source, setSource] = useState<PlanResponse['source'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handlePlan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = goal.trim();
    if (trimmed.length < 3) return;

    setStatus('planning');
    setPlan(null);
    setSource(null);
    setErrorMessage(null);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/plan-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Planner failed (${res.status})`);

      const json = await res.json();
      const validated = planResponseSchema.safeParse(json);
      if (!validated.success) {
        throw new Error('Malformed plan response.');
      }

      setPlan(validated.data.plan);
      setSource(validated.data.source);
      setStatus('ready');
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not reach the planner.',
      );
      setStatus('error');
    }
  }

  async function handleCreate() {
    if (!plan) return;
    setStatus('creating');
    try {
      await createTask({
        name: plan.refinedName,
        targetMinutes: plan.targetMinutes,
        category: plan.category as CategoryId,
        vibe: plan.vibe as VibeId,
        cakeType: plan.cakeType as CakeType,
      });
      onCreated();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not create task.',
      );
      setStatus('ready');
    }
  }

  const category = plan ? getCategory(plan.category as CategoryId) : null;
  const vibe = plan ? getVibe(plan.vibe as VibeId) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="planner-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close planner"
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
            Plan with AI
          </p>
        </div>

        <h2
          id="planner-heading"
          className="mt-3 text-2xl leading-snug tracking-tight sm:text-3xl"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
        >
          What are you trying to get done?
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
          Describe the goal in your own words. The planner picks a realistic
          target time, category, vibe, and breaks it into steps.
        </p>

        {status !== 'ready' && (
          <form onSubmit={handlePlan} className="mt-5 flex flex-col gap-3">
            <label htmlFor="planner-goal" className="sr-only">
              Your goal
            </label>
            <textarea
              id="planner-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Finish reading chapter 3 of the OS textbook and answer the review questions"
              rows={3}
              maxLength={500}
              disabled={status === 'planning'}
              className="w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus-visible:ring-2 disabled:opacity-60"
              style={{ borderColor: 'var(--border-strong)' }}
            />
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[11px]"
                style={{ color: 'var(--ink-soft)' }}
                aria-live="polite"
              >
                {status === 'planning' && 'AI is planning your session…'}
                {status === 'error' && errorMessage}
              </span>
              <button
                type="submit"
                disabled={goal.trim().length < 3 || status === 'planning'}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {status === 'planning' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Planning…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Plan it for me
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {(status === 'ready' || status === 'creating') && plan && category && vibe && (
          <div className="mt-5 flex flex-col gap-4">
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--paper-warm)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--ink-muted)' }}>
                Suggested task
              </p>
              <h3
                className="mt-1 text-xl leading-snug"
                style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
              >
                {plan.refinedName}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
                <span
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: category.soft, color: category.color }}
                >
                  {category.label}
                </span>
                <span
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: 'white', color: 'var(--ink)', border: '1px solid var(--border-strong)' }}
                >
                  {plan.targetMinutes} min · {plan.cakeType}
                </span>
                <span
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: 'white', color: 'var(--ink)', border: '1px solid var(--border-strong)' }}
                >
                  {vibe.label}
                </span>
              </div>
              <p className="mt-3 text-xs italic" style={{ color: 'var(--ink-muted)' }}>
                {plan.rationale}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--ink-muted)' }}>
                Break it into steps
              </p>
              <ol className="mt-2 flex flex-col gap-1.5">
                {plan.subtasks.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg px-3 py-2 text-sm"
                    style={{ backgroundColor: 'var(--paper-warm)', color: 'var(--ink)' }}
                  >
                    <span
                      className="shrink-0 font-semibold tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {source !== 'groq' && (
              <div
                className="flex items-start gap-2 rounded-xl border px-3 py-2 text-xs"
                style={{ borderColor: '#fde68a', backgroundColor: '#fefce8', color: '#78350f' }}
                role="status"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  AI planner was unavailable, so this is a keyword-based
                  fallback. Feel free to try again in a minute.
                </span>
              </div>
            )}

            {errorMessage && status === 'ready' && (
              <p className="text-xs text-red-600">{errorMessage}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[11px]"
                style={{ color: 'var(--ink-soft)' }}
                aria-live="polite"
              >
                {source === 'groq' && 'Planned by AI · via Groq'}
                {source === 'fallback-no-key' && 'Offline plan (AI unconfigured)'}
                {source === 'fallback-error' && 'Offline plan (AI unavailable)'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setPlan(null);
                    setSource(null);
                    setErrorMessage(null);
                  }}
                  className="rounded-full border bg-white px-5 py-2 text-sm font-medium hover:bg-stone-50"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--ink)' }}
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={status === 'creating'}
                  className="rounded-full px-6 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-110"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {status === 'creating' ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
