'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  createTask,
  deleteTask,
  getTasks,
  type Task,
} from '@/lib/tasks';
import CircularSlider from '@/components/tierup/CircularSlider';

const MINUTES_PER_TIER = 10;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setTasks(await getTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newTaskName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      await createTask(name, newTaskMinutes);
      setNewTaskName('');
      setNewTaskMinutes(30);
      setShowAddForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add task.');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task permanently?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
    }
  }

  const unfinished = tasks.filter((t) => t.status === 'unfinished');
  const completed = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            My tasks
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {unfinished.length} in progress · {completed.length} completed
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600"
          >
            + New task
          </button>
        )}
      </header>

      {/* Add task form (collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col items-center gap-5 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <label
              htmlFor="task-name"
              className="text-sm font-medium text-stone-700"
            >
              What are you working on?
            </label>
            <input
              id="task-name"
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="e.g., Write chapter 3"
              autoFocus
              className="rounded-full border border-rose-100 bg-rose-50/40 px-5 py-3 text-sm focus:border-rose-300 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-stone-700">
              How long will you need?
            </p>
            <CircularSlider
              value={newTaskMinutes}
              onChange={setNewTaskMinutes}
              min={5}
              max={90}
              step={5}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-full border border-rose-200 bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:bg-rose-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTaskName.trim() || adding}
              className="rounded-full bg-rose-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add task'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading…</p>}

      {!loading && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              In progress · {unfinished.length}
            </h2>
            {unfinished.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-rose-200 bg-white/50 px-6 py-8 text-center text-sm italic text-stone-500">
                No tasks yet. Add one to start baking.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {unfinished.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    focusable
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          {completed.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                Completed · {completed.length}
              </h2>
              <ul className="flex flex-col gap-3">
                {completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TaskCard({
  task,
  focusable = false,
  onDelete,
}: {
  task: Task;
  focusable?: boolean;
  onDelete: () => void;
}) {
  const targetSeconds = task.targetMinutes * 60;
  const progressPct = Math.min(
    100,
    Math.round((task.totalSecondsFocused / targetSeconds) * 100),
  );

  return (
    <li className="group rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            {task.name}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {task.targetMinutes} min target ·{' '}
            {formatDuration(task.totalSecondsFocused)} focused
            {task.status === 'completed' && ' · ✓ done'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {focusable && (
            <Link
              href={`/focus?taskId=${task.id}`}
              className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-rose-600"
            >
              Focus
            </Link>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete task"
            className="rounded-full border border-rose-100 px-3 py-2 text-xs text-stone-500 hover:bg-rose-50 hover:text-stone-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-rose-50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            task.status === 'completed'
              ? 'bg-emerald-400'
              : progressPct >= 100
                ? 'bg-rose-400'
                : 'bg-rose-400'
          }`}
          style={{ width: `${Math.max(2, progressPct)}%` }}
        />
      </div>
    </li>
  );
}
