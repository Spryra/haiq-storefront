import { useRef, useEffect, useState } from 'react'
import Crown from '../shared/Crown'

const MOMENTS = [
  { src: '/images/moments/moment_1.jpg', caption: 'The Blackout, undivided attention.' },
  { src: '/images/moments/moment_2.jpg', caption: 'Every bite, deliberate.' },
  { src: '/images/moments/moment_3.jpg', caption: 'Made for moments like this.' },
  { src: '/images/moments/moment_4.jpg', caption: 'Venom. Everywhere she goes.' },
  { src: '/images/moments/moment_5.jpg', caption: 'The Campfire, mid-thought.' },
  { src: '/images/moments/moment_6.jpg', caption: 'Slow down. Taste it.' },
  { src: '/images/moments/moment_7.jpg', caption: 'Kampala tastes better now.' },
  { src: '/images/moments/moment_8.jpg', caption: 'She came for one. Stayed for four.' },
  { src: '/images/moments/moment_9.jpg', caption: 'The Unboxing. Right on time.' },
  { src: '/images/moments/moment_10.jpg', caption: 'Open it. Own it.' },
]

function MomentCard({ src, caption, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${(index % 5) * 80}ms`,
      }}
    >
      <div className="aspect-[3/4] overflow-hidden bg-dark2">
        <img
          src={src}
          alt={caption}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      {/* Caption overlay - slides up on hover like Bugatti */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent px-4 py-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-light text-xs font-medium tracking-wide leading-snug">{caption}</p>
      </div>
      {/* Thin accent border on hover */}
      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/40 transition-all duration-300 pointer-events-none" />
    </div>
  )
}

export default function MomentsSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true) }, { threshold: 0.1 })
    if (headerRef.current) obs.observe(headerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="bg-dark py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-16">

        {/* Section header — Bugatti editorial style */}
        <div
          ref={headerRef}
          className="mb-16 transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown size={20} color="#B8752A" />
            <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase">
              Moments
            </p>
          </div>
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-serif font-bold text-light leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
              Made For<br />Real People.
            </h2>
            <a
              href="/moments"
              className="hidden md:flex items-center gap-2 text-primary text-sm font-medium tracking-widest uppercase hover:text-haiq-gold transition-colors flex-shrink-0 mb-2"
            >
              See All <span>→</span>
            </a>
          </div>
          <div className="w-12 h-px bg-primary mt-6" />
        </div>

        {/* Grid — asymmetric Bugatti-style editorial layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {MOMENTS.map((m, i) => (
            <div key={i} className={
              // First card spans 2 cols and 2 rows on large screens
              i === 0 ? 'col-span-2 row-span-2 lg:col-span-2' :
              i === 4 ? 'col-span-2 md:col-span-1' : ''
            }>
              <MomentCard src={m.src} caption={m.caption} index={i} />
            </div>
          ))}
        </div>

        {/* Mobile see all */}
        <div className="mt-10 md:hidden text-center">
          <a href="/moments" className="text-primary text-sm font-semibold tracking-widest uppercase hover:text-haiq-gold transition-colors">
            See All Moments →
          </a>
        </div>
      </div>
    </section>
  )
}
