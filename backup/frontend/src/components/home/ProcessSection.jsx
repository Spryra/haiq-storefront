import { useRef, useEffect, useState } from 'react'
import Crown from '../shared/Crown'

const STEPS = [
  {
    number: '01',
    title: 'Sourced.',
    body: 'Every ingredient chosen with intention. Real cocoa. Real butter. Nothing artificial.',
    img: '/images/process/process_4.jpg',
  },
  {
    number: '02',
    title: 'Mixed.',
    body: 'Dough built by hand. Each batch mixed to a precise texture — never rushed, never cut short.',
    img: '/images/process/process_2.jpg',
  },
  {
    number: '03',
    title: 'Baked.',
    body: 'Fresh every morning. We pull them at the exact moment — edges set, centre still moving.',
    img: '/images/process/process_3.jpg',
  },
  {
    number: '04',
    title: 'Packed.',
    body: 'Sealed immediately. Branded. Ready to travel from our kitchen to your hands.',
    img: '/images/process/process_1.jpg',
  },
]

function Step({ step, index, reverse }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center transition-all duration-700`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}
    >
      {/* Image */}
      <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden bg-dark2 relative">
        <img
          src={step.img}
          alt={step.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border border-primary/20" />
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2 px-0 md:px-4">
        <p className="text-primary/50 font-serif text-6xl font-bold leading-none mb-4 select-none">
          {step.number}
        </p>
        <h3 className="font-serif font-bold text-light text-3xl md:text-4xl mb-4">{step.title}</h3>
        <div className="w-8 h-px bg-primary mb-4" />
        <p className="text-light/60 text-base leading-relaxed">{step.body}</p>
      </div>
    </div>
  )
}

export default function ProcessSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true) }, { threshold: 0.1 })
    if (headerRef.current) obs.observe(headerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="bg-dark2 py-24 md:py-36">
      <div className="container mx-auto px-6 md:px-16">

        {/* Header */}
        <div
          ref={headerRef}
          className="mb-20 transition-all duration-700 text-center"
          style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown size={20} color="#B8752A" />
            <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase">
              The Process
            </p>
          </div>
          <h2 className="font-serif font-bold text-light leading-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            How We Make It.
          </h2>
          <p className="text-light/50 max-w-md mx-auto text-base leading-relaxed">
            No shortcuts. No compromises. Every cookie that leaves our kitchen is exactly what we'd eat ourselves.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-24 md:space-y-32">
          {STEPS.map((step, i) => (
            <Step key={step.number} step={step} index={i} reverse={i % 2 !== 0} />
          ))}
        </div>

        {/* Bottom quote */}
        <div className="mt-24 text-center border-t border-primary/20 pt-16">
          <Crown size={28} color="#B8752A" className="mx-auto mb-6 opacity-60" />
          <p className="font-serif text-light/80 text-xl md:text-2xl italic max-w-lg mx-auto leading-relaxed">
            "Every batch is personal. Because every customer is."
          </p>
          <p className="text-primary/60 text-xs tracking-[0.3em] uppercase mt-4 font-semibold">— HAIQ Bakery</p>
        </div>
      </div>
    </section>
  )
}
