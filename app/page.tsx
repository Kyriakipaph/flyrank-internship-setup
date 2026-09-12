import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-10 text-center">
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-rose-500">
        A focus timer for people who bake
      </div>

      <h1
        className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-7xl"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        Welcome back.
      </h1>

      <p className="max-w-xl text-lg text-stone-600 sm:text-xl">
        Pick a task, set your intention, and let a beautiful cake rise as you
        focus. Small effort, sweet reward.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/tasks"
          className="rounded-full bg-rose-500 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
        >
          Go to my tasks
        </Link>
        <Link
          href="/kitchen"
          className="rounded-full border border-stone-300 bg-white px-8 py-3.5 text-base font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
        >
          Visit the kitchen
        </Link>
      </div>
    </div>
  );
}
