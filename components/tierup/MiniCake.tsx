'use client';

import { useId } from 'react';
import type { CakeType } from '@/lib/tasks';
import type { Vibe, TierColor } from '@/lib/vibes';
import { Topper } from './vibeElements';

type Props = {
  vibe: Vibe;
  type?: CakeType;
  className?: string;
};

export default function MiniCake({ vibe, type = 'tiered', className }: Props) {
  if (type === 'cupcake') return <MiniCupcake vibe={vibe} className={className} />;
  if (type === 'cake') return <MiniSingleCake vibe={vibe} className={className} />;
  return <MiniTieredCake vibe={vibe} className={className} />;
}

/** Reusable gradient defs for a tier body — light on top, deeper at bottom. */
function TierGradient({ id, color }: { id: string; color: TierColor }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color.body} />
      <stop offset="100%" stopColor={color.darker} />
    </linearGradient>
  );
}

/** Soft radial highlight — makes icing look glossy. */
function IcingHighlight({ id, color }: { id: string; color: TierColor }) {
  return (
    <radialGradient id={id} cx="0.35" cy="0.3" r="0.7">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="40%" stopColor={color.icing} stopOpacity="0" />
    </radialGradient>
  );
}

/* ---------- TIERED ---------- */
function MiniTieredCake({ vibe, className }: { vibe: Vibe; className?: string }) {
  const [t1, t2, t3] = vibe.tiers;
  const style = vibe.style;
  const isZen = vibe.id === 'zen';
  const isElegant = vibe.id === 'elegant';

  const uid = useId().replace(/:/g, '');
  const g1 = `${uid}-t1`;
  const g2 = `${uid}-t2`;
  const g3 = `${uid}-t3`;
  const h1 = `${uid}-h1`;
  const h2 = `${uid}-h2`;
  const h3 = `${uid}-h3`;

  return (
    <svg
      viewBox="0 0 80 70"
      className={className ?? 'h-14 w-16'}
      role="img"
      aria-label={`Mini ${vibe.label} cake`}
    >
      <defs>
        <TierGradient id={g1} color={t1} />
        <TierGradient id={g2} color={t2} />
        <TierGradient id={g3} color={t3} />
        <IcingHighlight id={h1} color={t1} />
        <IcingHighlight id={h2} color={t2} />
        <IcingHighlight id={h3} color={t3} />
        {/* plate gradient */}
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2d9c7" />
          <stop offset="100%" stopColor="#a89e8a" />
        </linearGradient>
      </defs>

      {/* plate with soft shadow */}
      <ellipse cx="40" cy="66" rx="34" ry="2.5" fill="#0000001a" />
      <ellipse cx="40" cy="64" rx="34" ry="2.5" fill={`url(#${uid}-plate)`} />
      <ellipse cx="40" cy="63" rx="32" ry="1.4" fill="#f4ecdc" />

      {/* Bottom tier */}
      <rect
        x={isElegant ? 12 : 8}
        y={isElegant ? 44 : 46}
        width={isElegant ? 56 : 64}
        height={isElegant ? 16 : 14}
        rx="3"
        fill={`url(#${g1})`}
      />
      {/* highlight sheen */}
      <rect
        x={isElegant ? 12 : 8}
        y={isElegant ? 44 : 46}
        width={isElegant ? 56 : 64}
        height="3"
        rx="3"
        fill="#ffffff"
        opacity="0.35"
      />
      {/* icing puddle */}
      <ellipse
        cx="40"
        cy={isElegant ? 44 : 46}
        rx={isElegant ? 27 : 30}
        ry="2.8"
        fill={t1.icing}
      />
      <ellipse
        cx="40"
        cy={isElegant ? 44 : 46}
        rx={isElegant ? 27 : 30}
        ry="2.8"
        fill={`url(#${h1})`}
      />

      {style.dollops &&
        [15, 25, 35, 45, 55, 65].map((cx, i) => (
          <g key={`d1-${i}`}>
            <circle cx={cx} cy={45} r="1.7" fill={t1.icing} />
            <circle cx={cx - 0.4} cy={44.6} r="0.6" fill="#ffffff" opacity="0.5" />
          </g>
        ))}

      {style.extra === 'pearls' &&
        [17, 26, 35, 44, 53, 62].map((cx, i) => (
          <g key={`p1-${i}`}>
            <circle cx={cx} cy={58} r="1.6" fill="#f9f4ea" stroke="#d6c9af" strokeWidth="0.3" />
            <circle cx={cx - 0.5} cy={57.5} r="0.5" fill="#ffffff" />
          </g>
        ))}

      {style.extra === 'drips' &&
        [12, 22, 32, 42, 52, 62].map((cx, i) => {
          const dripLen = 5 + (i % 3);
          return (
            <g key={`dr1-${i}`}>
              <path
                d={`M ${cx - 1.2} 47 Q ${cx - 1.2} ${47 + dripLen} ${cx} ${48 + dripLen} Q ${cx + 1.2} ${47 + dripLen} ${cx + 1.2} 47 Z`}
                fill={t1.icing}
              />
              <circle cx={cx} cy={48 + dripLen} r="0.9" fill={t1.icing} />
              <circle cx={cx - 0.3} cy={48 + dripLen - 0.3} r="0.3" fill="#ffffff" opacity="0.4" />
            </g>
          );
        })}

      {style.extra === 'petals' &&
        [
          { x: 16, y: 52, rot: -20 },
          { x: 32, y: 55, rot: 30 },
          { x: 48, y: 52, rot: -45 },
          { x: 62, y: 55, rot: 15 },
        ].map((p, i) => (
          <path
            key={`pt1-${i}`}
            d={`M ${p.x},${p.y} Q ${p.x - 1.8},${p.y - 2.5} ${p.x},${p.y - 3.5} Q ${p.x + 1.8},${p.y - 2.5} ${p.x},${p.y}`}
            fill={t3.icing}
            opacity="0.9"
            transform={`rotate(${p.rot} ${p.x} ${p.y})`}
          />
        ))}

      {style.sprinkles === 'lots' &&
        ['#eab308', '#8b5cf6', '#22c55e', '#ec4899', '#0ea5e9', '#f97316'].map(
          (color, i) => {
            const cx = 12 + i * 10;
            const cy = 43 - (i % 2);
            return (
              <rect
                key={`s1-${i}`}
                x={cx - 1.6}
                y={cy - 0.4}
                width="3.2"
                height="1"
                rx="0.3"
                fill={color}
                transform={`rotate(${i * 30} ${cx} ${cy})`}
              />
            );
          },
        )}

      {/* Middle tier */}
      <rect
        x={isElegant ? 20 : 18}
        y={isElegant ? 28 : 32}
        width={isElegant ? 40 : 44}
        height={isElegant ? 15 : 13}
        rx="3"
        fill={`url(#${g2})`}
      />
      <rect
        x={isElegant ? 20 : 18}
        y={isElegant ? 28 : 32}
        width={isElegant ? 40 : 44}
        height="2.5"
        rx="3"
        fill="#ffffff"
        opacity="0.35"
      />
      <ellipse cx="40" cy={isElegant ? 28 : 32} rx={isElegant ? 19 : 21} ry="2.4" fill={t2.icing} />
      <ellipse cx="40" cy={isElegant ? 28 : 32} rx={isElegant ? 19 : 21} ry="2.4" fill={`url(#${h2})`} />

      {style.dollops &&
        [22, 30, 40, 50, 58].map((cx, i) => (
          <g key={`d2-${i}`}>
            <circle cx={cx} cy={31} r="1.4" fill={t2.icing} />
            <circle cx={cx - 0.3} cy={30.7} r="0.5" fill="#ffffff" opacity="0.5" />
          </g>
        ))}

      {style.extra === 'pearls' &&
        [23, 32, 40, 48, 57].map((cx, i) => (
          <g key={`p2-${i}`}>
            <circle cx={cx} cy={43} r="1.2" fill="#f9f4ea" stroke="#d6c9af" strokeWidth="0.3" />
            <circle cx={cx - 0.4} cy={42.5} r="0.4" fill="#ffffff" />
          </g>
        ))}

      {style.extra === 'drips' &&
        [22, 30, 40, 50, 58].map((cx, i) => (
          <g key={`dr2-${i}`}>
            <path
              d={`M ${cx - 1} 33 Q ${cx - 1} 38 ${cx} 39 Q ${cx + 1} 38 ${cx + 1} 33 Z`}
              fill={t2.icing}
            />
            <circle cx={cx} cy={39} r="0.8" fill={t2.icing} />
          </g>
        ))}

      {style.sprinkles === 'lots' &&
        ['#fbbf24', '#a78bfa', '#22c55e', '#ec4899'].map((color, i) => {
          const cx = 22 + i * 12;
          return (
            <rect
              key={`s2-${i}`}
              x={cx - 1.3}
              y={29.7}
              width="2.6"
              height="0.9"
              rx="0.3"
              fill={color}
              transform={`rotate(${i * 45 - 30} ${cx} 30)`}
            />
          );
        })}

      {/* Top tier (Zen skips this) */}
      {!isZen && (
        <>
          <rect
            x={isElegant ? 30 : 28}
            y={isElegant ? 14 : 20}
            width={isElegant ? 20 : 24}
            height={isElegant ? 14 : 11}
            rx="3"
            fill={`url(#${g3})`}
          />
          <rect
            x={isElegant ? 30 : 28}
            y={isElegant ? 14 : 20}
            width={isElegant ? 20 : 24}
            height="2"
            rx="3"
            fill="#ffffff"
            opacity="0.3"
          />
          <ellipse cx="40" cy={isElegant ? 14 : 20} rx={isElegant ? 9 : 11} ry="1.8" fill={t3.icing} />
          <ellipse cx="40" cy={isElegant ? 14 : 20} rx={isElegant ? 9 : 11} ry="1.8" fill={`url(#${h3})`} />
          {style.dollops &&
            [32, 40, 48].map((cx, i) => (
              <circle key={`d3-${i}`} cx={cx} cy={19} r="1.1" fill={t3.icing} />
            ))}
        </>
      )}

      {/* Topper */}
      <Topper
        kind={style.topper}
        cx={40}
        cy={isZen ? 27 : isElegant ? 10 : 16}
        scale={0.7}
      />
    </svg>
  );
}

