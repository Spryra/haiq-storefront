import { useRef, useEffect, useState } from 'react'
import Crown from '../shared/Crown'

const STEPS = [
  {
    number:  '01',
    title:   'Sourced.',
    tag:     'Ingredients',
    body:    'Every ingredient chosen deliberately. Real butter. Real cocoa. Nothing artificial, nothing skipped. What goes in determines everything that comes out.',
    detail:  'We source locally where possible — coconut from Ugandan suppliers, cocoa from trusted East African networks. Every batch starts with a decision, not a shortcut.',
    img:     '/images/process/process_05.jpg',
    imgAlt:  'HAIQ Coconut cookies through packaging window',
    color:   '#B8752A',
  },
  {
    number:  '02',
    title:   'Mixed.',
    tag:     'Dough',
    body:    "Dough built by hand. Each batch mixed to a precise texture — never rushed, never cut short.",
    detail:  'The marshmallow is toasted separately. The chocolate is measured by weight, not eye. Every cookie type has its own mixing sequence — the Campfire After Dark takes longest.',
    img:     '/images/process/process_02.jpg',
    imgAlt:  'Campfire cookies fresh on cooling rack',
    color:   '#D4A574',
  },
  {
    number:  '03',
    title:   'Baked.',
    tag:     'The Oven',
    body:    'Fresh every morning. We pull them at the exact moment — edges set, centre still moving.',
    detail:  'That window is everything. Twelve minutes is not the same as eleven. The Blackout goes in at a different temperature than the Crimson Sin. We do not mix batches.',
    img:     '/images/process/process_03.jpg',
    imgAlt:  'Fresh cookie batch on cooling rack',
    color:   '#E8C88A',
  },
  {
    number:  '04',
    title:   'Packed.',
    tag:     'Dispatch',
    body:    'Sealed immediately. Branded. Ready to travel from our kitchen to your hands.',
    detail:  'Still warm enough to matter. Every pouch is sealed by hand, labelled with the batch time, and checked before it leaves. We bake to order — nothing sits on a shelf.',
    img:     '/images/process/process_01.jpg',
    imgAlt:  'HAIQ cookies in branded pouches on marble',
    color:   '#B8752A',
  },
]

function useVisible(ref, threshold = 0.15) {
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

export default function ProcessSection() {
  const [activeStep, setActiveStep]   = useState(null)
  const [headerRef,  setHeaderRef]    = useState(null)
  const headerVisible = useVisible(headerRef, 0.1)

  const toggleStep = (idx) => setActiveStep(prev => prev === idx ? null : idx)

  return (
    <section style={{ background: '#140800' }} className="py-24 md:py-32">
      <div style={{ height: '1px', background: 'rgba(184,117,42,0.2)' }} />

      <div className="container mx-auto px-6 md:px-16 pt-16">

        {/* Header */}
        <div
          ref={setHeaderRef}
          className="mb-16 transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown size={18} color="#B8752A" />
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#B8752A' }}>
              The Process
            </p>
          </div>
          <h2
            className="font-serif font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#F2EAD8' }}
          >
            How We Make It.
          </h2>
          <p style={{ color: 'rgba(242,234,216,0.4)', maxWidth: '36rem' }} className="text-base leading-relaxed">
            No shortcuts. No compromise. Tap any step to go deeper.
          </p>
        </div>

        {/* Step list */}
        <div className="space-y-0">
          {STEPS.map((step, idx) => (
            <StepRow
              key={step.number}
              step={step}
              idx={idx}
              isActive={activeStep === idx}
              onToggle={() => toggleStep(idx)}
              isLast={idx === STEPS.length - 1}
            />
          ))}
        </div>

        {/* Bottom quote */}
        <div
          className="mt-20 text-center transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0 }}
        >
          <Crown size={20} color="#B8752A" className="mx-auto mb-5 opacity-35" />
          <p className="font-serif italic leading-snug max-w-lg mx-auto"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'rgba(242,234,216,0.55)' }}>
            "Every batch is personal. Because every customer is."
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase mt-4 font-semibold" style={{ color: 'rgba(184,117,42,0.45)' }}>
            — HAIQ Bakery
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(184,117,42,0.2)', marginTop: '80px' }} />
    </section>
  )
}

