import { useRef, useEffect, useState } from 'react'
import Crown from '../shared/Crown'

export default function BrandStory() {
  const [ref, setRef] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    obs.observe(ref)
    return () => obs.disconnect()
  }, [ref])

  return (
    <section className="bg-dark py-24 md:py-36 relative overflow-hidden">
      {/* Vertical accent lines */}
      <div className="absolute top-0 bottom-0 left-[7%] w-px bg-primary/8 hidden md:block" />
      <div className="absolute top-0 bottom-0 right-[7%] w-px bg-primary/8 hidden md:block" />

      <div
        ref={setRef}
        className={`
          container mx-auto px-8 md:px-24 text-center max-w-4xl
          transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <Crown size={28} color="#B8752A" className="mx-auto mb-8 opacity-60" />

        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-6">
          Made For You
        </p>

        {/* Pull quote */}
        <blockquote
          className="font-serif italic text-light/80 leading-tight mb-8"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          "We don't bake in bulk.<br className="hidden md:block" />
          We bake for the person<br className="hidden md:block" />
          who ordered."
        </blockquote>

        <div className="w-10 h-px bg-primary mx-auto mb-8" />

        <p className="text-light/45 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Every cookie at HAIQ starts with a name on an order.
          We bake fresh every morning in Muyenga, Kampala —
          not to fill a shelf, but because someone chose us today.
        </p>

        {/* Three dark panels */}
        <div className="grid md:grid-cols-3 gap-px mt-16 border border-primary/15">
          {[
            { label: 'Founded',    value: '2019',     sub: 'Muyenga, Kampala'    },
            { label: 'Per Pack',   value: '4',        sub: 'Cookies. Always.'    },
            { label: 'Promise',    value: 'Fresh',    sub: 'Every single morning' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-dark2 px-8 py-8 text-center">
              <p className="text-primary/50 text-[10px] font-semibold tracking-[0.3em] uppercase mb-2">{label}</p>
              <p className="font-serif font-bold text-light text-3xl mb-1">{value}</p>
              <p className="text-light/40 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
