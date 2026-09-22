// Vertical rhythm wrapper. Every major section uses one of two scales:
//   default  — py-16 md:py-24   (content sections)
//   tight    — py-10 md:py-16   (strip / call-to-action sections)
// Accepts any inline style for background so callers own their own color.
export default function Section({ children, tight = false, className = '', style = {}, id }) {
  const py = tight ? 'py-10 md:py-16' : 'py-16 md:py-24'
  return (
    <section id={id} className={`${py} ${className}`} style={style}>
      {children}
    </section>
  )
}
