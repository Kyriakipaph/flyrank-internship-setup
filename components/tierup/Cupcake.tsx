import { getVibe, type VibeId } from '@/lib/vibes';
import { Sprinkles, Topper } from './vibeElements';

type Props = {
  elapsedSeconds: number;
  targetMinutes: number;
  vibe?: VibeId;
};

/**
 * A single cupcake that builds up in phases as time passes:
 *   0-33%  → empty paper wrapper
 *   33-66% → + baked top peeking above the wrapper
 *   66-100% → + icing swirl
 *   100%+  → + cherry, then sprinkles etc.
 */
export default function Cupcake({
  elapsedSeconds,
  targetMinutes,
  vibe = 'classic',
}: Props) {
  const vibeObj = getVibe(vibe);
  const [t1, t2, t3] = vibeObj.tiers;
  const style = vibeObj.style;
  const targetSeconds = targetMinutes * 60;
  const progress = targetSeconds > 0 ? elapsedSeconds / targetSeconds : 0;
  const showBaked = progress >= 0.33;
  const showIcing = progress >= 0.66;
  const showCherry = progress >= 1;
  const showSprinkles = progress >= 1.3;

  return (
    <svg
      viewBox="0 0 200 260"
      className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96"
      role="img"
      aria-label={`Cupcake, ${Math.round(progress * 100)}% baked`}
    >
      {/* twinkling stars — same as Cake */}
      {[
        { x: 25, y: 60 },
        { x: 175, y: 80 },
        { x: 15, y: 150 },
        { x: 185, y: 170 },
        { x: 35, y: 220 },
        { x: 165, y: 230 },
      ].map((s, i) => (
        <path
          key={`star-${i}`}
          className="star-twinkle"
          d={`M ${s.x} ${s.y - 3} L ${s.x + 0.8} ${s.y - 0.8} L ${s.x + 3} ${s.y} L ${s.x + 0.8} ${s.y + 0.8} L ${s.x} ${s.y + 3} L ${s.x - 0.8} ${s.y + 0.8} L ${s.x - 3} ${s.y} L ${s.x - 0.8} ${s.y - 0.8} Z`}
          fill="#fbbf24"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}

      {/* plate */}
      <ellipse cx="100" cy="238" rx="80" ry="6" fill="#94a3b8" />
      <ellipse cx="100" cy="236" rx="78" ry="4" fill="#e5e7eb" />

      {/* paper wrapper (always visible) */}
      <path
        d="M 55 155 L 70 230 L 130 230 L 145 155 Z"
        fill={t1.body}
        stroke={t1.darker}
        strokeWidth="1"
      />
      {/* wrapper vertical ridges */}
      {[65, 80, 95, 110, 125, 135].map((x, i) => (
        <line
          key={i}
          x1={x + (x < 100 ? 3 : -3)}
          y1="230"
          x2={x - (x < 100 ? 3 : -3) * 0.4}
          y2="158"
          stroke={t1.darker}
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
      <ellipse cx="100" cy="155" rx="45" ry="6" fill={t1.darker} opacity="0.6" />

      {/* baked top (browned dome peeking above wrapper) */}
      {showBaked && (
        <g className="tier-pop">
          <ellipse cx="100" cy="150" rx="46" ry="16" fill="#c8865e" />
          <ellipse cx="100" cy="146" rx="42" ry="12" fill="#d99566" />
        </g>
      )}

      {/* icing swirl */}
      {showIcing && (
        <g className="tier-pop">
          <ellipse
            className="icing-wobble"
            cx="100"
            cy="140"
            rx="50"
            ry="18"
            fill={t2.icing}
          />
          <ellipse cx="100" cy="128" rx="40" ry="14" fill={t2.icing} />
          <ellipse cx="100" cy="118" rx="28" ry="11" fill={t3.icing} />
          <ellipse cx="100" cy="108" rx="18" ry="8" fill={t3.icing} />
          <ellipse cx="100" cy="100" rx="10" ry="5" fill={t3.icing} />
        </g>
      )}

      {/* topper (varies by vibe) */}
      {showCherry && (
        <g className="tier-pop">
          <Topper kind={style.topper} cx={100} cy={95} scale={1.5} />
        </g>
      )}

      {/* sprinkles on icing (vibe-dependent) */}
      {showIcing && (
        <Sprinkles style={style} x={60} y={130} width={80} />
      )}

      {/* extra bonus sprinkles */}
      {showSprinkles && style.sprinkles !== 'none' && (
        <g className="sprinkle-shimmer">
          {[
            { x: 78, y: 128, color: '#eab308', rot: 30 },
            { x: 122, y: 130, color: '#8b5cf6', rot: -30 },
            { x: 90, y: 118, color: '#22c55e', rot: 60 },
            { x: 110, y: 116, color: '#0ea5e9', rot: -45 },
          ].map((s, i) => (
            <rect
              key={i}
              x={s.x - 3}
              y={s.y - 1}
              width="6"
              height="2"
              rx="1"
              fill={s.color}
              transform={`rotate(${s.rot} ${s.x} ${s.y})`}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
