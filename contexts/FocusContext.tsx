'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { completeTask, updateTaskTime, type Task } from '@/lib/tasks';

const AUTOSAVE_INTERVAL_SECONDS = 15;
const BREAK_DURATION_SECONDS = 5 * 60; // 5 minutes
const MAX_BREAKS_PER_SESSION = 1;
const STORAGE_KEY = 'tierup:session';

type FocusContextValue = {
  task: Task | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isOnBreak: boolean;
  breakSecondsRemaining: number;
  breaksTaken: number;
  breaksAllowed: number;
  canTakeBreak: boolean;
  startTask: (task: Task) => void;
  startBreak: () => void;
  endBreak: () => void;
  exit: () => Promise<void>;
  complete: () => Promise<void>;
  clear: () => void;
};

const FocusContext = createContext<FocusContextValue | null>(null);

export function useFocus(): FocusContextValue {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used inside FocusProvider');
  return ctx;
}

/**
 * Persisted session shape. All times are absolute ms timestamps so the elapsed
 * value survives tab-close, reload, and background throttling.
 */
type PersistedSession = {
  task: Task;
  // When the current RUNNING span started. null while on break or stopped.
  spanStartedAt: number | null;
  // Seconds accumulated BEFORE the current running span started.
  accumulated: number;
  isOnBreak: boolean;
  // Absolute end time of the current break (ms). null when not on break.
  breakEndsAt: number | null;
  breaksTaken: number;
};

function readSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession & {
      task: Task & {
        createdAt: string;
        completedAt?: string;
        dueDate?: string;
      };
    };
    // Revive Date fields on the serialized Task.
    const task: Task = {
      ...parsed.task,
      createdAt: new Date(parsed.task.createdAt),
      completedAt: parsed.task.completedAt
        ? new Date(parsed.task.completedAt)
        : undefined,
      dueDate: parsed.task.dueDate ? new Date(parsed.task.dueDate) : undefined,
    };
    return { ...parsed, task };
  } catch {
    return null;
  }
}

function writeSession(session: PersistedSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // storage disabled; session simply won't survive reload
  }
}

/**
 * Convert accumulated + current span start into total elapsed seconds.
 * Treats "paused" (no spanStartedAt) as just the accumulated value.
 */
function computeElapsed(
  accumulated: number,
  spanStartedAt: number | null,
  now: number,
): number {
  if (spanStartedAt === null) return accumulated;
  return accumulated + Math.max(0, (now - spanStartedAt) / 1000);
}

