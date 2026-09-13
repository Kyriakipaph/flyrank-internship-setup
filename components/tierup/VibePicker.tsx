'use client';

import { VIBES, type VibeId } from '@/lib/vibes';
import type { CakeType } from '@/lib/tasks';
import MiniCake from './MiniCake';

type Props = {
  value: VibeId;
  onChange: (v: VibeId) => void;
  /** Show mini previews in this cake shape (cupcake, cake, tiered) */
  cakeType: CakeType;
};

export default function VibePicker({ value, onChange, cakeType }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {VIBES.map((vibe) => {
        const selected = value === vibe.id;
        return (
          <button
            key={vibe.id}
            type="button"
            onClick={() => onChange(vibe.id)}
            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
              selected
                ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold text-stone-900"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {vibe.label}
              </p>
              <p className="text-xs text-stone-500">{vibe.description}</p>
            </div>
            <MiniCake
              vibe={vibe}
              type={cakeType}
              className="h-12 w-12 shrink-0"
            />
          </button>
        );
      })}
    </div>
  );
}
