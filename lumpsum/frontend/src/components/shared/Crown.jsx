/**
 * Crown — HAIQ secondary mark
 * Extracted from Crown_image.jpeg. White hand-drawn sketch crown.
 * Use sparingly. Primary use: section accents, loyalty, special moments.
 * Similar role to how Last Crumb uses their emoji face.
 */
export default function Crown({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base bar */}
      <path
        d="M35 125 Q100 118 165 125"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left outer point */}
      <path
        d="M35 125 L28 62 Q36 55 44 62"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left curl */}
      <path
        d="M28 62 Q24 48 34 44 Q42 41 44 52"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left inner valley to center peak */}
      <path
        d="M44 62 Q62 95 80 68"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center peak - tallest point */}
      <path
        d="M80 68 Q100 22 120 68"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center top curl */}
      <path
        d="M96 28 Q100 18 106 24 Q110 30 104 36"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right inner valley */}
      <path
        d="M120 68 Q138 95 156 62"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right outer point */}
      <path
        d="M156 62 Q158 55 165 62 L165 125"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right curl */}
      <path
        d="M165 62 Q170 48 160 44 Q152 41 152 52"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
