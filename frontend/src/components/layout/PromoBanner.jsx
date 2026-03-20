import { useState, useEffect } from 'react'

const MESSAGES = [
  'Made For You — Baked Fresh Every Morning in Kampala',
  'Venom · Coconut · Crimson Sin · Campfire After Dark · Blackout',
  'The Unboxing — Uganda\'s boldest cookie box. Order yours.',
]

export default function PromoBanner() {
  const [idx,       setIdx]       = useState(0)
  const [visible,   setVisible]   = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, 350)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  if (dismissed) return null

  return (
    <div className="relative bg-primary text-dark overflow-hidden">
      {/* Thin bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-dark/10" />

      <div className="container mx-auto px-12 py-2.5 flex items-center justify-center">
        <p
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {MESSAGES[idx]}
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark text-lg leading-none font-bold transition-colors"
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  )
}