/* ---------- SINGLE CAKE ---------- */
function MiniSingleCake({ vibe, className }: { vibe: Vibe; className?: string }) {
  const [t1, t2] = vibe.tiers;
  const style = vibe.style;
  const uid = useId().replace(/:/g, '');
  const g1 = `${uid}-t1`;
  const h1 = `${uid}-h1`;

  return (
    <svg
      viewBox="0 0 70 60"
      className={className ?? 'h-14 w-16'}
      role="img"
      aria-label={`Mini ${vibe.label} cake`}
    >
      <defs>
        <linearGradient id={g1} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t1.body} />
          <stop offset="100%" stopColor={t1.darker} />
        </linearGradient>
        <radialGradient id={h1} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="40%" stopColor={t2.icing} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2d9c7" />
          <stop offset="100%" stopColor="#a89e8a" />
        </linearGradient>
      </defs>

      <ellipse cx="35" cy="56" rx="30" ry="2.5" fill="#0000001a" />
      <ellipse cx="35" cy="54" rx="30" ry="2.5" fill={`url(#${uid}-plate)`} />
      <ellipse cx="35" cy="53" rx="28" ry="1.4" fill="#f4ecdc" />

      <rect x="8" y="26" width="54" height="26" rx="4" fill={`url(#${g1})`} />
      <rect x="8" y="26" width="54" height="3" rx="4" fill="#ffffff" opacity="0.35" />

      <ellipse cx="35" cy="26" rx="24" ry="4" fill={t2.icing} />
      <ellipse cx="35" cy="26" rx="24" ry="4" fill={`url(#${h1})`} />

      {style.dollops &&
        [12, 20, 28, 35, 42, 50, 58].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={24} r="2" fill={t2.icing} />
            <circle cx={cx - 0.5} cy={23.5} r="0.6" fill="#ffffff" opacity="0.5" />
          </g>
        ))}

      {style.extra === 'pearls' &&
        [11, 20, 28, 35, 42, 50, 59].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={48} r="1.6" fill="#f9f4ea" stroke="#d6c9af" strokeWidth="0.3" />
            <circle cx={cx - 0.5} cy={47.5} r="0.5" fill="#ffffff" />
          </g>
        ))}

      {style.extra === 'drips' &&
        [12, 22, 32, 42, 52, 58].map((cx, i) => {
          const dripLen = 6 + (i % 3) * 2;
          return (
            <g key={i}>
              <path
                d={`M ${cx - 1.2} 28 Q ${cx - 1.2} ${28 + dripLen} ${cx} ${29 + dripLen} Q ${cx + 1.2} ${28 + dripLen} ${cx + 1.2} 28 Z`}
                fill={t2.icing}
              />
              <circle cx={cx} cy={29 + dripLen} r="1.1" fill={t2.icing} />
            </g>
          );
        })}

      {style.extra === 'petals' &&
        [
          { x: 14, y: 34, rot: -25 },
          { x: 26, y: 40, rot: 30 },
          { x: 44, y: 36, rot: -40 },
          { x: 56, y: 42, rot: 10 },
        ].map((p, i) => (
          <path
            key={i}
            d={`M ${p.x},${p.y} Q ${p.x - 2},${p.y - 3} ${p.x},${p.y - 4} Q ${p.x + 2},${p.y - 3} ${p.x},${p.y}`}
            fill="#f9a8d4"
            transform={`rotate(${p.rot} ${p.x} ${p.y})`}
          />
        ))}

      {style.sprinkles === 'lots' &&
        ['#eab308', '#8b5cf6', '#22c55e', '#ec4899', '#0ea5e9', '#f97316', '#14b8a6'].map(
          (color, i) => {
            const cx = 10 + i * 8;
            const cy = 22 + (i % 3);
            return (
              <rect
                key={i}
                x={cx - 1.5}
                y={cy - 0.4}
                width="3"
                height="1"
                rx="0.3"
                fill={color}
                transform={`rotate(${i * 33} ${cx} ${cy})`}
              />
            );
          },
        )}
      {style.sprinkles === 'few' &&
        ['#ec4899', '#f472b6', '#fbcfe8'].map((color, i) => {
          const cx = 20 + i * 15;
          return (
            <rect
              key={i}
              x={cx - 1.2}
              y={22}
              width="2.5"
              height="0.9"
              rx="0.3"
              fill={color}
              transform={`rotate(${i * 45 - 30} ${cx} 22)`}
            />
          );
        })}

      <Topper kind={style.topper} cx={35} cy={19} scale={0.9} />
    </svg>
  );
}

