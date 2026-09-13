'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
    // sort by time within each day
    for (const list of map.values()) {
      list.sort(
        (a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0),
      );
    }
    return map;
  }, [tasks]);

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
    <div className="flex flex-col gap-8 py-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Calendar
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Click a day to plan it, or a task to focus.
          </p>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="self-start rounded-full border bg-white px-4 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          Today
        </button>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-500">Loading…</p>}

      {!loading && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            >
              ‹
            </button>
            <h2
              className="text-2xl font-medium text-stone-900"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            >
              ›
            </button>
          </div>

          <div
            className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider"
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

          {undated.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
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
                        style={{ borderColor: 'var(--border-strong)' }}
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
  const iso = toIsoDate(day);

  return (
    <Link
      href={`/calendar/${iso}`}
      className="flex aspect-square flex-col gap-1 rounded-lg border p-1.5 transition-colors hover:border-stone-300"
      style={{
        borderColor: isToday ? 'var(--accent)' : 'transparent',
        backgroundColor: isToday ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      <div
        className="text-xs font-medium"
        style={{
          color: isToday
            ? 'var(--accent)'
            : day < today
              ? '#a8a29e'
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
