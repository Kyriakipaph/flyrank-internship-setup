import type { TopperKind, VibeStyle } from '@/lib/vibes';

/** Render a topper (cherry, rose, heart, etc.) centered at (cx, cy). */
export function Topper({
  kind,
  cx,
  cy,
  scale = 1,
}: {
  kind: TopperKind;
  cx: number;
  cy: number;
  scale?: number;
}) {
  const s = scale;
  switch (kind) {
    case 'cherry':
      return (
        <g className="cherry-wobble">
          <circle cx={cx} cy={cy} r={5 * s} fill="#dc2626" />
          <path
            d={`M ${cx} ${cy - 5 * s} Q ${cx + 5 * s} ${cy - 12 * s} ${cx + 8 * s} ${cy - 14 * s}`}
            stroke="#166534"
            strokeWidth={1.5 * s}
            fill="none"
          />
        </g>
      );
    case 'rose':
      return (
        <g className="cherry-wobble">
          {/* leaves behind */}
          <path
            d={`M ${cx - 6 * s} ${cy + 2 * s} Q ${cx - 10 * s} ${cy - 2 * s} ${cx - 5 * s} ${cy - 5 * s} Q ${cx - 3 * s} ${cy - 1 * s} ${cx - 6 * s} ${cy + 2 * s} Z`}
            fill="#166534"
          />
          <path
            d={`M ${cx + 6 * s} ${cy + 2 * s} Q ${cx + 10 * s} ${cy - 2 * s} ${cx + 5 * s} ${cy - 5 * s} Q ${cx + 3 * s} ${cy - 1 * s} ${cx + 6 * s} ${cy + 2 * s} Z`}
            fill="#166534"
          />
          {/* rose layers */}
          <circle cx={cx} cy={cy} r={5 * s} fill="#be123c" />
          <circle cx={cx - 1.5 * s} cy={cy - 1 * s} r={3.5 * s} fill="#e11d48" />
          <circle cx={cx + 1 * s} cy={cy - 2 * s} r={2 * s} fill="#f43f5e" />
          <circle cx={cx} cy={cy - 0.5 * s} r={1 * s} fill="#9f1239" />
        </g>
      );
    case 'heart':
      return (
        <g className="cherry-wobble">
          <path
            d={`M ${cx} ${cy + 5 * s}
                C ${cx - 8 * s} ${cy - 1 * s} ${cx - 8 * s} ${cy - 10 * s} ${cx - 3 * s} ${cy - 8 * s}
                C ${cx - 1 * s} ${cy - 7 * s} ${cx} ${cy - 5 * s} ${cx} ${cy - 3 * s}
                C ${cx} ${cy - 5 * s} ${cx + 1 * s} ${cy - 7 * s} ${cx + 3 * s} ${cy - 8 * s}
                C ${cx + 8 * s} ${cy - 10 * s} ${cx + 8 * s} ${cy - 1 * s} ${cx} ${cy + 5 * s} Z`}
            fill="#e11d48"
          />
        </g>
      );
    case 'star':
      return (
        <g className="cherry-wobble">
          <path
            d={`M ${cx},${cy - 8 * s} L ${cx + 2 * s},${cy - 2 * s} L ${cx + 8 * s},${cy - 2 * s} L ${cx + 3 * s},${cy + 2 * s} L ${cx + 5 * s},${cy + 8 * s} L ${cx},${cy + 4 * s} L ${cx - 5 * s},${cy + 8 * s} L ${cx - 3 * s},${cy + 2 * s} L ${cx - 8 * s},${cy - 2 * s} L ${cx - 2 * s},${cy - 2 * s} Z`}
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth={0.5 * s}
          />
        </g>
      );
    case 'flower':
      return (
        <g className="cherry-wobble">
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const px = cx + Math.cos(rad - Math.PI / 2) * 3.5 * s;
            const py = cy + Math.sin(rad - Math.PI / 2) * 3.5 * s;
            return (
              <circle
                key={deg}
                cx={px}
                cy={py}
                r={3 * s}
                fill="#fef3c7"
                stroke="#fde68a"
                strokeWidth={0.4 * s}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={2 * s} fill="#eab308" />
        </g>
      );
    case 'chocolate-curl':
      return (
        <g className="cherry-wobble">
          <path
            d={`M ${cx - 5 * s} ${cy - 2 * s}
                Q ${cx - 3 * s} ${cy - 8 * s} ${cx + 3 * s} ${cy - 6 * s}
                Q ${cx + 7 * s} ${cy - 2 * s} ${cx + 3 * s} ${cy + 3 * s}
                Q ${cx - 1 * s} ${cy + 5 * s} ${cx - 5 * s} ${cy - 2 * s}`}
            fill="#451a03"
            stroke="#292524"
            strokeWidth={0.4 * s}
          />
          <path
            d={`M ${cx - 2 * s} ${cy - 3 * s} Q ${cx} ${cy - 6 * s} ${cx + 2 * s} ${cy - 4 * s}`}
            stroke="#a16207"
            strokeWidth={0.6 * s}
            fill="none"
          />
        </g>
      );
  }
}

/** Sprinkles scattered across a tier top. */
export function Sprinkles({
  style,
  x,
  y,
  width,
}: {
  style: VibeStyle;
  x: number;
  y: number;
  width: number;
}) {
  if (style.sprinkles === 'none') return null;
  const density = style.sprinkles === 'lots' ? 8 : 3;
  const palette =
    style.sprinkles === 'lots'
      ? ['#fbbf24', '#a78bfa', '#22c55e', '#ec4899', '#3b82f6', '#f97316', '#14b8a6', '#dc2626']
      : ['#ec4899', '#f472b6', '#fbcfe8'];
  return (
    <g>
      {Array.from({ length: density }).map((_, i) => {
        const pct = (i + 0.5) / density;
        const color = palette[i % palette.length];
        const cx = x + width * pct;
        const cy = y - 4 - (i % 3);
        const rot = (i * 47) % 90 - 45;
        return (
          <rect
            key={i}
            className="sprinkle-twinkle"
            x={cx - 2}
            y={cy - 0.75}
            width="4.5"
            height="1.8"
            rx="0.5"
            fill={color}
            transform={`rotate(${rot} ${cx} ${cy})`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        );
      })}
    </g>
  );
}

/** Extra painted decoration attached to a tier — pearls, drips, or petals. */
export function TierExtra({
  style,
  x,
  y,
  width,
  height,
  icingColor,
}: {
  style: VibeStyle;
  x: number;
  y: number;
  width: number;
  height: number;
  icingColor: string;
}) {
  if (!style.extra) return null;

  if (style.extra === 'pearls') {
    return (
      <g>
        {Array.from({ length: 8 }).map((_, k) => {
          const spacing = (width - 12) / 7;
          const cx = x + 6 + k * spacing;
          const cy = y + height - 3;
          return (
            <g key={k}>
              <circle
                cx={cx}
                cy={cy}
                r="2.5"
                fill="#ffffff"
                stroke="#e5e7eb"
                strokeWidth="0.4"
              />
              <circle cx={cx - 0.7} cy={cy - 0.8} r="0.7" fill="#ffffff" />
            </g>
          );
        })}
      </g>
    );
  }

  if (style.extra === 'drips') {
    return (
      <g>
        {[0.1, 0.28, 0.5, 0.72, 0.9].map((pct, k) => {
          const cx = x + width * pct;
          const dripLen = 8 + (k % 3) * 4;
          return (
            <g key={k}>
              <path
                d={`M ${cx - 3} ${y + 3}
                    Q ${cx - 3} ${y + dripLen} ${cx} ${y + dripLen + 2}
                    Q ${cx + 3} ${y + dripLen} ${cx + 3} ${y + 3} Z`}
                fill={icingColor}
              />
              <circle
                cx={cx}
                cy={y + dripLen + 3}
                r="2"
                fill={icingColor}
              />
            </g>
          );
        })}
      </g>
    );
  }

  if (style.extra === 'petals') {
    return (
      <g>
        {[
          { x: x + 8, y: y + 8, rot: -20 },
          { x: x + width * 0.4, y: y + 15, rot: 30 },
          { x: x + width * 0.65, y: y + 6, rot: -45 },
          { x: x + width - 10, y: y + 12, rot: 15 },
        ].map((p, i) => (
          <path
            key={i}
            d={`M ${p.x},${p.y}
                Q ${p.x - 3},${p.y - 4} ${p.x},${p.y - 6}
                Q ${p.x + 3},${p.y - 4} ${p.x},${p.y}`}
            fill="#fbcfe8"
            transform={`rotate(${p.rot} ${p.x} ${p.y})`}
          />
        ))}
      </g>
    );
  }

  return null;
}

/** Piped rosette dollops across the top edge of a tier. */
export function DollopRow({
  style,
  x,
  y,
  width,
  color,
}: {
  style: VibeStyle;
  x: number;
  y: number;
  width: number;
  color: string;
}) {
  if (!style.dollops) return null;
  const count = Math.max(3, Math.floor(width / 22));
  return (
    <g>
      {Array.from({ length: count }).map((_, k, arr) => {
        const spacing = (width - 20) / (arr.length - 1);
        return (
          <circle
            key={k}
            className="dollop-bounce"
            cx={x + 10 + k * spacing}
            cy={y - 2}
            r={3.5}
            fill={color}
            style={{ animationDelay: `${k * 0.15}s` }}
          />
        );
      })}
    </g>
  );
}
