import { useState } from 'react'
import Crown from '../components/shared/Crown'

const FAQS = [
  {
    q: 'Do you have weed cookies?',
    a: 'No we do not.',
  },
  {
    q: 'Is delivery free?',
    a: 'No it is not. Delivery is charged at UGX 5,000 within Kampala.',
  },
  {
    q: 'Do you give discounts?',
    a: 'We do not give discounts. Every cookie is priced exactly as it should be.',
  },
  {
    q: 'How many cookies are in a pack and how many are in a box?',
    a: 'Each pack comes with 4 cookies. The Unboxing box also contains 4 cookies — individually wrapped.',
  },
]

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-primary/20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-6 py-7 text-left group"
      >
        <div className="flex items-start gap-5">
          <span className="text-primary/40 font-serif text-sm font-bold mt-0.5 flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-serif font-bold text-light text-lg md:text-xl leading-snug group-hover:text-primary transition-colors duration-200">
            {q}
          </span>
        </div>
        <span className={`text-primary text-xl flex-shrink-0 mt-1 transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}>
          +
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-40 pb-6' : 'max-h-0'}`}>
        <p className="text-light/60 text-base leading-relaxed pl-11">
          {a}
        </p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="bg-dark min-h-screen">

      {/* Header */}
      <div className="border-b border-primary/20 py-20 md:py-28 px-6 md:px-16">
        <Crown size={24} color="#B8752A" className="mb-5 opacity-70" />
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-3">
          Questions
        </p>
        <h1 className="font-serif font-bold text-light leading-tight mb-5"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
          FAQ.
        </h1>
        <div className="w-12 h-px bg-primary" />
      </div>

      {/* FAQ list */}
      <div className="px-6 md:px-16 py-12 max-w-3xl">
        {FAQS.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>

      {/* Still have questions */}
      <div className="px-6 md:px-16 py-16 border-t border-primary/20 max-w-3xl">
        <p className="text-light/50 text-sm mb-2">Still have a question?</p>
        <a
          href="/contact"
          className="text-primary font-semibold tracking-widest uppercase text-sm hover:text-haiq-gold transition-colors"
        >
          Contact Us →
        </a>
      </div>
    </div>
  )
}
