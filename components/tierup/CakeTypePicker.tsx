'use client';

import type { CakeType } from '@/lib/tasks';
import { getVibe, type VibeId } from '@/lib/vibes';
import MiniCake from './MiniCake';

type Props = {
  value: CakeType;
  onChange: (t: CakeType) => void;
  /** vibe used just for the preview colours */
  previewVibe: VibeId;
};

const OPTIONS: { id: CakeType; label: string; description: string }[] = [
  {
    id: 'cupcake',
    label: 'Cupcake',
    description: 'A single sweet — perfect for short focus',
  },
  {
    id: 'cake',
    label: 'Cake',
    description: 'A whole cake for a proper session',
  },
  {
    id: 'tiered',
    label: 'Tiered cake',
    description: 'A tall, showstopping build for deep work',
  },
];

export default function CakeTypePicker({
  value,
  onChange,
  previewVibe,
}: Props) {
  const vibe = getVibe(previewVibe);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
              selected
                ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <MiniCake vibe={vibe} type={opt.id} className="h-14 w-14 shrink-0" />
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-stone-900"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {opt.label}
              </p>
              <p className="text-xs text-stone-500">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
