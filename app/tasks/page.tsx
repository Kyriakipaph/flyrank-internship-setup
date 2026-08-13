export default function TasksPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Tasks
      </h1>
      <p className="max-w-prose text-zinc-600 dark:text-zinc-400">
        Plan what you want to work on. Tick items off as you finish focus
        sessions.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Task list will live here.
      </div>
    </section>
  );
}
