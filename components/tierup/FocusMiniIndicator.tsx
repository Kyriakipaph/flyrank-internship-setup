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
  const { task, elapsedSeconds, isRunning } = useFocus();

  if (!task) return null;

  return (
    <Link
      href={`/focus?taskId=${task.id}`}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full border border-rose-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur hover:bg-rose-50"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isRunning ? 'animate-pulse bg-rose-500' : 'bg-zinc-400'
        }`}
        aria-hidden
      />
      <span className="text-sm font-medium">
        {isRunning ? 'Focusing' : 'Paused'}: {task.name}
      </span>
      <span className="font-mono text-sm text-rose-500">
        {formatTime(elapsedSeconds)}
      </span>
    </Link>
  );
}
