import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative h-[88vh] min-h-[560px] bg-dark text-light overflow-hidden">

      {/* CSS gradient background — no image file required */}
      <div className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(193,154,107,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(193,154,107,0.08) 0%, transparent 50%),
            linear-gradient(135deg, #0E0E10 0%, #1a1208 50%, #0E0E10 100%)
          `
        }}
      />

      {/* Decorative grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(193,154,107,1) 1px, transparent 1px), linear-gradient(90deg, rgba(193,154,107,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-light to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 h-full flex items-center">
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <p
            className="text-primary text-xs font-semibold tracking-[0.25em] uppercase mb-5 transition-all duration-700"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(16px)' }}
          >
            Kampala · Uganda · Baked Fresh Daily
          </p>

          {/* Headline */}
          <h1
            className="font-serif text-5xl md:text-7xl font-bold leading-[1.05] mb-6 transition-all duration-700 delay-100"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(24px)' }}
          >
            Uganda's
            <br />
            <span className="text-primary">Boldest</span>
            <br />
            Cookies.
          </h1>

          {/* Subtext */}
          <p
            className="text-light/70 text-lg mb-10 leading-relaxed max-w-md transition-all duration-700 delay-200"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(24px)' }}
          >
            Handcrafted with obsession. Baked fresh every morning.
            From the slopes of Mt. Elgon to your doorstep.
          </p>

          {/* CTAs */}
          <div
            className="flex items-center gap-4 flex-wrap transition-all duration-700 delay-300"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(24px)' }}
          >
            <Link
              to="/shop"
              className="group relative bg-primary text-dark px-8 py-3.5 rounded-full font-bold text-base overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(193,154,107,0.5)]"
            >
              <span className="relative z-10">Shop Now</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
            </Link>
            <Link
              to="/build-your-own"
              className="border border-light/40 text-light px-8 py-3.5 rounded-full font-medium text-base hover:border-primary hover:text-primary transition-all duration-300"
            >
              Build Your Box →
            </Link>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute top-8 right-8 z-20 hidden md:flex flex-col items-center justify-center w-24 h-24 rounded-full border border-primary/40 bg-dark/60 backdrop-blur-sm text-center transition-all duration-700 delay-500"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        <span className="text-primary text-[10px] font-bold tracking-wider uppercase leading-tight">Est.</span>
        <span className="text-light font-serif text-xl font-bold">2019</span>
        <span className="text-primary text-[10px] font-bold tracking-wider uppercase leading-tight">Kampala</span>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-all duration-700 delay-500"
        style={{ opacity: loaded ? 0.5 : 0 }}
      >
        <span className="text-light text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-light/40 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-primary animate-[scrollDot_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  )
}
