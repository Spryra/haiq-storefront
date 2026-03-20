export default function BrandStory() {
  const pillars = [
    {
      icon: '⏱',
      title: 'Three Days in the Making',
      body: 'No shortcuts. No compromises. Every product spends at least 72 hours being developed, tested, and perfected before it earns the HAIQ name.',
    },
    {
      icon: '🌿',
      title: 'Ugandan Ingredients First',
      body: 'From Murchison Falls honey to Mt. Elgon grains to Lake Victoria salt — we source locally not because we have to, but because Uganda\'s larder is extraordinary.',
    },
    {
      icon: '📦',
      title: 'Unboxing is Part of the Experience',
      body: 'The matte black box. The wax seal. The tissue paper. Every delivery is designed to feel like receiving a gift — because it is.',
    },
  ]

  return (
    <section className="bg-dark text-light py-24 overflow-hidden">
      <div className="container mx-auto px-6">

        {/* Top: Big pull quote */}
        <div className="border-l-4 border-primary pl-8 mb-20 max-w-3xl">
          <p className="font-serif text-2xl md:text-4xl font-bold leading-snug text-light/90 mb-4">
            "We didn't set out to make cookies.
            <br />
            <span className="text-primary">We set out to make something people</span>
            <br />
            couldn't stop thinking about."
          </p>
          <p className="text-primary/70 text-sm font-medium tracking-wider uppercase">
            — The HAIQ Story
          </p>
        </div>

        {/* Bottom: Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="bg-dark p-8 hover:bg-white/5 transition-colors duration-300 group"
            >
              <div className="text-4xl mb-5">{p.icon}</div>
              <h3 className="font-serif text-xl font-bold mb-3 text-light group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="text-light/50 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-16 text-center">
          <p className="text-white/20 font-serif text-6xl md:text-8xl font-bold tracking-tight select-none">
            HAIQ
          </p>
        </div>
      </div>
    </section>
  )
}
