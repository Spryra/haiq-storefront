/**
 * Crown — HAIQ secondary mark
 * Traced from Crown_image.jpeg (white hand-drawn sketch crown on maroon bg).
 * Background removed. White paths only.
 *
 * Usage rules:
 *  - Never larger than the main HAIQ logo
 *  - Use sparingly: section accents, loyalty UI, footer, hero small accent
 *  - Default color matches current text color via currentColor
 */
export default function Crown({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 220 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base bar */}
      <path
        d="M32 130 Q110 122 188 130"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left outer upstroke */}
      <path
        d="M32 130 L22 58"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left top curl */}
      <path
        d="M22 58 Q18 42 28 36 Q40 30 46 44 Q50 54 44 62"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left valley to centre rise */}
      <path
        d="M44 62 Q62 100 82 66"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Centre peak — tallest point */}
      <path
        d="M82 66 Q110 10 138 66"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Centre top curl */}
      <path
        d="M104 22 Q110 12 118 18 Q124 26 116 34"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right valley from centre */}
      <path
        d="M138 66 Q158 100 176 62"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right outer upstroke */}
      <path
        d="M176 62 Q184 52 198 58 L188 130"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right top curl */}
      <path
        d="M198 58 Q204 42 194 36 Q182 30 176 44 Q172 54 178 62"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
