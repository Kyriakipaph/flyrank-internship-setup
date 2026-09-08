'use client';

import { useEffect, useState } from 'react';
import Cake from './Cake';

const MAX_TIERS = 6;
const SECONDS_PER_TIER = 5; // TESTING: 5s

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function bakingStatus(elapsedSeconds: number): string {
  const completedTiers = Math.floor(elapsedSeconds / SECONDS_PER_TIER);
  if (completedTiers >= MAX_TIERS) return 'Decorating your masterpiece…';
  return `Baking layer ${completedTiers + 1}…`;
}

export default function FocusSession() {
  const [taskName, setTaskName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  function handleStart() {
    if (!taskName.trim()) return;
    setElapsedSeconds(0);
    setHasStarted(true);
    setIsRunning(true);
  }

  function togglePause() {
    setIsRunning((prev) => !prev);
  }

  function giveUp() {
    setHasStarted(false);
    setIsRunning(false);
    setElapsedSeconds(0);
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center gap-8 py-4">
        <h1
          className="text-center text-4xl font-semibold tracking-tight sm:text-5xl"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Ready to focus?
        </h1>

        <div className="flex w-full max-w-md flex-col gap-2">
          <label htmlFor="task-input" className="text-sm font-medium">
            What are you focusing on?
          </label>
          <input
            id="task-input"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g., Write chapter 3"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={!taskName.trim()}
          className="rounded-md bg-pink-500 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start focus session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:gap-6 sm:py-4">
      <h1
        className="text-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {taskName}
      </h1>

      <Cake elapsedSeconds={elapsedSeconds} showBaking={isRunning} />

      <p
        className="font-bold tabular-nums text-5xl sm:text-6xl md:text-7xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {formatTime(elapsedSeconds)}
      </p>

      <div className="flex gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePause}
          className="min-w-36 rounded-md border border-zinc-300 px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 sm:min-w-40 sm:px-8 sm:py-3 sm:text-base dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={giveUp}
          className="min-w-36 rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 sm:min-w-40 sm:px-8 sm:py-3 sm:text-base"
        >
          Give up
        </button>
      </div>
    </div>
  );
}
