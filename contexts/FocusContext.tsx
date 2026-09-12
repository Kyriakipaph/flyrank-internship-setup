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

type FocusContextValue = {
  task: Task | null;
  elapsedSeconds: number;
  isRunning: boolean;
  startTask: (task: Task) => void;
  togglePause: () => void;
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

  const elapsedRef = useRef(0);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // The one true timer — runs regardless of which page is mounted.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Autosave to Firebase every N seconds
  useEffect(() => {
    if (!isRunning || !task) return;
    if (elapsedSeconds - lastSavedRef.current >= AUTOSAVE_INTERVAL_SECONDS) {
      lastSavedRef.current = elapsedSeconds;
      void updateTaskTime(task.id, elapsedSeconds).catch(() => {});
    }
  }, [elapsedSeconds, isRunning, task]);

  const startTask = useCallback((t: Task) => {
    setTask(t);
    setElapsedSeconds(t.totalSecondsFocused);
    lastSavedRef.current = t.totalSecondsFocused;
    setIsRunning(true);
  }, []);

  const clear = useCallback(() => {
    setTask(null);
    setElapsedSeconds(0);
    setIsRunning(false);
    lastSavedRef.current = 0;
  }, []);

  const togglePause = useCallback(() => {
    setIsRunning((running) => {
      if (running && task) {
        void updateTaskTime(task.id, elapsedRef.current);
        lastSavedRef.current = elapsedRef.current;
      }
      return !running;
    });
  }, [task]);

  const exit = useCallback(async () => {
    setIsRunning(false);
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
        startTask,
        togglePause,
        exit,
        complete,
        clear,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}
