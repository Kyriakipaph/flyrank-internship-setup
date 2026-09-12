'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Cake from './Cake';
import CircularTimer from './CircularTimer';
import { useFocus } from '@/contexts/FocusContext';
import { deleteTask, getTask } from '@/lib/tasks';

function minutesToCakeTiers(minutes: number): number {
  return Math.min(6, Math.max(1, Math.round(minutes / 10)));
}

function bakingStatus(
  elapsedSeconds: number,
  targetMinutes: number,
): string {
  const targetSeconds = targetMinutes * 60;
  const cakeTargetTiers = minutesToCakeTiers(targetMinutes);
  const secondsPerTier = targetSeconds / cakeTargetTiers;
  const tierCount = Math.min(
    Math.floor(elapsedSeconds / secondsPerTier),
    cakeTargetTiers,
  );
  if (tierCount >= cakeTargetTiers) return 'Decorating your masterpiece…';
  return `Baking layer ${tierCount + 1} of ${cakeTargetTiers}…`;
}

export default function FocusSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const {
    task,
    elapsedSeconds,
    isRunning,
    startTask,
    togglePause,
    exit: exitSession,
    complete,
    clear,
  } = useFocus();

  const [loadError, setLoadError] = useState<string | null>(null);
  const [giveUpConfirm, setGiveUpConfirm] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    if (task && task.id === taskId) return;

    (async () => {
      try {
        const t = await getTask(taskId);
        if (!t) {
          setLoadError('Task not found.');
        } else if (t.status === 'completed') {
          setLoadError('This task is already completed.');
        } else {
          startTask(t);
          setLoadError(null);
        }
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : 'Could not load task.',
        );
      }
    })();
  }, [taskId, task, startTask]);

  async function handleExit() {
    await exitSession();
    router.push('/tasks');
  }

  async function handleFinish() {
    await complete();
    router.push('/kitchen');
  }

  async function handleGiveUp() {
    if (!task) return;
    try {
      await deleteTask(task.id);
    } catch {}
    clear();
    router.push('/tasks');
  }

  if (!taskId && !task) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <h1
          className="text-3xl font-semibold sm:text-4xl"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Pick a task first
        </h1>
        <p className="max-w-md text-sm text-stone-600">
          To start focusing, go to your tasks and pick one to work on.
        </p>
        <Link
          href="/tasks"
          className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600"
        >
          Go to my tasks
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
        <Link
          href="/tasks"
          className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
        >
          Back to my tasks
        </Link>
      </div>
    );
  }

  if (!task) {
    return <p className="text-sm text-stone-500">Loading task…</p>;
  }

  const targetSeconds = task.targetMinutes * 60;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <h1
        className="text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {task.name}
      </h1>

      <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:items-center md:gap-10">
        <div className="scale-90 sm:scale-100">
          <Cake
            elapsedSeconds={elapsedSeconds}
            targetMinutes={task.targetMinutes}
            showBaking={isRunning}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <CircularTimer
            elapsedSeconds={elapsedSeconds}
            targetSeconds={targetSeconds}
          />

          <p className="text-xs italic text-stone-500">
            {bakingStatus(elapsedSeconds, task.targetMinutes)}
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="min-w-28 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium shadow-sm hover:bg-stone-50"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={handleExit}
              className="min-w-28 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-600 shadow-sm hover:bg-stone-50"
            >
              Save & exit
            </button>
            <button
              type="button"
              onClick={() => setGiveUpConfirm(true)}
              className="min-w-28 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
            >
              Give up
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="min-w-28 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {giveUpConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setGiveUpConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-2xl font-semibold text-stone-900"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Give up?
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              This will <strong>permanently delete</strong> the task{' '}
              <span className="italic">"{task.name}"</span> and all its
              progress. It won't appear in your kitchen.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGiveUpConfirm(false)}
                className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium hover:bg-stone-50"
              >
                Never mind
              </button>
              <button
                type="button"
                onClick={handleGiveUp}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, give up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
