'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTasks, type Task } from '@/lib/tasks';
import { getCategory } from '@/lib/categories';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setTasks(await getTasks());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load tasks.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);

  const grid = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDayOfWeek = firstOfMonth.getDay();
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = startOfDay(t.dueDate).toDateString();
      const existing = map.get(key) ?? [];
      existing.push(t);
      map.set(key, existing);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0),
      );
    }
    return map;
  }, [tasks]);

  // Month stats
  const monthTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate.getFullYear() === cursor.getFullYear() &&
          t.dueDate.getMonth() === cursor.getMonth(),
      ),
    [tasks, cursor],
  );
  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === 'unfinished' &&
          t.dueDate &&
          t.dueDate < today,
      ).length,
    [tasks, today],
  );

  const undated = tasks.filter((t) => !t.dueDate && t.status === 'unfinished');

  function prevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function goToToday() {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
  }

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-8 py-4">
      {/* handwritten flourish top-right */}
      <span
        className="pointer-events-none absolute -top-1 right-2 hidden rotate-[6deg] text-3xl sm:right-4 sm:block"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--accent)' }}
      >
        one day at a time ♡
      </span>
      {/* handwritten flourish bottom-left (fills dead space) */}
      <span
        className="pointer-events-none absolute bottom-4 left-2 hidden -rotate-[6deg] text-2xl sm:left-2 sm:block"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--ink-muted)' }}
      >
        plan gently
      </span>

      <header className="flex items-center justify-between">
        <div>
          <h1
            className="text-4xl font-medium leading-none tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
          >
            Calendar
          </h1>
          <p
            className="mt-3 text-xs font-medium uppercase tracking-[0.25em]"
            style={{ color: 'var(--ink-muted)' }}
          >
            Click a day to plan it
          </p>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="rounded-full border bg-white px-4 py-2 text-xs font-medium shadow-sm hover:bg-stone-50"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--ink)' }}
        >
          Today
        </button>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <CalendarDays size={18} />
          </div>
          <div className="flex flex-col">
            <span
              className="text-3xl font-semibold leading-none"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
            >
              {monthTasks.length}
            </span>
            <span
              className="mt-0.5 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--ink-muted)' }}
            >
              This month
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
          style={{
            borderColor: overdueCount > 0 ? '#fca5a5' : 'var(--border)',
          }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: overdueCount > 0 ? '#fee2e2' : 'var(--paper-warm)',
              color: overdueCount > 0 ? '#b91c1c' : 'var(--ink-muted)',
            }}
          >
            <AlertCircle size={18} />
          </div>
          <div className="flex flex-col">
            <span
              className="text-3xl font-semibold leading-none"
              style={{
                fontFamily: 'var(--font-playfair), serif',
                color: overdueCount > 0 ? '#b91c1c' : 'var(--ink)',
              }}
            >
              {overdueCount}
            </span>
            <span
              className="mt-0.5 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--ink-muted)' }}
            >
              Overdue
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading…</p>}

      {!loading && (
        <>
          {/* Month navigation */}
          <div
            className="flex items-center justify-between rounded-2xl border bg-white/60 px-3 py-2 shadow-sm"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="rounded-full p-2 hover:bg-stone-100"
              style={{ color: 'var(--ink-muted)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <h2
              className="text-xl font-semibold tracking-tight sm:text-2xl"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
            >
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="rounded-full p-2 hover:bg-stone-100"
              style={{ color: 'var(--ink-muted)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid card */}
          <div
            className="rounded-2xl border bg-white p-3 shadow-sm sm:p-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--ink-muted)' }}
            >
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  today={today}
                  tasks={day ? (tasksByDay.get(day.toDateString()) ?? []) : []}
                />
              ))}
            </div>
          </div>

          {undated.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--ink-muted)' }}
              >
                Undated · {undated.length}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {undated.map((t) => {
                  const cat = getCategory(t.category);
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/focus?taskId=${t.id}`}
                        className="flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs hover:bg-stone-50"
                        style={{ borderColor: 'var(--border-strong)', color: 'var(--ink)' }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {t.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DayCell({
  day,
  today,
  tasks,
}: {
  day: Date | null;
  today: Date;
  tasks: Task[];
}) {
  if (!day) {
    return <div className="aspect-square" />;
  }
  const isToday = isSameDay(day, today);
  const isPast = day < today;
  const iso = toIsoDate(day);
  const hasTasks = tasks.length > 0;

  return (
    <Link
      href={`/calendar/${iso}`}
      className="flex aspect-square flex-col gap-1 rounded-lg p-1.5 transition-colors"
      style={{
        border: isToday
          ? '2px solid var(--accent)'
          : hasTasks
            ? '1px solid var(--border)'
            : '1px solid transparent',
        backgroundColor: isToday
          ? 'var(--accent-soft)'
          : hasTasks
            ? 'rgba(255,255,255,0.65)'
            : 'transparent',
      }}
    >
      <div
        className="text-xs font-semibold"
        style={{
          color: isToday
            ? 'var(--accent)'
            : isPast
              ? 'var(--ink-soft)'
              : 'var(--ink)',
        }}
      >
        {day.getDate()}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {tasks.slice(0, 3).map((t) => {
          const cat = getCategory(t.category);
          const overdue = t.status === 'unfinished' && day < today;
          const isDone = t.status === 'completed';
          return (
            <div
              key={t.id}
              className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                isDone ? 'line-through opacity-60' : ''
              }`}
              style={{
                backgroundColor: overdue ? '#fee2e2' : cat.soft,
                color: overdue ? '#b91c1c' : cat.color,
              }}
              title={t.name}
            >
              {t.name}
            </div>
          );
        })}
        {tasks.length > 3 && (
          <span className="text-[9px]" style={{ color: 'var(--ink-muted)' }}>
            +{tasks.length - 3} more
          </span>
        )}
      </div>
    </Link>
  );
}
