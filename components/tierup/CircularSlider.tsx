'use client';

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type Props = {
  value: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function CircularSlider({
  value,
  onChange,
  min = 5,
  max = 90,
  step = 5,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const radius = 82;
  const centerX = 100;
  const centerY = 100;
  const circumference = 2 * Math.PI * radius;

  const progress = (value - min) / (max - min);
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);
  const offset = circumference * (1 - progress);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let a = Math.atan2(dy, dx) + Math.PI / 2;
      if (a < 0) a += 2 * Math.PI;
      const prog = a / (2 * Math.PI);
      const raw = min + prog * (max - min);
      const snapped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, snapped));
      if (clamped !== value) onChange(clamped);
    },
    [onChange, min, max, step, value],
  );

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY);
  }

  function handlePointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setDragging(false);
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="h-60 w-60 cursor-pointer touch-none select-none sm:h-64 sm:w-64"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Task duration in minutes"
      >
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#ffe4e6"
          strokeWidth="10"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${centerX} ${centerY})`}
          style={{
            transition: dragging
              ? 'none'
              : 'stroke-dashoffset 0.15s ease-out',
          }}
        />
        {/* handle */}
        <circle
          cx={dotX}
          cy={dotY}
          r="14"
          fill="#f43f5e"
          style={{
            transition: dragging ? 'none' : 'cx 0.15s ease-out, cy 0.15s ease-out',
            filter: 'drop-shadow(0 2px 4px rgba(244, 63, 94, 0.4))',
          }}
        />
        <circle
          cx={dotX}
          cy={dotY}
          r="5"
          fill="#ffffff"
          style={{
            transition: dragging ? 'none' : 'cx 0.15s ease-out, cy 0.15s ease-out',
          }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{
            fontFamily: 'var(--font-playfair), serif',
            color: '#f43f5e',
          }}
        >
          {value}
        </span>
        <span className="mt-1 text-xs uppercase tracking-wider text-stone-500">
          minutes
        </span>
      </div>
    </div>
  );
}
