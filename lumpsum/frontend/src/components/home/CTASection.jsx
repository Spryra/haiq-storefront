import { Link } from 'react-router-dom'
import Crown from '../shared/Crown'

export default function CTASection() {
  return (
    <section className="relative bg-dark overflow-hidden py-28 md:py-40">

      {/* Thin top rule — Bugatti style */}
      <div className="absolute top-0 left-0 right-0 h-px bg-primary/30" />

      {/* Vertical accent lines */}
      <div className="absolute top-0 left-[8%] w-px h-full bg-primary/10" />
      <div className="absolute top-0 right-[8%] w-px h-full bg-primary/10" />

      <div className="container mx-auto px-6 md:px-16 text-center">

        <Crown size={32} color="#B8752A" className="mx-auto mb-8 opacity-70" />

        <p className="text-primary text-[10px] font-semibold tracking-[0.35em] uppercase mb-5">
          Made For You
        </p>

        <h2
          className="font-serif font-bold text-light leading-[0.95] mb-8"
          style={{ fontSize: 'clamp(3rem, 7vw, 6.5rem)' }}
        >
          Ready When<br />You Are.
        </h2>

        <div className="w-12 h-px bg-primary mx-auto mb-8" />

        <p className="text-light/50 max-w-md mx-auto text-base leading-relaxed mb-12">
          Four cookies. Six flavours. One bakery in Kampala that takes every order personally.
        </p>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-10 md:gap-16 mb-14 flex-wrap">
          {[
            { icon: '🍪', label: 'Baked Fresh Daily' },
            { icon: '📦', label: 'Same-Day Delivery' },
            { icon: '👑', label: 'Loyalty Rewards' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="text-light/60 text-xs font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          <Link
            to="/shop"
            className="group relative bg-primary text-dark px-10 py-4 font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(184,117,42,0.5)]"
          >
            <span className="relative z-10">Order Now</span>
            <div className="absolute inset-0 bg-haiq-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          </Link>
          <Link
            to="/build-your-box"
            className="border border-primary/40 text-primary px-10 py-4 font-bold text-sm tracking-widest uppercase hover:bg-primary hover:text-dark transition-all duration-300"
          >
            Build Your Box
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/30" />
    </section>
  )
}
