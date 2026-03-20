export default function Crown({ size = 24, color = '#B8752A', className = '' }) {
  const h = Math.round(size * 0.72)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 220 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 130 Q110 122 188 130" stroke={color} strokeWidth="8" strokeLinecap="round"/>
      <path d="M32 130 L22 58" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M22 58 Q18 42 28 36 Q40 30 46 44 Q50 54 44 62" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <path d="M44 62 Q62 100 82 66" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M82 66 Q110 10 138 66" stroke={color} strokeWidth="8" strokeLinecap="round"/>
      <path d="M138 66 Q158 100 176 62" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M176 62 Q184 52 198 58 L188 130" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M198 58 Q204 42 194 36 Q182 30 176 44 Q172 54 178 62" stroke={color} strokeWidth="6" strokeLinecap="round"/>
    </svg>
  )
}
