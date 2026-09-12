import { Suspense } from 'react';
import FocusSession from '@/components/tierup/FocusSession';

export default function FocusPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <FocusSession />
      </Suspense>
    </div>
  );
}