function StepRow({ step, idx, isActive, onToggle, isLast }) {
  const [rowRef, setRowRef]   = useState(null)
  const isVisible = useVisible(rowRef, 0.08)
  const contentRef = useRef(null)
  const [contentH, setContentH] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentH(isActive ? contentRef.current.scrollHeight : 0)
    }
  }, [isActive])

  return (
    <div
      ref={setRowRef}
      className="transition-all duration-700"
      style={{
        opacity:         isVisible ? 1 : 0,
        transform:       isVisible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${idx * 80}ms`,
      }}
    >
      {/* Top border */}
      <div style={{ height: '1px', background: isActive ? 'rgba(184,117,42,0.5)' : 'rgba(184,117,42,0.15)', transition: 'background 0.3s' }} />

      {/* Main clickable row */}
      <button
        onClick={onToggle}
        className="w-full text-left transition-all duration-300"
        style={{
          background:   isActive ? 'rgba(184,117,42,0.06)' : 'transparent',
          padding:      '28px 0',
          cursor:       'pointer',
        }}
      >
        <div className="flex items-start gap-6 md:gap-10">

          {/* Step number */}
          <div
            className="flex-shrink-0 font-serif font-bold leading-none select-none"
            style={{
              fontSize:   'clamp(2.4rem, 5vw, 4.5rem)',
              color:      isActive ? step.color : 'rgba(184,117,42,0.18)',
              transition: 'color 0.3s',
              minWidth:   '72px',
              textAlign:  'right',
            }}
          >
            {step.number}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.28em] px-2 py-0.5"
                  style={{
                    color:      isActive ? '#1A0A00' : step.color,
                    background: isActive ? step.color : 'rgba(184,117,42,0.1)',
                    transition: 'all 0.3s',
                  }}
                >
                  {step.tag}
                </span>
              </div>
              <h3
                className="font-serif font-bold leading-tight"
                style={{
                  fontSize:   'clamp(1.6rem, 3.5vw, 2.8rem)',
                  color:      isActive ? '#F2EAD8' : 'rgba(242,234,216,0.65)',
                  transition: 'color 0.3s',
                }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed mt-2 max-w-lg"
                style={{ color: isActive ? 'rgba(242,234,216,0.7)' : 'rgba(242,234,216,0.35)', transition: 'color 0.3s' }}
              >
                {step.body}
              </p>
            </div>

            {/* Expand indicator */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                border:     `1px solid ${isActive ? step.color : 'rgba(184,117,42,0.25)'}`,
                background: isActive ? step.color : 'transparent',
              }}
            >
              <span
                className="font-bold text-sm transition-transform duration-300"
                style={{
                  color:     isActive ? '#1A0A00' : '#B8752A',
                  transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
                  display:   'block',
                }}
              >
                +
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expandable detail area */}
      <div
        style={{
          maxHeight:  `${contentH}px`,
          overflow:   'hidden',
          transition: 'max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={contentRef}>
          <div
            className="flex flex-col md:flex-row gap-6 pb-10"
            style={{ paddingLeft: 'calc(72px + 2.5rem)' }}
          >
            {/* Extra copy */}
            <div className="flex-1">
              <p
                className="text-sm leading-relaxed border-l-2 pl-4"
                style={{
                  color:       'rgba(242,234,216,0.55)',
                  borderColor: step.color,
                }}
              >
                {step.detail}
              </p>
            </div>

            {/* Photo */}
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{ width: '100%', maxWidth: '280px', aspectRatio: '4/3' }}
            >
              <img
                src={step.img}
                alt={step.imgAlt}
                loading="lazy"
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(0.85)',
                  transition: 'filter 0.4s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(0.85)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {isLast && <div style={{ height: '1px', background: 'rgba(184,117,42,0.15)' }} />}
    </div>
  )
}
