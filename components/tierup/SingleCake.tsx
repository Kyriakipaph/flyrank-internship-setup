import { getVibe, type VibeId } from '@/lib/vibes';
import { DollopRow, Sprinkles, TierExtra, Topper } from './vibeElements';

type Props = {
  elapsedSeconds: number;
  targetMinutes: number;
  vibe?: VibeId;
};

/**
 * A single round cake that builds up in phases:
 *   0-33%  → empty plate
 *   33-66% → + baked cake body
 *   66-100% → + icing top (styled per vibe)
 *   100%+  → + vibe topper, bonus sprinkles
 */
export default function SingleCake({
  elapsedSeconds,
  targetMinutes,
  vibe = 'classic',
}: Props) {
  const vibeObj = getVibe(vibe);
  const [t1, t2] = vibeObj.tiers;
  const style = vibeObj.style;
  const targetSeconds = targetMinutes * 60;
  const progress = targetSeconds > 0 ? elapsedSeconds / targetSeconds : 0;
  const showBody = progress >= 0.33;
  const showIcing = progress >= 0.66;
  const showTopper = progress >= 1;
  const showExtras = progress >= 1.3;

  return (
    <svg
      viewBox="0 0 200 260"
      className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96"
      role="img"
      aria-label={`Cake, ${Math.round(progress * 100)}% baked`}
    >
      {[
        { x: 25, y: 60 },
        { x: 175, y: 80 },
        { x: 15, y: 150 },
        { x: 185, y: 170 },
      ].map((s, i) => (
        <path
          key={`star-${i}`}
          className="star-twinkle"
          d={`M ${s.x} ${s.y - 3} L ${s.x + 0.8} ${s.y - 0.8} L ${s.x + 3} ${s.y} L ${s.x + 0.8} ${s.y + 0.8} L ${s.x} ${s.y + 3} L ${s.x - 0.8} ${s.y + 0.8} L ${s.x - 3} ${s.y} L ${s.x - 0.8} ${s.y - 0.8} Z`}
          fill="#fbbf24"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}

      <ellipse cx="100" cy="238" rx="90" ry="7" fill="#94a3b8" />
      <ellipse cx="100" cy="236" rx="88" ry="5" fill="#e5e7eb" />

      {/* cake body */}
      {showBody && (
        <g className="tier-pop">
          <rect x="30" y="140" width="140" height="90" rx="8" fill={t1.body} />
          <rect
            x="30"
            y="216"
            width="140"
            height="14"
            rx="8"
            fill={t1.darker}
            opacity="0.7"
          />
        </g>
      )}

      {/* icing top (uses vibe-specific dollops/sprinkles/extras) */}
      {showIcing && (
        <g className="tier-pop">
          <ellipse
            className="icing-wobble"
            cx="100"
            cy="140"
            rx="65"
            ry="12"
            fill={t2.icing}
          />
          <DollopRow style={style} x={30} y={140} width={140} color={t2.icing} />
          <Sprinkles style={style} x={30} y={140} width={140} />
          <TierExtra
            style={style}
            x={30}
            y={140}
            width={140}
            height={90}
            icingColor={t2.icing}
          />
        </g>
      )}

      {/* vibe-specific topper */}
      {showTopper && (
        <g className="tier-pop">
          <Topper kind={style.topper} cx={100} cy={124} scale={1.4} />
        </g>
      )}

      {/* bonus sprinkles */}
      {showExtras && style.sprinkles !== 'none' && (
        <g className="sprinkle-shimmer">
          {[
            { x: 60, y: 160, color: '#eab308', rot: 30 },
            { x: 90, y: 180, color: '#8b5cf6', rot: -30 },
            { x: 130, y: 165, color: '#22c55e', rot: 60 },
            { x: 100, y: 200, color: '#0ea5e9', rot: -45 },
          ].map((s, i) => (
            <rect
              key={i}
              x={s.x - 3}
              y={s.y - 1}
              width="7"
              height="2.5"
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
