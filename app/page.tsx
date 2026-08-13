export default function FocusPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Focus session
      </h1>
      <p className="max-w-prose text-zinc-600 dark:text-zinc-400">
        Set a task, start the timer, and watch your cake grow tier by tier.
        Give up early and it gets smashed.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Timer and cake will live here.
      </div>
    </section>
  );
}
