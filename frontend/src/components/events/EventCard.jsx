import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

const TZ = 'Africa/Kampala'
const fmt = (d, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(d))

function timeRange(start, end) {
  const t = { hour: 'numeric', minute: '2-digit', hour12: true }
  return end ? `${fmt(start, t)} – ${fmt(end, t)}` : fmt(start, t)
}

function CtaLink({ url, label }) {
  const cls = 'inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.22em] uppercase transition-all hover:gap-3'
  const style = { color: '#A67C52' }
  const content = <>{label || 'Learn more'} <ArrowRight size={14} /></>
  if (url.startsWith('/')) return <Link to={url} className={cls} style={style}>{content}</Link>
  return <a href={url} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{content}</a>
}

export default function EventCard({ event }) {
  const { title, description, location, starts_at, ends_at, image_url, cta_label, cta_url } = event

  return (
    <article
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.15)' }}
    >
      <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#0E0600' }}>
        {image_url && (
          <img src={image_url} alt={title} loading="lazy" className="w-full h-full object-cover" />
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
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="font-serif font-bold text-xl leading-tight mb-3" style={{ color: '#F5EAD8' }}>
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

        {cta_url && (
          <div className="mt-auto">
            <CtaLink url={cta_url} label={cta_label} />
          </div>
        )}
      </div>
    </article>
  )
}
