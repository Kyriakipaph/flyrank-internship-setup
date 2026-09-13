import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-10 px-4 text-center">
      {/* handwritten flourishes */}
      <span
        className="pointer-events-none absolute -top-2 right-2 rotate-[8deg] text-3xl sm:right-8 sm:text-4xl"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--accent)' }}
      >
        you got this ♡
      </span>
      <span
        className="pointer-events-none absolute bottom-8 left-2 -rotate-[6deg] text-2xl sm:left-6 sm:text-3xl"
        style={{ fontFamily: 'var(--font-caveat)', color: 'var(--ink-muted)' }}
      >
        small steps, big progress
      </span>

      <p
        className="text-[11px] font-medium uppercase tracking-[0.3em]"
        style={{ color: 'var(--accent)' }}
      >
        A focus timer for people who bake
      </p>

      <h1
        className="text-5xl leading-[1.05] font-medium tracking-tight text-stone-900 sm:text-7xl md:text-8xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        Set an intention.
        <br />
        <em className="italic" style={{ color: 'var(--accent)' }}>
          Bake a cake.
        </em>
      </h1>

      <p
        className="max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        A quieter focus timer. Choose a task, pick a shape, and let a small
        edible reward rise as you work. Come back to a full kitchen.
      </p>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
        <Link
          href="/tasks"
          className="rounded-full px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-110"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Start baking
        </Link>
        <Link
          href="/kitchen"
          className="rounded-full border bg-white px-8 py-3.5 text-sm font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          Visit the kitchen
        </Link>
      </div>
    </div>
  );
}
