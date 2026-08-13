export default async function HealthPage() {
  const res = await fetch("https://api.github.com/zen", { cache: "no-store" });
  const quote = res.ok ? await res.text() : null;
  const now = new Date().toISOString();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Health check
      </h1>
      <p className="max-w-prose text-zinc-600 dark:text-zinc-400">
        Proves the deployment can fetch and render data at request time.
      </p>
      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-[max-content_1fr]">
        <dt className="font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
        <dd>{quote ? "OK" : "Fetch failed"}</dd>
        <dt className="font-medium text-zinc-500 dark:text-zinc-400">
          Sample fetch
        </dt>
        <dd className="font-mono text-xs">
          {quote ?? "n/a"}
        </dd>
        <dt className="font-medium text-zinc-500 dark:text-zinc-400">
          Rendered at
        </dt>
        <dd className="font-mono text-xs">{now}</dd>
      </dl>
    </section>
  );
}
