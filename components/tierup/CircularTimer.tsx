type Props = {
  elapsedSeconds: number;
  targetSeconds: number;
};

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function CircularTimer({
  elapsedSeconds,
  targetSeconds,
}: Props) {
  const rawProgress = targetSeconds > 0 ? elapsedSeconds / targetSeconds : 0;
  const progress = Math.min(rawProgress, 1);
  const isBonus = rawProgress > 1;
  const bonusSeconds = Math.max(0, elapsedSeconds - targetSeconds);

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  // dot position — start from top (12 o'clock), go clockwise
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = 100 + radius * Math.cos(angle);
  const dotY = 100 + radius * Math.sin(angle);

  const strokeColor = isBonus ? '#eab308' : '#f43f5e';

  const centerLabel = isBonus
    ? `+${formatTime(bonusSeconds)}`
    : formatTime(Math.max(0, targetSeconds - elapsedSeconds));

  const subLabel = isBonus
    ? 'bonus time'
    : `of ${formatTime(targetSeconds)}`;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 200 200"
        className="h-52 w-52 sm:h-60 sm:w-60"
        role="img"
        aria-label={`${formatTime(elapsedSeconds)} elapsed of ${formatTime(targetSeconds)}`}
      >
        {/* background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#ffe4e6"
          strokeWidth="10"
        />

        {/* progress arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />

        {/* leading dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="9"
          fill={strokeColor}
          style={{
            transition:
              'cx 1s linear, cy 1s linear, fill 0.3s ease',
          }}
        />
        <circle
          cx={dotX}
          cy={dotY}
          r="3.5"
          fill="#ffffff"
          style={{ transition: 'cx 1s linear, cy 1s linear' }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums sm:text-5xl"
          style={{
            fontFamily: 'var(--font-playfair), serif',
            color: strokeColor,
          }}
        >
          {centerLabel}
        </span>
        <span className="mt-1 text-xs uppercase tracking-wider text-stone-500">
          {subLabel}
        </span>
      </div>
    </div>
  );
}
