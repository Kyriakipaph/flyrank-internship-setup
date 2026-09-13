const MAX_TIERS = 6;
const SECONDS_PER_DECORATION = 30; // TESTING: 30s per decoration after target
const MAX_DECORATIONS = 2;

const TIER_HEIGHT = 42;
const BASE_WIDTH = 150;
const WIDTH_STEP = 20;
const PLATE_Y = 310;

import { getVibe, type VibeId } from '@/lib/vibes';
import type { CakeType } from '@/lib/tasks';
import Cupcake from './Cupcake';
import SingleCake from './SingleCake';
import { DollopRow, Sprinkles, TierExtra, Topper } from './vibeElements';

function minutesToCakeTiers(minutes: number): number {
  return Math.min(MAX_TIERS, Math.max(1, Math.round(minutes / 10)));
}

type CakeProps = {
  elapsedSeconds: number;
  targetMinutes: number;
  vibe?: VibeId;
  cakeType?: CakeType;
  showBaking?: boolean;
};

export default function Cake({
  elapsedSeconds,
  targetMinutes,
  vibe = 'classic',
  cakeType = 'tiered',
  showBaking = true,
}: CakeProps) {
  if (cakeType === 'cupcake') {
    return (
      <Cupcake
        elapsedSeconds={elapsedSeconds}
        targetMinutes={targetMinutes}
        vibe={vibe}
      />
    );
  }
  if (cakeType === 'cake') {
    return (
      <SingleCake
        elapsedSeconds={elapsedSeconds}
        targetMinutes={targetMinutes}
        vibe={vibe}
      />
    );
  }
  return (
    <TieredCake
      elapsedSeconds={elapsedSeconds}
      targetMinutes={targetMinutes}
      vibe={vibe}
      showBaking={showBaking}
    />
  );
}

type TieredCakeProps = {
  elapsedSeconds: number;
  targetMinutes: number;
  vibe?: VibeId;
  showBaking?: boolean;
};

