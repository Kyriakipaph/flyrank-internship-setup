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

export function FocusProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState<Task | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(0);
  const [breaksTaken, setBreaksTaken] = useState(0);

  const elapsedRef = useRef(0);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Focus timer — only ticks when running and NOT on break
  useEffect(() => {
    if (!isRunning || isOnBreak) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, isOnBreak]);

  // Break countdown
  useEffect(() => {
    if (!isOnBreak) return;
    const id = setInterval(() => {
      setBreakSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsOnBreak(false);
          setIsRunning(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isOnBreak]);

  // Autosave
  useEffect(() => {
    if (!isRunning || isOnBreak || !task) return;
    if (elapsedSeconds - lastSavedRef.current >= AUTOSAVE_INTERVAL_SECONDS) {
      lastSavedRef.current = elapsedSeconds;
      void updateTaskTime(task.id, elapsedSeconds).catch(() => {});
    }
  }, [elapsedSeconds, isRunning, isOnBreak, task]);

  const startTask = useCallback((t: Task) => {
    setTask(t);
    setElapsedSeconds(t.totalSecondsFocused);
    lastSavedRef.current = t.totalSecondsFocused;
    setIsRunning(true);
    setIsOnBreak(false);
    setBreakSecondsRemaining(0);
    setBreaksTaken(0);
  }, []);

  const clear = useCallback(() => {
    setTask(null);
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsOnBreak(false);
    setBreakSecondsRemaining(0);
    setBreaksTaken(0);
    lastSavedRef.current = 0;
  }, []);

  const startBreak = useCallback(() => {
    if (breaksTaken >= MAX_BREAKS_PER_SESSION) return;
    if (task) {
      void updateTaskTime(task.id, elapsedRef.current);
      lastSavedRef.current = elapsedRef.current;
    }
    setBreaksTaken((n) => n + 1);
    setIsRunning(false);
    setIsOnBreak(true);
    setBreakSecondsRemaining(BREAK_DURATION_SECONDS);
  }, [task, breaksTaken]);

  const endBreak = useCallback(() => {
    setIsOnBreak(false);
    setBreakSecondsRemaining(0);
    setIsRunning(true);
  }, []);

  const exit = useCallback(async () => {
    setIsRunning(false);
    setIsOnBreak(false);
    setBreakSecondsRemaining(0);
    const current = task;
    const time = elapsedRef.current;
    if (current) {
      try {
        await updateTaskTime(current.id, time);
      } catch {}
    }
    clear();
  }, [task, clear]);

  const complete = useCallback(async () => {
    setIsRunning(false);
    setIsOnBreak(false);
    setBreakSecondsRemaining(0);
    const current = task;
    const time = elapsedRef.current;
    if (current) {
      try {
        await completeTask(current.id, time);
      } catch {}
    }
    clear();
  }, [task, clear]);

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
