import { useState, useEffect } from 'react'
import Container from '../components/shared/Container'
import Crown from '../components/shared/Crown'
import EventCard from '../components/events/EventCard'
import { EventsSEO } from '../components/shared/SEO'
import api from '../services/api'

export default function EventsPage() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    api.get('/events?limit=50')
      .then(res => setEvents(res.data.events || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#0E0600', minHeight: '100vh' }}>
      <EventsSEO />

      <div className="border-b py-16 md:py-20" style={{ borderColor: 'rgba(166,124,82,0.2)' }}>
        <Container>
          <Crown size={20} color="#A67C52" className="mb-5 opacity-65" />
          <h1
            className="font-serif font-bold leading-tight mb-3"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', color: '#F5EAD8' }}
          >
            Events.
          </h1>
          <div className="w-10 h-px mb-4" style={{ background: '#A67C52' }} />
          <p style={{ color: 'rgba(245,234,216,0.4)' }} className="text-base max-w-sm leading-relaxed">
            Pop-ups, tastings and the odd surprise. Come say hi.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="skeleton" style={{ height: 380, background: 'rgba(166,124,82,0.06)' }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center py-20 text-sm" style={{ color: '#8C7355' }}>
            Couldn't load events right now. Please try again shortly.
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <p className="font-serif text-2xl font-bold mb-2" style={{ color: '#F5EAD8' }}>
              Nothing on just yet.
            </p>
            <p className="text-sm" style={{ color: '#8C7355' }}>
              Follow @haiq_ug for the next announcement.
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </Container>
    </div>
  )
}
