import { Link } from 'react-router-dom'
import Crown from '../shared/Crown'
import Container from '../shared/Container'
import Section from '../shared/Section'

const PICKS = ['Crimson Sin', 'Campfire After Dark', 'Blackout']

// Inline home-page CTA for Build Your Box — so choosing a box doesn't
// require a separate trip through the Shop page first (phase 2:
// "single page feel", fewer clicks to the thing a customer wants).
export default function BuildYourBoxStrip() {
  return (
    <Section tight style={{ background: '#1A0A00', borderTop: '1px solid rgba(166,124,82,0.15)', borderBottom: '1px solid rgba(166,124,82,0.15)' }}>
      <Container>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Crown size={18} color="#A67C52" />
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#A67C52' }}>
                Box Office
              </p>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4" style={{ color: '#F5EAD8' }}>
              Build Your Box.
            </h2>
            <p className="text-sm md:text-base leading-relaxed mb-6 max-w-md" style={{ color: 'rgba(245,234,216,0.55)' }}>
              Pick exactly 4 cookies from our 3 buildable flavours. Mix freely — one, two, or all three, your call.
            </p>
            <div className="flex gap-2 flex-wrap mb-7">
              {PICKS.map(name => (
                <span
                  key={name}
                  className="text-[10.5px] font-semibold px-3.5 py-2"
                  style={{ border: '1px solid rgba(166,124,82,0.3)', color: 'rgba(245,234,216,0.7)' }}
                >
                  {name}
                </span>
              ))}
            </div>
            <Link
              to="/build-your-box"
              className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.28em] uppercase px-8 py-4 transition-all hover:opacity-90"
              style={{ background: '#A67C52', color: '#1A0A00' }}
            >
              Start Building
            </Link>
          </div>

          <div className="aspect-[4/3] relative overflow-hidden" style={{ border: '1px solid rgba(166,124,82,0.2)', background: '#0E0600' }}>
            <div className="absolute inset-6 grid grid-cols-2 gap-3">
              <div className="rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #9c3b2e, #3d0d0d 75%)' }} />
              <div className="rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #B78D63, #A67C52 75%)' }} />
              <div className="rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #6a5947, #161616 75%)' }} />
              <div className="flex items-center justify-center text-2xl font-bold" style={{ border: '1.5px dashed rgba(166,124,82,0.4)', color: 'rgba(166,124,82,0.5)' }}>
                +
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
