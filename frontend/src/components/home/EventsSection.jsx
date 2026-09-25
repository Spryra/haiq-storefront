import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Container from '../shared/Container'
import Section from '../shared/Section'
import Crown from '../shared/Crown'
import EventCard from '../events/EventCard'
import api from '../../services/api'

// Desktop-only (lg and up): tablet and mobile reach events through the
// nav's Events tab instead. Renders nothing when there are no events.
export default function EventsSection() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get('/events?limit=3')
      .then(res => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
  }, [])

  if (events.length === 0) return null

  return (
    <Section
      id="events"
      className="hidden lg:block"
      style={{ background: '#0E0600', borderTop: '1px solid rgba(166,124,82,0.15)' }}
    >
      <Container>
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Crown size={18} color="#A67C52" />
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#A67C52' }}>
                What's on
              </p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-light">Events.</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-light font-medium text-sm hover:text-primary transition group"
          >
            All events
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      </Container>
    </Section>
  )
}
