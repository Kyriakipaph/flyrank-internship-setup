'use client';

import {
  Briefcase,
  GraduationCap,
  User,
  Heart,
  Palette,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES, type CategoryId } from '@/lib/categories';

type Props = {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
};

const ICON_BY_ID: Record<CategoryId, LucideIcon> = {
  work: Briefcase,
  study: GraduationCap,
  personal: User,
  health: Heart,
  creative: Palette,
  other: MoreHorizontal,
};

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_BY_ID[cat.id];
        const selected = value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all"
            style={{
              borderColor: selected ? cat.border : 'transparent',
              backgroundColor: selected ? cat.soft : 'rgba(255,255,255,0.7)',
              color: selected ? cat.color : 'var(--ink-muted)',
              boxShadow: selected
                ? `0 1px 2px ${cat.color}22`
                : 'inset 0 0 0 1px var(--border)',
            }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: cat.soft, color: cat.color }}
            >
              <Icon size={12} strokeWidth={2.2} />
            </span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
