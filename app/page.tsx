import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-10 px-4 text-center">
      {/* handwritten flourishes — moved to fill dead corners */}
      <span
        className="pointer-events-none absolute -top-2 right-2 rotate-[8deg] text-3xl sm:right-6 sm:text-4xl"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--accent)' }}
      >
        you got this ♡
      </span>
      <span
        className="pointer-events-none absolute bottom-6 left-2 -rotate-[6deg] text-2xl sm:left-4 sm:text-3xl"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--ink-muted)' }}
      >
        small steps, big progress
      </span>
      <span
        className="pointer-events-none absolute bottom-8 right-2 rotate-[-5deg] text-2xl sm:right-6 sm:text-3xl"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--ink-muted)' }}
      >
        better days ahead ♡
      </span>

      <p
        className="text-[11px] font-medium uppercase tracking-[0.3em]"
        style={{ color: 'var(--accent)' }}
      >
        A focus timer for people who bake
      </p>

      <h1
        className="text-5xl leading-[1.05] font-medium tracking-tight sm:text-7xl md:text-8xl"
        style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink)' }}
      >
        Set an intention.
        <br />
        <em className="italic" style={{ color: 'var(--accent)' }}>
          Bake a cake.
        </em>
      </h1>

      <p
        className="max-w-lg text-sm leading-relaxed sm:text-base"
        style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--ink-muted)' }}
      >
        A quieter focus timer. Choose a task, pick a shape, and let a small
        edible reward rise as you work.
      </p>

      {/* Widen the hierarchy gap: one dominant CTA, one subtle text link */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Start baking
          <ArrowRight size={18} strokeWidth={2.2} />
        </Link>
        <Link
          href="/kitchen"
          className="text-xs font-medium uppercase tracking-[0.2em] hover:underline"
          style={{ color: 'var(--ink-muted)' }}
        >
          Or visit the kitchen →
        </Link>
      </div>
    </div>
  );
}
