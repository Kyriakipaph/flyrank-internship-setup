'use client';

import { type ReactNode } from 'react';
import { FocusProvider } from '@/contexts/FocusContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <FocusProvider>{children}</FocusProvider>;
}
