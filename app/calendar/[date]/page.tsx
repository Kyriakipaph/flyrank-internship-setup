'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Sun, Clock, Sparkles, Leaf, Plus, ArrowLeft } from 'lucide-react';
import { createTask, deleteTask, getTasks, type Task } from '@/lib/tasks';
import { getCategory, type CategoryId } from '@/lib/categories';
import CategoryPicker from '@/components/tierup/CategoryPicker';

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const date = new Date(y, mo, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarDayPage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const dateParam = params?.date ?? '';
  const day = useMemo(() => parseIsoDate(dateParam), [dateParam]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('other');
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

  if (!day) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-red-600">Invalid date.</p>
        <Link
          href="/calendar"
          className="rounded-full px-6 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Back to calendar
        </Link>
      </div>
    );
  }

  const dayTasks = tasks
    .filter((t) => t.dueDate && isSameDay(t.dueDate, day))
    .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0));

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!day) return;
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      const timePart = newTime || '23:59';
      const due = new Date(`${dateParam}T${timePart}:00`);
      await createTask({
        name,
        category: newCategory,
        dueDate: due,
      });
      setNewName('');
      setNewTime('');
      setNewCategory('other');
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

  const now = new Date();
  const isPast = day < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isToday = isSameDay(day, now);
  const encouragements = ['you got this ♡', 'better days ahead', 'one step at a time'];
  const encouragement = encouragements[day.getDate() % encouragements.length];

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-8 py-4">
      {/* handwritten flourish */}
      <span
        className="pointer-events-none absolute -top-1 right-2 hidden rotate-[8deg] text-3xl sm:right-4 sm:block"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--accent)' }}
      >
        {encouragement}
      </span>

      <header className="flex flex-col gap-3">
        <Link
          href="/calendar"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium uppercase tracking-wider hover:underline"
          style={{ color: 'var(--ink-muted)' }}
        >
          <ArrowLeft size={12} />
          Calendar
        </Link>
        <h1
          className="text-5xl font-medium leading-none tracking-tight sm:text-6xl"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
        >
          {formatFullDate(day)}
        </h1>
        <p
          className="text-xs font-medium uppercase tracking-[0.25em]"
          style={{ color: 'var(--ink-muted)' }}
        >
          {isToday
            ? 'Today · Small steps, big progress ♡'
            : isPast
              ? 'Looking back'
              : 'Coming up'}
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading…</p>}

      {!loading && (
        <>
          {/* TASK LIST FIRST — dominant */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--ink-muted)' }}
              >
                On this day · {dayTasks.length}
              </h2>
              {dayTasks.length > 0 && !showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:brightness-110"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Add
                </button>
              )}
            </div>

            {dayTasks.length === 0 ? (
              <div
                className="flex flex-col items-center gap-4 rounded-3xl border bg-white/80 px-6 py-14 text-center shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: 'var(--accent-soft)' }}
                >
                  <Leaf size={26} strokeWidth={1.6} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3
                    className="text-xl italic sm:text-2xl"
                    style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
                  >
                    Nothing scheduled
                  </h3>
                  <p className="max-w-sm text-sm" style={{ color: 'var(--ink-muted)' }}>
                    A clear day. Add something to focus on if you&apos;d like.
                  </p>
                </div>
                {!showAddForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="mt-1 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm hover:brightness-110"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Add something for this day
                  </button>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayTasks.map((t) => {
                  const cat = getCategory(t.category);
                  const overdue = t.status === 'unfinished' && t.dueDate && t.dueDate < now;
                  return (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span
                        className="h-12 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-medium text-stone-900">
                            {t.name}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                            style={{ backgroundColor: cat.soft, color: cat.color }}
                          >
                            {cat.label}
                          </span>
                          {t.status === 'completed' && (
                            <span className="text-[10px] font-medium text-emerald-700">
                              ✓ done
                            </span>
                          )}
                          {overdue && (
                            <span className="text-[10px] font-medium text-red-600">
                              overdue
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {t.dueDate && formatTime(t.dueDate)}
                          {' · '}
                          {t.targetMinutes} min target
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {t.status === 'unfinished' && (
                          <button
                            type="button"
                            onClick={() => router.push(`/focus?taskId=${t.id}`)}
                            className="rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:brightness-110"
                            style={{ backgroundColor: 'var(--accent)' }}
                          >
                            Focus
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          aria-label="Delete"
                          className="rounded-full border px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
                          style={{ borderColor: 'var(--border-strong)' }}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ADD FORM — SECONDARY, appears when requested */}
          {showAddForm && (
            <form
              onSubmit={handleAdd}
              className="flex flex-col gap-5 rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                <label
                  htmlFor="quick-name"
                  className="text-base font-medium text-stone-900"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Add something for this day
                </label>
              </div>

              <div
                className="flex items-center gap-3 rounded-full border px-5 py-3"
                style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.6)' }}
              >
                <Sun size={16} style={{ color: 'var(--gold)' }} className="shrink-0" />
                <input
                  id="quick-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Doctor appointment"
                  autoFocus
                  className="flex-1 border-0 bg-transparent text-sm placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="flex flex-1 flex-col gap-2">
                  <p
                    className="text-sm font-medium text-stone-900"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    Category
                  </p>
                  <CategoryPicker value={newCategory} onChange={setNewCategory} />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="quick-time"
                    className="flex items-center gap-1.5 text-sm font-medium text-stone-900"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    Time
                    <span className="text-xs italic text-stone-500">optional</span>
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-full border px-4 py-2"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.6)' }}
                  >
                    <Clock size={14} style={{ color: 'var(--ink-muted)' }} />
                    <input
                      id="quick-time"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="border-0 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
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
                  disabled={!newName.trim() || adding}
                  className="rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {adding ? 'Adding…' : '+ Add to this day'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
