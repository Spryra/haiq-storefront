import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight, CalendarClock, PartyPopper, CalendarX2 } from 'lucide-react'

const TZ = 'Africa/Kampala'
const fmt = (d, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(d))

function timeRange(start, end) {
  const t = { hour: 'numeric', minute: '2-digit', hour12: true }
  return end ? `${fmt(start, t)} – ${fmt(end, t)}` : fmt(start, t)
}

function getStatus(event) {
  const now = Date.now()
  const start = new Date(event.starts_at).getTime()
  const end = event.ends_at
    ? new Date(event.ends_at).getTime()
    : new Date(event.starts_at).setHours(23, 59, 59, 999)
  if (now < start) return 'upcoming'
  if (now <= end) return 'live'
  return 'ended'
}

const STATUS_META = {
  upcoming: { label: 'Coming Soon', Icon: CalendarClock, color: '#A67C52', bg: 'rgba(166,124,82,0.85)' },
  live:     { label: 'Happening Now', Icon: PartyPopper, color: '#0E0600', bg: 'rgba(74,222,128,0.92)' },
  ended:    { label: 'Ended', Icon: CalendarX2, color: '#F5EAD8', bg: 'rgba(14,6,0,0.85)' },
}

export default function EventCard({ event }) {
  const { id, title, description, location, starts_at, ends_at, image_url } = event
  const status = getStatus(event)
  const m = STATUS_META[status]

  return (
    <Link
      to={`/events/${id}`}
      className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.15)' }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#0E0600' }}>
        {image_url && (
          <img
            src={image_url} alt={title} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div
          className="absolute top-4 left-4 flex flex-col items-center justify-center w-16 h-16"
          style={{ background: '#A67C52', color: '#1A0A00' }}
        >
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase leading-none">
            {fmt(starts_at, { month: 'short' })}
          </span>
          <span className="text-2xl font-bold leading-none mt-1">
            {fmt(starts_at, { day: 'numeric' })}
          </span>
        </div>
        <div
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.15em] uppercase backdrop-blur-sm"
          style={{ color: m.color, background: m.bg }}
        >
          <m.Icon size={11} className={status === 'live' ? 'animate-pulse' : ''} />
          {m.label}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3
          className="font-serif font-bold text-xl leading-tight mb-3 transition-colors group-hover:text-[#A67C52]"
          style={{ color: '#F5EAD8' }}
        >
          {title}
        </h3>

        <div className="flex flex-col gap-1.5 mb-4 text-xs" style={{ color: 'rgba(245,234,216,0.55)' }}>
          <span className="inline-flex items-center gap-2">
            <Clock size={13} style={{ color: '#A67C52' }} />
            {fmt(starts_at, { weekday: 'short', day: 'numeric', month: 'short' })} · {timeRange(starts_at, ends_at)}
          </span>
          {location && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={13} style={{ color: '#A67C52' }} />
              {location}
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: 'rgba(245,234,216,0.5)' }}>
            {description}
          </p>
        )}

        <div className="mt-auto">
          <span
            className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.22em] uppercase transition-all group-hover:gap-3"
            style={{ color: '#A67C52' }}
          >
            {status === 'ended' ? 'View Recap' : 'Reserve a Spot'} <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