export function FocusProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState<Task | null>(null);
  const [spanStartedAt, setSpanStartedAt] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakEndsAt, setBreakEndsAt] = useState<number | null>(null);
  const [breaksTaken, setBreaksTaken] = useState(0);
  // A monotonically-increasing tick that re-renders consumers once per second
  // so elapsed/break-remaining stay fresh even though they derive from Date.now().
  const [, setTick] = useState(0);

  const lastSavedRef = useRef(0);

  const isRunning = spanStartedAt !== null && !isOnBreak;

  // Snapshot current session for persistence.
  const persistCurrent = useCallback(
    (overrides?: Partial<PersistedSession>) => {
      if (!task) {
        writeSession(null);
        return;
      }
      const snapshot: PersistedSession = {
        task,
        spanStartedAt,
        accumulated,
        isOnBreak,
        breakEndsAt,
        breaksTaken,
        ...overrides,
      };
      writeSession(snapshot);
    },
    [task, spanStartedAt, accumulated, isOnBreak, breakEndsAt, breaksTaken],
  );

  // Restore any persisted session on mount.
  useEffect(() => {
    const saved = readSession();
    if (!saved) return;
    const now = Date.now();

    // If the break has already elapsed while the tab was closed, auto-resume.
    if (saved.isOnBreak && saved.breakEndsAt !== null && now >= saved.breakEndsAt) {
      setTask(saved.task);
      setAccumulated(saved.accumulated);
      setIsOnBreak(false);
      setBreakEndsAt(null);
      setBreaksTaken(saved.breaksTaken);
      setSpanStartedAt(now);
      return;
    }

    setTask(saved.task);
    setAccumulated(saved.accumulated);
    setIsOnBreak(saved.isOnBreak);
    setBreakEndsAt(saved.breakEndsAt);
    setBreaksTaken(saved.breaksTaken);
    setSpanStartedAt(saved.spanStartedAt);
  }, []);

  // Persist whenever durable state changes.
  useEffect(() => {
    if (!task) return;
    persistCurrent();
  }, [task, spanStartedAt, accumulated, isOnBreak, breakEndsAt, breaksTaken, persistCurrent]);

  // Heartbeat: re-render ~1Hz so the derived elapsed value refreshes on screen.
  // The underlying truth is Date.now(), not this tick.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // End-of-break auto-resume while the tab is actually open.
  useEffect(() => {
    if (!isOnBreak || breakEndsAt === null) return;
    const now = Date.now();
    if (now >= breakEndsAt) {
      setIsOnBreak(false);
      setBreakEndsAt(null);
      setSpanStartedAt(Date.now());
      return;
    }
    const remainingMs = breakEndsAt - now;
    const id = setTimeout(() => {
      setIsOnBreak(false);
      setBreakEndsAt(null);
      setSpanStartedAt(Date.now());
    }, remainingMs);
    return () => clearTimeout(id);
  }, [isOnBreak, breakEndsAt]);

  // Autosave the accumulated elapsed back to Firestore every ~15s.
  const elapsedForAutosave = computeElapsed(accumulated, spanStartedAt, Date.now());
  useEffect(() => {
    if (!task || !isRunning) return;
    const seconds = Math.floor(elapsedForAutosave);
    if (seconds - lastSavedRef.current >= AUTOSAVE_INTERVAL_SECONDS) {
      lastSavedRef.current = seconds;
      void updateTaskTime(task.id, seconds).catch(() => {});
    }
  }, [task, isRunning, elapsedForAutosave]);

  const startTask = useCallback((t: Task) => {
    setTask(t);
    setAccumulated(t.totalSecondsFocused);
    lastSavedRef.current = t.totalSecondsFocused;
    setIsOnBreak(false);
    setBreakEndsAt(null);
    setBreaksTaken(0);
    setSpanStartedAt(Date.now());
  }, []);

  const clear = useCallback(() => {
    setTask(null);
    setSpanStartedAt(null);
    setAccumulated(0);
    setIsOnBreak(false);
    setBreakEndsAt(null);
    setBreaksTaken(0);
    lastSavedRef.current = 0;
    writeSession(null);
  }, []);

  const startBreak = useCallback(() => {
    if (breaksTaken >= MAX_BREAKS_PER_SESSION) return;
    const now = Date.now();
    const elapsedNow = computeElapsed(accumulated, spanStartedAt, now);
    if (task) {
      void updateTaskTime(task.id, Math.floor(elapsedNow)).catch(() => {});
      lastSavedRef.current = Math.floor(elapsedNow);
    }
    setAccumulated(elapsedNow);
    setSpanStartedAt(null);
    setBreaksTaken((n) => n + 1);
    setIsOnBreak(true);
    setBreakEndsAt(now + BREAK_DURATION_SECONDS * 1000);
  }, [accumulated, spanStartedAt, task, breaksTaken]);

  const endBreak = useCallback(() => {
    setIsOnBreak(false);
    setBreakEndsAt(null);
    setSpanStartedAt(Date.now());
  }, []);

  const exit = useCallback(async () => {
    const current = task;
    const elapsedNow = computeElapsed(accumulated, spanStartedAt, Date.now());
    setSpanStartedAt(null);
    setIsOnBreak(false);
    setBreakEndsAt(null);
    if (current) {
      try {
        await updateTaskTime(current.id, Math.floor(elapsedNow));
      } catch {}
    }
    clear();
  }, [task, accumulated, spanStartedAt, clear]);

  const complete = useCallback(async () => {
    const current = task;
    const elapsedNow = computeElapsed(accumulated, spanStartedAt, Date.now());
    setSpanStartedAt(null);
    setIsOnBreak(false);
    setBreakEndsAt(null);
    if (current) {
      try {
        await completeTask(current.id, Math.floor(elapsedNow));
      } catch {}
    }
    clear();
  }, [task, accumulated, spanStartedAt, clear]);

  // Final derived values at render time.
  const now = Date.now();
  const elapsedSeconds = Math.floor(computeElapsed(accumulated, spanStartedAt, now));
  const breakSecondsRemaining =
    isOnBreak && breakEndsAt !== null
      ? Math.max(0, Math.ceil((breakEndsAt - now) / 1000))
      : 0;

  return (
    <FocusContext.Provider
      value={{
        task,
        elapsedSeconds,
        isRunning,
        isOnBreak,
        breakSecondsRemaining,
        breaksTaken,
        breaksAllowed: MAX_BREAKS_PER_SESSION,
        canTakeBreak: breaksTaken < MAX_BREAKS_PER_SESSION,
        startTask,
        startBreak,
        endBreak,
        exit,
        complete,
        clear,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}
