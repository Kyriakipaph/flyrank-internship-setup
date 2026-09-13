'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ListTodo,
  Timer,
  CalendarDays,
  ChefHat,
} from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/kitchen', label: 'Kitchen', icon: ChefHat },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  const { task } = useFocus();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur md:hidden"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 py-1.5">
        {ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          // Special badge on Focus tab if a session is active
          const showBadge = item.href === '/focus' && task !== null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--ink-muted)',
              }}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {showBadge && (
                  <span
                    className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
