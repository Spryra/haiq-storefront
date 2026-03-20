import Crown from '../components/shared/Crown'

const MOMENTS = [
  { src: '/images/moments/moment_1.jpg', caption: 'The Blackout, undivided attention.', sub: 'Kampala, 2025' },
  { src: '/images/moments/moment_2.jpg', caption: 'Every bite, deliberate.', sub: 'Made For You' },
  { src: '/images/moments/moment_3.jpg', caption: 'Made for moments like this.', sub: 'Kampala, 2025' },
  { src: '/images/moments/moment_4.jpg', caption: 'Venom. Everywhere she goes.', sub: 'Muyenga, Kampala' },
  { src: '/images/moments/moment_5.jpg', caption: 'The Campfire, mid-thought.', sub: 'Made For You' },
  { src: '/images/moments/moment_6.jpg', caption: 'Slow down. Taste it.', sub: 'Kampala, 2025' },
  { src: '/images/moments/moment_7.jpg', caption: 'Kampala tastes better now.', sub: 'Made For You' },
  { src: '/images/moments/moment_8.jpg', caption: 'She came for one. Stayed for four.', sub: 'Kampala, 2025' },
  { src: '/images/moments/moment_9.jpg', caption: 'The Unboxing. Right on time.', sub: 'Made For You' },
  { src: '/images/moments/moment_10.jpg', caption: 'Open it. Own it.', sub: 'Kampala, 2025' },
]

export default function MomentsPage() {
  return (
    <div className="bg-dark min-h-screen">

      {/* Hero header */}
      <div className="border-b border-primary/20 py-20 md:py-28 px-6 md:px-16">
        <Crown size={24} color="#B8752A" className="mb-5 opacity-70" />
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-3">
          Made For You
        </p>
        <h1 className="font-serif font-bold text-light leading-tight mb-5"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
          Moments.
        </h1>
        <div className="w-12 h-px bg-primary mb-6" />
        <p className="text-light/50 max-w-sm text-base leading-relaxed">
          Real people. Real cookies. Real Kampala.
          These are the moments HAIQ was made for.
        </p>
      </div>

      {/* Masonry-style grid */}
      <div className="px-6 md:px-16 py-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {MOMENTS.map((m, i) => (
            <div key={i} className="break-inside-avoid group relative overflow-hidden">
              <img
                src={m.src}
                alt={m.caption}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 px-4 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-light text-sm font-medium leading-snug">{m.caption}</p>
                <p className="text-primary text-[10px] tracking-widest uppercase mt-1">{m.sub}</p>
              </div>
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-primary/20 py-16 px-6 text-center">
        <Crown size={24} color="#B8752A" className="mx-auto mb-4 opacity-50" />
        <p className="text-light/50 text-sm mb-6 tracking-wide">Be part of the next moment.</p>
        <a
          href="/shop"
          className="inline-block bg-primary text-dark px-10 py-4 font-bold text-sm tracking-widest uppercase hover:bg-haiq-gold transition-colors duration-300"
        >
          Order Now
        </a>
      </div>
    </div>
  )
}
