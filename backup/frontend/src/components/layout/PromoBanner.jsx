import { useState, useEffect } from 'react'

const MESSAGES = [
  'Made For You — Baked Fresh Every Morning in Kampala',
  'Free Delivery on orders above UGX 100,000',
  'The Unboxing — Uganda\'s boldest cookie box',
]

export default function PromoBanner() {
  const [idx,       setIdx]       = useState(0)
  const [visible,   setVisible]   = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, 350)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (dismissed) return null

  return (
    <div className="relative bg-primary text-dark py-2.5 px-12 text-center overflow-hidden">
      <p
        className="text-[11px] font-bold tracking-[0.2em] uppercase transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {MESSAGES[idx]}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/60 hover:text-dark text-base leading-none font-bold transition"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
