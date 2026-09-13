'use client';

import Link from 'next/link';
import { useFocus } from '@/contexts/FocusContext';

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function FocusMiniIndicator() {
  const { task, elapsedSeconds, isRunning, isOnBreak, breakSecondsRemaining } =
    useFocus();

  if (!task) return null;

  const status = isOnBreak
    ? 'On break'
    : isRunning
      ? 'Focusing'
      : 'Paused';

  const time = isOnBreak ? breakSecondsRemaining : elapsedSeconds;
  const timeColor = isOnBreak ? 'text-amber-700' : 'text-[color:var(--accent)]';
  const dotColor = isOnBreak
    ? 'bg-amber-500 animate-pulse'
    : isRunning
      ? 'bg-[color:var(--accent)] animate-pulse'
      : 'bg-stone-400';

  return (
    <Link
      href={`/focus?taskId=${task.id}`}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full border border-stone-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur hover:bg-stone-50"
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden />
      <span className="text-sm font-medium text-stone-800">
        {status}: {task.name}
      </span>
      <span className={`font-mono text-sm ${timeColor}`}>
        {formatTime(time)}
      </span>
    </Link>
  );
}
