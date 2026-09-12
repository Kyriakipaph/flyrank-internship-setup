'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cake from '@/components/tierup/Cake';
import { deleteTask, getTasks, type Task } from '@/lib/tasks';

const MINUTES_PER_TIER = 10;

function minutesToTiers(min: number): number {
  return Math.min(6, Math.max(1, Math.round(min / MINUTES_PER_TIER)));
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function KitchenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this cake permanently?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
    }
  }

  const completed = tasks.filter((t) => t.status === 'completed');
  const unfinished = tasks.filter((t) => t.status === 'unfinished');

  return (
    <div className="flex flex-col gap-10 py-4">
      <h1
        className="text-4xl font-semibold tracking-tight sm:text-5xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        Kitchen
      </h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading your cakes…</p>}

      {!loading && (
        <>
          <section className="flex flex-col gap-4">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Completed ({completed.length})
            </h2>
            {completed.length === 0 ? (
              <p className="text-sm italic text-stone-500">
                No finished cakes yet. Focus, finish, then come admire them.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Unfinished ({unfinished.length})
            </h2>
            {unfinished.length === 0 ? (
              <p className="text-sm italic text-stone-500">
                Nothing in progress. Start a session to bake.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {unfinished.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    resumable
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function TaskCard({
  task,
  resumable = false,
  onDelete,
}: {
  task: Task;
  resumable?: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="scale-75 origin-top">
        <Cake
          elapsedSeconds={task.totalSecondsFocused}
          targetMinutes={task.targetMinutes}
          showBaking={false}
        />
      </div>
      <p
        className="text-center text-lg font-semibold"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {task.name}
      </p>
      <p className="text-xs text-stone-500 dark:text-zinc-400">
        {formatDuration(task.totalSecondsFocused)}
        {task.completedAt && ` · ${formatDate(task.completedAt)}`}
      </p>
      <div className="flex gap-2">
        {resumable && (
          <Link
            href={`/focus?taskId=${task.id}`}
            className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
          >
            Continue
          </Link>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-stone-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