function TieredCake({
  elapsedSeconds,
  targetMinutes,
  vibe = 'classic',
  showBaking = true,
}: TieredCakeProps) {
  const vibeObj = getVibe(vibe);
  const TIER_COLORS = vibeObj.tiers;
  const vibeStyle = vibeObj.style;
  const cakeTargetTiers = minutesToCakeTiers(targetMinutes);
  const targetSeconds = targetMinutes * 60;
  const secondsPerTier = targetSeconds / cakeTargetTiers;

  const rawTierCount = Math.floor(elapsedSeconds / secondsPerTier);
  const tierCount = Math.min(rawTierCount, cakeTargetTiers);

  // Past target → decorations
  const decorationCount =
    tierCount === cakeTargetTiers
      ? Math.min(
          Math.floor(
            (elapsedSeconds - targetSeconds) / SECONDS_PER_DECORATION,
          ),
          MAX_DECORATIONS,
        )
      : 0;

  const bowlVisible = showBaking && tierCount === 0;
  const bowlBottom = PLATE_Y;
  const bowlTop = bowlBottom - 22;
  const ingredientY = bowlTop + 8;
  const crackY = bowlTop - 5;

  const label =
    tierCount === 0
      ? 'Empty cake plate with baking bowl'
      : `Focus cake with ${tierCount} tier${tierCount !== 1 ? 's' : ''}`;

  return (
    <svg
      viewBox="0 0 200 340"
      className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96"
      role="img"
      aria-label={label}
    >
      {/* twinkling stars scattered around the cake */}
      {[
        { x: 25, y: 90 },
        { x: 175, y: 100 },
        { x: 15, y: 180 },
        { x: 185, y: 200 },
        { x: 35, y: 260 },
        { x: 165, y: 275 },
        { x: 100, y: 40 },
        { x: 60, y: 30 },
        { x: 145, y: 50 },
      ].map((s, i) => (
        <path
          key={`star-${i}`}
          className="star-twinkle"
          d={`M ${s.x} ${s.y - 3} L ${s.x + 0.8} ${s.y - 0.8} L ${s.x + 3} ${s.y} L ${s.x + 0.8} ${s.y + 0.8} L ${s.x} ${s.y + 3} L ${s.x - 0.8} ${s.y + 0.8} L ${s.x - 3} ${s.y} L ${s.x - 0.8} ${s.y - 0.8} Z`}
          fill="#fbbf24"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}

      <ellipse cx="100" cy={PLATE_Y + 8} rx="95" ry="7" fill="#94a3b8" />
      <ellipse cx="100" cy={PLATE_Y + 5} rx="93" ry="5" fill="#e5e7eb" />

      <g className={tierCount > 0 ? 'cake-sway' : ''}>
        {Array.from({ length: tierCount }).map((_, i) => {
          const width = BASE_WIDTH - i * WIDTH_STEP;
          const x = (200 - width) / 2;
          const y = PLATE_Y - (i + 1) * TIER_HEIGHT;
          const colors = TIER_COLORS[i % TIER_COLORS.length];
          const hasDrips = tierCount >= i + 2;
          const isTopTier = i === tierCount - 1;

          return (
            <g key={i} className="tier-pop">
              <rect
                x={x}
                y={y}
                width={width}
                height={TIER_HEIGHT}
                rx="6"
                fill={colors.body}
              />

              <rect
                x={x}
                y={y + TIER_HEIGHT - 6}
                width={width}
                height="6"
                rx="6"
                fill={colors.darker}
                opacity="0.7"
              />

              <ellipse
                className="icing-wobble"
                cx="100"
                cy={y}
                rx={width / 2 - 6}
                ry="6"
                fill={colors.icing}
              />

              <DollopRow
                style={vibeStyle}
                x={x}
                y={y}
                width={width}
                color={colors.icing}
              />

              <Sprinkles style={vibeStyle} x={x} y={y} width={width} />

              <TierExtra
                style={vibeStyle}
                x={x}
                y={y}
                width={width}
                height={TIER_HEIGHT}
                icingColor={colors.icing}
              />

              {hasDrips && (
                <>
                  <circle cx={x + 12} cy={y + 4} r="4" fill={colors.icing} />
                  <circle
                    cx={x + width * 0.3}
                    cy={y + 6}
                    r="4"
                    fill={colors.icing}
                  />
                  <circle
                    cx={x + width * 0.55}
                    cy={y + 3}
                    r="3"
                    fill={colors.icing}
                  />
                  <circle
                    cx={x + width * 0.75}
                    cy={y + 7}
                    r="4"
                    fill={colors.icing}
                  />
                  <circle
                    cx={x + width - 12}
                    cy={y + 4}
                    r="4"
                    fill={colors.icing}
                  />
                </>
              )}

              {/* Decoration 2: extra sprinkles when past target */}
              {decorationCount >= 2 && vibeStyle.sprinkles !== 'none' && (
                <g className="sprinkle-shimmer">
                  {[
                    { pct: 0.15, dy: -7, color: '#eab308', rot: 45 },
                    { pct: 0.35, dy: -9, color: '#8b5cf6', rot: -30 },
                    { pct: 0.55, dy: -8, color: '#22c55e', rot: 60 },
                    { pct: 0.75, dy: -6, color: '#0ea5e9', rot: -45 },
                  ].map((s, k) => {
                    const cx = x + width * s.pct;
                    const cy = y + s.dy;
                    return (
                      <rect
                        key={`spr-${k}`}
                        x={cx - 2.5}
                        y={cy - 1}
                        width="5"
                        height="2"
                        rx="1"
                        fill={s.color}
                        transform={`rotate(${s.rot} ${cx} ${cy})`}
                      />
                    );
                  })}
                </g>
              )}

              {/* Decoration 1: vibe-specific topper on the very top tier */}
              {isTopTier && decorationCount >= 1 && (
                <Topper kind={vibeStyle.topper} cx={100} cy={y - 10} />
              )}
            </g>
          );
        })}
      </g>

      {bowlVisible && (
        <g>
          <path
            d={`M 75 ${bowlTop}
                Q 78 ${bowlBottom} 100 ${bowlBottom}
                Q 122 ${bowlBottom} 125 ${bowlTop}`}
            fill="#e5e7eb"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <ellipse cx="100" cy={bowlTop} rx="25" ry="3" fill="#cbd5e1" />

          <ellipse
            className="ing-batter"
            cx="100"
            cy={bowlTop + 4}
            rx="22"
            ry="2.5"
            fill="#fef3c7"
          />

          <g className="ing-flour">
            <rect
              x="88"
              y={ingredientY - 14}
              width="14"
              height="10"
              fill="#f4f4f5"
              stroke="#a1a1aa"
              strokeWidth="0.5"
              rx="1"
            />
            <text
              x="95"
              y={ingredientY - 6}
              fontSize="5"
              fill="#71717a"
              textAnchor="middle"
            >
              F
            </text>
          </g>

          <g className="ing-dust">
            <circle cx="98" cy={ingredientY} r="4" fill="#fafafa" />
            <circle cx="103" cy={ingredientY - 1} r="3" fill="#fafafa" />
            <circle cx="94" cy={ingredientY + 1} r="3" fill="#fafafa" />
          </g>

          <g className="ing-egg-whole">
            <ellipse
              cx="100"
              cy={crackY}
              rx="5"
              ry="6"
              fill="#fef9c3"
              stroke="#eab308"
              strokeWidth="0.7"
            />
          </g>

          <g className="ing-shell-left">
            <path
              d={`M 100 ${crackY - 6}
                  Q 95 ${crackY - 4} 95 ${crackY}
                  Q 96 ${crackY + 3} 100 ${crackY + 3} Z`}
              fill="#fef9c3"
              stroke="#eab308"
              strokeWidth="0.7"
            />
          </g>

          <g className="ing-shell-right">
            <path
              d={`M 100 ${crackY - 6}
                  Q 105 ${crackY - 4} 105 ${crackY}
                  Q 104 ${crackY + 3} 100 ${crackY + 3} Z`}
              fill="#fef9c3"
              stroke="#eab308"
              strokeWidth="0.7"
            />
          </g>

          <g className="ing-yolk">
            <circle cx="100" cy={crackY} r="2.5" fill="#f59e0b" />
          </g>

          <g className="ing-splash">
            <circle cx="94" cy={bowlTop + 8} r="1.5" fill="#fef9c3" />
            <circle cx="106" cy={bowlTop + 8} r="1.5" fill="#fef9c3" />
            <circle cx="100" cy={bowlTop + 5} r="1" fill="#fef9c3" />
          </g>

          <g className="ing-butter">
            <rect
              x="94"
              y={ingredientY - 3}
              width="12"
              height="8"
              fill="#fde047"
              stroke="#ca8a04"
              strokeWidth="0.5"
              rx="1"
            />
            <line
              x1="97"
              y1={ingredientY}
              x2="103"
              y2={ingredientY}
              stroke="#ca8a04"
              strokeWidth="0.5"
            />
          </g>

          <g className="ing-whisk-fade">
            <g className="ing-whisk-stir">
              <line
                x1="100"
                y1={bowlTop - 22}
                x2="100"
                y2={bowlTop + 4}
                stroke="#71717a"
                strokeWidth="1.5"
              />
              <ellipse
                cx="100"
                cy={bowlTop + 10}
                rx="7"
                ry="9"
                fill="none"
                stroke="#71717a"
                strokeWidth="1"
              />
              <ellipse
                cx="100"
                cy={bowlTop + 10}
                rx="4"
                ry="9"
                fill="none"
                stroke="#71717a"
                strokeWidth="1"
              />
              <ellipse
                cx="100"
                cy={bowlTop + 10}
                rx="1"
                ry="9"
                fill="none"
                stroke="#71717a"
                strokeWidth="1"
              />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
