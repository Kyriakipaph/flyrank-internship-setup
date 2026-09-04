import Disclosure from './components/Disclosure';
import Tabs from './components/Tabs';
import ModalDemo from './ModalDemo';

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Playground</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Accessible components built from scratch for FE-05.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Disclosure</h2>
        <Disclosure label="What is TierUp?">
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            TierUp is a focus timer that grows a tiered cake while you work.
            The longer you stay focused, the taller the cake gets.
          </p>
        </Disclosure>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Modal</h2>
        <ModalDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Tabs</h2>
        <Tabs
          items={[
            {
              label: 'Overview',
              content: (
                <p className="text-zinc-700 dark:text-zinc-300">
                  Set a task, start the timer, and watch your cake rise.
                </p>
              ),
            },
            {
              label: 'Rules',
              content: (
                <p className="text-zinc-700 dark:text-zinc-300">
                  Give up early and the cake gets smashed.
                </p>
              ),
            },
            {
              label: 'History',
              content: (
                <p className="text-zinc-700 dark:text-zinc-300">
                  Every completed cake is saved in your kitchen.
                </p>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
