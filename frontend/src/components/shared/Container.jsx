// Single source of truth for horizontal padding + max-width cap.
// Every section that previously used ad-hoc px-6 md:px-16 should use this.
// Max-width 1280px prevents the over-wide look on large monitors (phase 2: negative space).
export default function Container({ children, className = '' }) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16 ${className}`}>
      {children}
    </div>
  )
}
