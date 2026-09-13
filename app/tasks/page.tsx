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
import VibePicker from '@/components/tierup/VibePicker';
import CakeTypePicker from '@/components/tierup/CakeTypePicker';
import CategoryPicker from '@/components/tierup/CategoryPicker';
import MiniCake from '@/components/tierup/MiniCake';
import { getCategory, type CategoryId } from '@/lib/categories';
import { getVibe, type VibeId } from '@/lib/vibes';
import type { CakeType } from '@/lib/tasks';
import { Plus, Loader2, CheckCircle2, ClipboardList, CalendarDays, ChefHat } from 'lucide-react';

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatDueDate(d: Date): string {
  const hasTime = d.getHours() !== 23 || d.getMinutes() !== 59;
  const datePart = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  if (!hasTime) return datePart;
  const timePart = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart}, ${timePart}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskType, setNewTaskType] = useState<CakeType>('tiered');
  const [newTaskVibe, setNewTaskVibe] = useState<VibeId>('classic');
  const [newTaskCategory, setNewTaskCategory] = useState<CategoryId>('other');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDueTime, setNewTaskDueTime] = useState('');
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
      let due: Date | null = null;
      if (newTaskDueDate) {
        const timePart = newTaskDueTime || '23:59';
        due = new Date(`${newTaskDueDate}T${timePart}:00`);
      }
      await createTask({
        name,
        targetMinutes: newTaskMinutes,
        cakeType: newTaskType,
        vibe: newTaskVibe,
        category: newTaskCategory,
        dueDate: due,
      });
      setNewTaskName('');
      setNewTaskMinutes(30);
      setNewTaskType('tiered');
      setNewTaskVibe('classic');
      setNewTaskCategory('other');
      setNewTaskDueDate('');
      setNewTaskDueTime('');
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

  const hasAnyTasks = tasks.length > 0;

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-8 py-4">
      {/* handwritten flourish */}
      {hasAnyTasks && (
        <span
          className="pointer-events-none absolute -top-1 right-0 hidden rotate-[6deg] text-3xl sm:block"
          style={{ fontFamily: 'var(--font-caveat)', color: 'var(--accent)' }}
        >
          keep going ♡
        </span>
      )}

      <header className="flex items-center justify-between">
        <h1
          className="text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          My tasks
        </h1>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            aria-label="New task"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm hover:brightness-110"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        )}
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Loader2 size={18} />}
          count={unfinished.length}
          label="In progress"
        />
        <StatTile
          icon={<CheckCircle2 size={18} />}
          count={completed.length}
          label="Completed"
        />
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col items-center gap-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <label htmlFor="task-name" className="text-sm font-medium text-stone-700">
              What are you working on?
            </label>
            <input
              id="task-name"
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="e.g., Write chapter 3"
              autoFocus
              className="rounded-full border bg-stone-50 px-5 py-3 text-sm focus:bg-white focus:outline-none focus-visible:ring-2"
              style={{ borderColor: 'var(--border-strong)' }}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-medium text-stone-700">Category</p>
            <CategoryPicker value={newTaskCategory} onChange={setNewTaskCategory} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-stone-700">How long will you need?</p>
            <CircularSlider
              value={newTaskMinutes}
              onChange={setNewTaskMinutes}
              min={5}
              max={90}
              step={5}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-medium text-stone-700">What are you baking?</p>
            <CakeTypePicker
              value={newTaskType}
              onChange={setNewTaskType}
              previewVibe={newTaskVibe}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-medium text-stone-700">Pick a vibe</p>
            <VibePicker
              value={newTaskVibe}
              onChange={setNewTaskVibe}
              cakeType={newTaskType}
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="task-due" className="text-sm font-medium text-stone-700">
                Due date <span className="text-xs text-stone-500">(optional)</span>
              </label>
              <input
                id="task-due"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="rounded-full border bg-stone-50 px-5 py-2.5 text-sm focus:bg-white focus:outline-none"
                style={{ borderColor: 'var(--border-strong)' }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="task-time" className="text-sm font-medium text-stone-700">
                Due time <span className="text-xs text-stone-500">(optional)</span>
              </label>
              <input
                id="task-time"
                type="time"
                value={newTaskDueTime}
                onChange={(e) => setNewTaskDueTime(e.target.value)}
                disabled={!newTaskDueDate}
                className="rounded-full border bg-stone-50 px-5 py-2.5 text-sm focus:bg-white focus:outline-none disabled:opacity-40"
                style={{ borderColor: 'var(--border-strong)' }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-full border bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTaskName.trim() || adding}
              className="rounded-full px-6 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {adding ? 'Adding…' : 'Add task'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading…</p>}

      {!loading && !hasAnyTasks && !showAddForm && (
        <>
          <div
            className="flex flex-col items-center gap-5 rounded-3xl border bg-white/80 px-8 py-14 text-center shadow-sm sm:py-16"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <ClipboardList size={30} strokeWidth={1.6} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex flex-col gap-2">
              <h2
                className="text-2xl italic sm:text-3xl"
                style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
              >
                No tasks yet
              </h2>
              <p
                className="max-w-sm text-sm"
                style={{ color: 'var(--ink-muted)' }}
              >
                Create your first task to start baking a cake and track your
                progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-2 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add your first task
            </button>
          </div>

          {/* Quick actions */}
          <section className="flex flex-col gap-2">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Quick actions
            </h3>
            <div
              className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <QuickAction
                icon={<CalendarDays size={16} />}
                label="Plan by date"
                href="/calendar"
              />
              <QuickAction
                icon={<ChefHat size={16} />}
                label="Visit the kitchen"
                href="/kitchen"
              />
            </div>
          </section>
        </>
      )}

      {!loading && hasAnyTasks && (
        <>
          <section className="flex flex-col gap-3">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'var(--ink-muted)' }}
            >
              In progress · {unfinished.length}
            </h2>
            {unfinished.length === 0 ? (
              <p
                className="rounded-2xl border border-dashed bg-white/50 px-6 py-8 text-center text-sm italic"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--ink-muted)' }}
              >
                All caught up here. Nice.
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
              <h2
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--ink-muted)' }}
              >
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

function StatTile({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span
          className="text-3xl font-semibold leading-none text-stone-900"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          {count}
        </span>
        <span
          className="mt-0.5 text-[11px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--ink-muted)' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-stone-50"
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-stone-800">{label}</span>
      <span style={{ color: 'var(--ink-muted)' }}>›</span>
    </Link>
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
  const category = getCategory(task.category);
  const now = new Date();
  const isOverdue =
    task.dueDate && task.status === 'unfinished' && task.dueDate < now;

  return (
    <li
      className="group rounded-2xl border bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span
            className="h-9 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
            aria-hidden
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="text-lg font-medium"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {task.name}
              </h3>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ backgroundColor: category.soft, color: category.color }}
              >
                {category.label}
              </span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
              {task.targetMinutes} min target · {formatDuration(task.totalSecondsFocused)} focused
              {task.status === 'completed' && ' · ✓ done'}
              {task.dueDate && (
                <>
                  {' · '}
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    due {formatDueDate(task.dueDate)}
                    {isOverdue && ' (overdue)'}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {focusable && (
            <Link
              href={`/focus?taskId=${task.id}`}
              className="rounded-full px-5 py-2 text-xs font-medium text-white shadow-sm hover:brightness-110"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Focus
            </Link>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete task"
            className="rounded-full border px-3 py-2 text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-700"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--paper-warm)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(2, progressPct)}%`,
            backgroundColor:
              task.status === 'completed'
                ? '#10b981'
                : progressPct >= 100
                  ? '#f59e0b'
                  : 'var(--accent)',
          }}
        />
      </div>
    </li>
  );
}
