'use client';

import { useState, useId, type ReactNode } from 'react';

type DisclosureProps = {
  label: string;
  children: ReactNode;
};

export default function Disclosure({ label, children }: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
      </button>

      {isOpen && <div id={panelId}>{children}</div>}
    </div>
  );
}
