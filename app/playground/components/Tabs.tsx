'use client';

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type TabItem = {
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
};

export default function Tabs({ items }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        focusTab((index + 1) % items.length);
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        focusTab((index - 1 + items.length) % items.length);
        break;
      }
      case 'Home': {
        e.preventDefault();
        focusTab(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        focusTab(items.length - 1);
        break;
      }
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700"
      >
        {items.map((item, index) => {
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          const isActive = index === activeIndex;
          return (
            <button
              key={tabId}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => {
        const tabId = `${baseId}-tab-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        const isActive = index === activeIndex;
        return (
          <div
            key={panelId}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            className="pt-4"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
