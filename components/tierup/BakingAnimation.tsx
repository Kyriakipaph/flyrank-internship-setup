export default function BakingAnimation() {
  return (
    <svg
      viewBox="0 0 120 100"
      className="h-20 w-24"
      role="img"
      aria-label="Ingredients being added to a mixing bowl"
    >
      {/* bowl */}
      <path
        d="M 20 60 Q 20 90 60 90 Q 100 90 100 60 Z"
        fill="#e5e7eb"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <ellipse cx="60" cy="60" rx="40" ry="5" fill="#fef3c7" />

      {/* flour cloud */}
      <g className="ing-flour">
        <circle cx="60" cy="35" r="8" fill="#fafafa" />
        <circle cx="53" cy="40" r="6" fill="#fafafa" />
        <circle cx="67" cy="40" r="6" fill="#fafafa" />
        <circle cx="60" cy="45" r="4" fill="#fafafa" />
      </g>

      {/* egg */}
      <g className="ing-egg">
        <ellipse
          cx="60"
          cy="38"
          rx="7"
          ry="9"
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth="1"
        />
      </g>

      {/* butter block */}
      <g className="ing-butter">
        <rect
          x="52"
          y="30"
          width="16"
          height="12"
          fill="#fde047"
          stroke="#eab308"
          strokeWidth="0.5"
          rx="1"
        />
        <line
          x1="56"
          y1="34"
          x2="64"
          y2="34"
          stroke="#eab308"
          strokeWidth="0.5"
        />
      </g>

      {/* whisk (with stirring inside a fade group) */}
      <g className="ing-whisk">
        <g className="whisk-stir">
          <line
            x1="60"
            y1="10"
            x2="60"
            y2="55"
            stroke="#71717a"
            strokeWidth="2"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="9"
            ry="12"
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="5"
            ry="12"
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="1"
            ry="12"
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </svg>
  );
}
