import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Clock, ArrowLeft, ArrowRight, CalendarClock, CalendarCheck2,
  CalendarX2, PartyPopper, User, Phone, Mail, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react'
import Container from '../components/shared/Container'
import Crown from '../components/shared/Crown'
import LazyImage from '../components/shared/LazyImage'
import { EventDetailSEO } from '../components/shared/SEO'
import api from '../services/api'

const TZ = 'Africa/Kampala'
const fmt = (d, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(d))
const timeFmt = { hour: 'numeric', minute: '2-digit', hour12: true }

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
  upcoming: { label: 'Coming Soon', Icon: CalendarClock, color: '#A67C52', bg: 'rgba(166,124,82,0.12)' },
  live:     { label: 'Happening Now', Icon: PartyPopper, color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  ended:    { label: 'Ended', Icon: CalendarX2, color: '#8C7355', bg: 'rgba(140,115,85,0.12)' },
}

function StatusBadge({ status, className = '' }) {
  const m = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-[0.22em] uppercase ${className}`}
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}40` }}
    >
      <m.Icon size={13} className={status === 'live' ? 'animate-pulse' : ''} />
      {m.label}
    </span>
  )
}

// Above-the-fold hero content is visible on first paint, so a plain mount-triggered
// fade beats IntersectionObserver here — two rAF frames match the pattern HeroSection
// uses (ensures the initial state paints before the transition kicks in).
function useReveal() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let raf1, raf2
    raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setVisible(true)) })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [])
  return visible
}

