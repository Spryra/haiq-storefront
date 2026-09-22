import { useEffect, useState } from 'react'
import Crown from '../shared/Crown'
import Container from '../shared/Container'

const STEPS = [
  {
    number:  '01',
    title:   'Sourced.',
    tag:     'Ingredients',
    body:    'Every ingredient chosen deliberately. Real butter. Real cocoa. Nothing artificial, nothing skipped. What goes in determines everything that comes out.',
    detail:  'We source locally where possible — coconut from Ugandan suppliers, cocoa from trusted East African networks. Every batch starts with a decision, not a shortcut.',
    img:     '/images/process/process_05.jpg',
    imgAlt:  'HAIQ Coconut cookies through packaging window',
    color:   '#A67C52',
  },
  {
    number:  '02',
    title:   'Mixed.',
    tag:     'Dough',
    body:    "Dough built by hand. Each batch mixed to a precise texture — never rushed, never cut short.",
    detail:  'The marshmallow is toasted separately. The chocolate is measured by weight, not eye. Every cookie type has its own mixing sequence — the Campfire After Dark takes longest.',
    img:     '/images/process/process_02.jpg',
    imgAlt:  'Campfire cookies fresh on cooling rack',
    color:   '#D4C4A8',
  },
  {
    number:  '03',
    title:   'Baked.',
    tag:     'The Oven',
    body:    'Fresh every morning. We pull them at the exact moment — edges set, centre still moving.',
    detail:  'That window is everything. Twelve minutes is not the same as eleven. The Blackout goes in at a different temperature than the Crimson Sin. We do not mix batches.',
    img:     '/images/process/process_03.jpg',
    imgAlt:  'Fresh cookie batch on cooling rack',
    color:   '#E8D9C3',
  },
  {
    number:  '04',
    title:   'Packed.',
    tag:     'Dispatch',
    body:    'Sealed immediately. Branded. Ready to travel from our kitchen to your hands.',
    detail:  'Still warm enough to matter. Every pouch is sealed by hand, labelled with the batch time, and checked before it leaves. We bake to order — nothing sits on a shelf.',
    img:     '/images/process/process_01.jpg',
    imgAlt:  'HAIQ cookies in branded pouches on marble',
    color:   '#A67C52',
  },
]

function useVisible(ref, threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(ref)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

function StepCard({ step, idx }) {
  const [ref, setRef] = useState(null)
  const visible = useVisible(ref, 0.08)
  const isEven = idx % 2 === 0

  return (
    <div
      ref={setRef}
      className="grid md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-16"
      style={{
        borderTop:       ' 1px solid rgba(166,124,82,0.15)',
        opacity:         visible ? 1 : 0,
        transform:       visible ? 'translateY(0)' : 'translateY(28px)',
        transition:      `opacity 0.7s ease ${idx * 100}ms, transform 0.7s ease ${idx * 100}ms`,
      }}
    >
      {/* Copy — alternates left/right on desktop */}
      <div className={isEven ? 'md:order-1' : 'md:order-2'}>
        <div className="flex items-center gap-4 mb-4">
          <span
            className="font-serif font-bold leading-none select-none"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: 'rgba(166,124,82,0.2)' }}
          >
            {step.number}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.28em] px-2 py-0.5"
            style={{ color: '#1A0A00', background: step.color }}
          >
            {step.tag}
          </span>
        </div>

        <h3
          className="font-serif font-bold leading-tight mb-3"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#F5EAD8' }}
        >
          {step.title}
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(245,234,216,0.6)' }}>
          {step.body}
        </p>

        <p
          className="text-sm leading-relaxed pl-4 border-l-2"
          style={{ color: 'rgba(245,234,216,0.4)', borderColor: step.color }}
        >
          {step.detail}
        </p>
      </div>

      {/* Photo — always visible */}
      <div
        className={`overflow-hidden ${isEven ? 'md:order-2' : 'md:order-1'}`}
        style={{ aspectRatio: '4/3', border: '1px solid rgba(166,124,82,0.15)' }}
      >
        <img
          src={step.img}
          alt={step.imgAlt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          style={{ filter: 'brightness(0.88)' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(0.88)' }}
        />
      </div>
    </div>
  )
}

export default function ProcessSection() {
  const [headerRef, setHeaderRef] = useState(null)
  const headerVisible = useVisible(headerRef, 0.1)

  return (
    <section style={{ background: '#140800' }} className="py-16 md:py-24">
      <div style={{ height: '1px', background: 'rgba(166,124,82,0.2)' }} />

      <Container className="pt-16">

        {/* Header */}
        <div
          ref={setHeaderRef}
          className="mb-4 transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown size={18} color="#A67C52" />
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#A67C52' }}>
              The Process
            </p>
          </div>
          <h2
            className="font-serif font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#F5EAD8' }}
          >
            How We Make It.
          </h2>
          <p style={{ color: 'rgba(245,234,216,0.4)', maxWidth: '36rem' }} className="text-base leading-relaxed">
            No shortcuts. No compromise.
          </p>
        </div>

        {/* Steps — each one always shows its photo */}
        <div>
          {STEPS.map((step, idx) => (
            <StepCard key={step.number} step={step} idx={idx} />
          ))}
        </div>

        {/* Bottom quote */}
        <div
          className="mt-16 text-center transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0 }}
        >
          <Crown size={20} color="#A67C52" className="mx-auto mb-5 opacity-35" />
          <p className="font-serif italic leading-snug max-w-lg mx-auto"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'rgba(245,234,216,0.55)' }}>
            "Every batch is personal. Because every customer is."
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase mt-4 font-semibold" style={{ color: 'rgba(166,124,82,0.45)' }}>
            — HAIQ Bakery
          </p>
        </div>
      </Container>

      <div style={{ height: '1px', background: 'rgba(166,124,82,0.2)', marginTop: '80px' }} />
    </section>
  )
}