/* ---------- CUPCAKE ---------- */
function MiniCupcake({ vibe, className }: { vibe: Vibe; className?: string }) {
  const [t1, t2, t3] = vibe.tiers;
  const style = vibe.style;
  const uid = useId().replace(/:/g, '');
  const gWrap = `${uid}-wrap`;
  const hIce = `${uid}-hIce`;

  return (
    <svg
      viewBox="0 0 60 60"
      className={className ?? 'h-14 w-14'}
      role="img"
      aria-label={`Mini ${vibe.label} cupcake`}
    >
      <defs>
        <linearGradient id={gWrap} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t1.body} />
          <stop offset="100%" stopColor={t1.darker} />
        </linearGradient>
        <radialGradient id={hIce} cx="0.3" cy="0.2" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="45%" stopColor={t2.icing} stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M 15 35 L 20 55 L 40 55 L 45 35 Z"
        fill={`url(#${gWrap})`}
        stroke={t1.darker}
        strokeWidth="0.5"
      />
      <line x1="22" y1="36" x2="24" y2="54" stroke={t1.darker} strokeWidth="0.6" opacity="0.5" />
      <line x1="30" y1="36" x2="30" y2="54" stroke={t1.darker} strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="36" x2="36" y2="54" stroke={t1.darker} strokeWidth="0.6" opacity="0.5" />

      {style.dollops ? (
        <>
          <ellipse cx="30" cy="32" rx="15" ry="5" fill={t2.icing} />
          <ellipse cx="30" cy="26" rx="12" ry="4" fill={t2.icing} />
          <ellipse cx="30" cy="21" rx="9" ry="3.5" fill={t3.icing} />
          <ellipse cx="30" cy="16" rx="5" ry="2.5" fill={t3.icing} />
          <ellipse cx="30" cy="26" rx="12" ry="4" fill={`url(#${hIce})`} />
        </>
      ) : (
        <>
          <ellipse cx="30" cy="28" rx="15" ry="9" fill={t2.icing} />
          <ellipse cx="30" cy="28" rx="15" ry="9" fill={`url(#${hIce})`} />
        </>
      )}

      {style.extra === 'drips' &&
        [16, 22, 30, 38, 44].map((cx, i) => (
          <g key={i}>
            <path
              d={`M ${cx - 1} 34 Q ${cx - 1} 39 ${cx} 40 Q ${cx + 1} 39 ${cx + 1} 34 Z`}
              fill={t2.icing}
            />
            <circle cx={cx} cy={40} r="0.9" fill={t2.icing} />
          </g>
        ))}

      {style.extra === 'pearls' &&
        [17, 24, 30, 36, 43].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={34} r="1.1" fill="#f9f4ea" stroke="#d6c9af" strokeWidth="0.3" />
            <circle cx={cx - 0.3} cy={33.7} r="0.4" fill="#ffffff" />
          </g>
        ))}

      {style.sprinkles === 'lots' &&
        ['#eab308', '#8b5cf6', '#22c55e', '#ec4899', '#0ea5e9'].map((color, i) => {
          const cx = 22 + i * 4;
          const cy = 20 + (i % 2) * 3;
          return (
            <rect
              key={i}
              x={cx - 1}
              y={cy - 0.4}
              width="2"
              height="0.8"
              rx="0.2"
              fill={color}
              transform={`rotate(${i * 40} ${cx} ${cy})`}
            />
          );
        })}
      {style.sprinkles === 'few' &&
        ['#ec4899', '#f472b6'].map((color, i) => {
          const cx = 25 + i * 8;
          return (
            <rect
              key={i}
              x={cx - 1}
              y={22}
              width="2"
              height="0.8"
              rx="0.2"
              fill={color}
              transform={`rotate(${i * 45} ${cx} 22)`}
            />
          );
        })}

      <Topper kind={style.topper} cx={30} cy={style.dollops ? 12 : 20} scale={0.7} />
    </svg>
  );
}