function BookingForm({ event }) {
  const [form, setForm]       = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [done, setDone]       = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.name.trim().length < 2) return setError('Please enter your full name.')
    if (form.phone.replace(/\D/g, '').length < 7) return setError('Please enter a valid phone number.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.')

    setSaving(true)
    try {
      await api.post(`/events/${event.id}/book`, form)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div
        className="flex flex-col items-center text-center px-8 py-14 animate-[fadeUp_0.5s_ease]"
        style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(74,222,128,0.15)' }}
        >
          <CheckCircle2 size={28} style={{ color: '#4ade80' }} />
        </div>
        <p className="font-serif font-bold text-xl mb-2" style={{ color: '#F5EAD8' }}>You're Confirmed.</p>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(245,234,216,0.5)' }}>
          A confirmation with your booking reference is on its way to <strong style={{ color: '#F5EAD8' }}>{form.email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="relative">
        <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A67C52' }} />
        <input
          value={form.name} onChange={set('name')} placeholder="Full name"
          className="w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-colors"
          style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.25)', color: '#F5EAD8' }}
        />
      </div>
      <div className="relative">
        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A67C52' }} />
        <input
          value={form.phone} onChange={set('phone')} placeholder="Phone number" type="tel"
          className="w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-colors"
          style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.25)', color: '#F5EAD8' }}
        />
      </div>
      <div className="relative">
        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A67C52' }} />
        <input
          value={form.email} onChange={set('email')} placeholder="Email address" type="email"
          className="w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-colors"
          style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.25)', color: '#F5EAD8' }}
        />
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: '#f87171' }}>
          <AlertTriangle size={13} /> {error}
        </p>
      )}

      <button
        type="submit" disabled={saving}
        className="w-full flex items-center justify-center gap-2 font-bold text-[11px] tracking-[0.28em] uppercase py-4 transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: '#A67C52', color: '#1A0A00' }}
      >
        {saving ? <><Loader2 size={14} className="animate-spin" /> Booking…</> : <>Reserve My Spot <ArrowRight size={14} /></>}
      </button>
    </form>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event,   setEvent]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const heroVisible = useReveal()

  useEffect(() => {
    setLoading(true); setError(false)
    api.get(`/events/${id}`)
      .then(res => setEvent(res.data.event))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ background: '#0E0600', minHeight: '100vh' }}>
        <Container className="py-24">
          <div className="skeleton mb-8" style={{ height: 360, background: 'rgba(166,124,82,0.06)' }} />
          <div className="skeleton" style={{ height: 24, width: 240, background: 'rgba(166,124,82,0.06)' }} />
        </Container>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ background: '#0E0600', minHeight: '100vh' }}>
        <Container className="py-24 text-center">
          <CalendarX2 size={32} className="mx-auto mb-4" style={{ color: '#8C7355' }} />
          <p className="font-serif text-2xl font-bold mb-2" style={{ color: '#F5EAD8' }}>Event not found.</p>
          <p className="text-sm mb-8" style={{ color: '#8C7355' }}>It may have been removed or the link is incorrect.</p>
          <Link to="/events" className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.25em] uppercase" style={{ color: '#A67C52' }}>
            <ArrowLeft size={14} /> Back to Events
          </Link>
        </Container>
      </div>
    )
  }

  const status = getStatus(event)

  return (
    <div style={{ background: '#0E0600', minHeight: '100vh' }}>
      <EventDetailSEO event={event} />

      {/* Hero */}
      <div className="relative border-b" style={{ borderColor: 'rgba(166,124,82,0.2)' }}>
        <div className="relative w-full" style={{ aspectRatio: '21/9', minHeight: 280, background: '#1A0A00' }}>
          {event.image_url ? (
            <LazyImage
              src={event.image_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Crown size={40} color="rgba(166,124,82,0.2)" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,6,0,0.2) 0%, rgba(14,6,0,0.75) 75%, #0E0600 100%)' }} />
        </div>

        <Container className="relative -mt-20 md:-mt-24 pb-10">
          <div
            className="transition-all duration-700"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <Link to="/events" className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase mb-5 hover:opacity-75 transition-opacity" style={{ color: 'rgba(245,234,216,0.5)' }}>
              <ArrowLeft size={13} /> All Events
            </Link>

            <StatusBadge status={status} className="mb-5" />

            <h1
              className="font-serif font-bold leading-[0.98] mb-5"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', color: '#F5EAD8' }}
            >
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(245,234,216,0.6)' }}>
              <span className="inline-flex items-center gap-2">
                <Clock size={15} style={{ color: '#A67C52' }} />
                {fmt(event.starts_at, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {fmt(event.starts_at, timeFmt)}{event.ends_at ? ` – ${fmt(event.ends_at, timeFmt)}` : ''}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} style={{ color: '#A67C52' }} />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-14 md:py-20">
        <div className="grid md:grid-cols-3 gap-12">

          {/* Left — description + gallery */}
          <div className="md:col-span-2 space-y-12">
            {event.description && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={16} color="#A67C52" />
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#A67C52' }}>About</p>
                </div>
                <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: 'rgba(245,234,216,0.6)' }}>
                  {event.description}
                </p>
              </div>
            )}

            {event.images?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={16} color="#A67C52" />
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#A67C52' }}>Gallery</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {event.images.map((img, i) => (
                    <LazyImage
                      key={img.id}
                      src={img.url}
                      alt={img.alt_text || `${event.title} — photo ${i + 1}`}
                      className="aspect-square"
                      style={{ border: '1px solid rgba(166,124,82,0.15)' }}
                      imgClassName="hover:scale-[1.04]"
                      imgStyle={{ transition: 'transform 0.5s ease' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {event.cta_url && (
              <div>
                {event.cta_url.startsWith('/') ? (
                  <Link
                    to={event.cta_url}
                    className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.25em] uppercase px-8 py-4 transition-all hover:opacity-90"
                    style={{ background: '#A67C52', color: '#1A0A00' }}
                  >
                    {event.cta_label || 'Learn More'} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <a
                    href={event.cta_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.25em] uppercase px-8 py-4 transition-all hover:opacity-90"
                    style={{ background: '#A67C52', color: '#1A0A00' }}
                  >
                    {event.cta_label || 'Learn More'} <ArrowRight size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right — booking */}
          <div>
            <div className="sticky top-24 p-6 md:p-7" style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.2)' }}>
              {status === 'ended' ? (
                <div className="flex flex-col items-center text-center py-6">
                  <CalendarX2 size={26} className="mb-4" style={{ color: '#8C7355' }} />
                  <p className="font-serif font-bold text-lg mb-2" style={{ color: '#F5EAD8' }}>This Event Has Ended.</p>
                  <p className="text-sm mb-6" style={{ color: '#8C7355' }}>Follow @haiq_ug so you don't miss the next one.</p>
                  <Link to="/events" className="inline-flex items-center gap-2 font-bold text-[11px] tracking-[0.25em] uppercase" style={{ color: '#A67C52' }}>
                    See What's Next <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CalendarCheck2 size={16} style={{ color: '#A67C52' }} />
                    <p className="font-serif font-bold text-lg" style={{ color: '#F5EAD8' }}>Reserve Your Spot</p>
                  </div>
                  <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(245,234,216,0.45)' }}>
                    Free to attend. We'll email your confirmation instantly.
                  </p>
                  <BookingForm event={event} />
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
