import { useState, useEffect, useRef } from 'react'
import adminApi from '../services/adminApi'
import Button from '../components/shared/Button'
import { PageShell, PageHeader, Card, EmptyState } from '../components/shared/ui'
import { usePop } from '../lib/anim'
import {
  CalendarDays, Plus, Pencil, Trash2, CheckCircle2, CircleOff, AlertTriangle, X, Info,
  ImagePlus, Loader2, Users, Phone, Mail, Clock3,
} from 'lucide-react'

// Kampala is UTC+3 all year (no DST), so datetime-local values are stored with a fixed +03:00 offset.
const KAMPALA_OFFSET_MS = 3 * 60 * 60 * 1000
const toInput = (iso) => (iso ? new Date(new Date(iso).getTime() + KAMPALA_OFFSET_MS).toISOString().slice(0, 16) : '')
const toIso   = (local) => (local ? `${local}:00+03:00` : null)
const show    = (iso) => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Kampala', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
}).format(new Date(iso))

const EMPTY = { title: '', description: '', location: '', starts_at: '', ends_at: '', image_url: '', cta_label: '', cta_url: '', is_published: false }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>{label}</label>
      {children}
    </div>
  )
}

// ── Gallery manager — only usable once the event has an id (i.e. saved at least once) ──
function GalleryManager({ eventId }) {
  const [images,    setImages]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [err,       setErr]       = useState(null)
  const fileRef = useRef(null)

  const load = () => {
    setLoading(true)
    adminApi.get(`/admin/events/${eventId}/images`)
      .then(r => setImages(r.data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [eventId])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      await adminApi.post(`/admin/events/${eventId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      load()
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const del = async (img) => {
    setImages(imgs => imgs.filter(i => i.id !== img.id))
    try { await adminApi.delete(`/admin/events/${eventId}/images/${img.id}`) } catch { load() }
  }

  return (
    <Field label={`Gallery ${images.length ? `(${images.length})` : ''}`}>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {loading ? (
          [0, 1].map(i => <div key={i} className="aspect-square rounded skeleton" style={{ background: '#3D2000' }} />)
        ) : images.map(img => (
          <div key={img.id} className="relative aspect-square rounded overflow-hidden group" style={{ border: '1px solid rgba(184,117,42,0.25)' }}>
            <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
            <button
              onClick={() => del(img)}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#f87171' }}
              title="Remove photo"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded flex flex-col items-center justify-center gap-1 transition-colors hover:opacity-80 disabled:opacity-50"
          style={{ border: '1px dashed rgba(184,117,42,0.35)', color: '#B8752A' }}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          <span className="text-[8px] font-semibold uppercase tracking-wider">{uploading ? 'Uploading' : 'Add'}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      {err && <p className="text-[11px] flex items-center gap-1" style={{ color: '#f87171' }}><AlertTriangle size={12} /> {err}</p>}
      <p className="text-[10px]" style={{ color: '#8C7355' }}>A few photos shown on the event's public page.</p>
    </Field>
  )
}

// ── Bookings viewer — read-only list of name / phone / email ──
function BookingsModal({ event, onClose }) {
  const popRef = usePop()
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    adminApi.get(`/admin/events/${event.id}/bookings`)
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [event.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div ref={popRef} className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl overflow-hidden" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #3D2000' }}>
          <div className="flex items-center gap-2 min-w-0">
            <Users size={15} style={{ color: '#B8752A' }} />
            <h2 className="font-serif font-bold text-lg truncate" style={{ color: '#F2EAD8' }}>Bookings — {event.title}</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition flex-shrink-0" style={{ color: '#8C7355' }}><X size={18} /></button>
        </div>

        <div className="overflow-y-auto admin-scroll">
          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded skeleton" style={{ background: '#3D2000' }} />)}</div>
          ) : bookings.length === 0 ? (
            <EmptyState icon={Users} title="No bookings yet" sub="Confirmed bookings for this event will appear here." />
          ) : (
            <div>
              {bookings.map(b => (
                <div key={b.id} className="px-6 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#F2EAD8' }}>{b.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: '#8C7355' }}>
                      <span className="inline-flex items-center gap-1"><Phone size={11} /> {b.phone}</span>
                      <span className="inline-flex items-center gap-1 truncate"><Mail size={11} /> {b.email}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] flex-shrink-0" style={{ color: '#8C7355' }}>
                    <Clock3 size={11} /> {show(b.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EventModal({ mode, event, form, setForm, err, saving, onClose, onSave }) {
  const popRef = usePop()
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div ref={popRef} className="w-full max-w-lg max-h-full flex flex-col rounded-xl overflow-hidden" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #3D2000' }}>
          <div className="flex items-center gap-2">
            <CalendarDays size={15} style={{ color: '#B8752A' }} />
            <h2 className="font-serif font-bold text-lg" style={{ color: '#F2EAD8' }}>{mode === 'new' ? 'Add Event' : 'Edit Event'}</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition" style={{ color: '#8C7355' }}><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto admin-scroll">
          <Field label="Title">
            <input className="admin-input" value={form.title} onChange={set('title')} placeholder="e.g. Saturday Pop-Up at Muyenga Market" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts (Kampala time)">
              <input type="datetime-local" className="admin-input" value={form.starts_at} onChange={set('starts_at')} />
            </Field>
            <Field label="Ends (optional)">
              <input type="datetime-local" className="admin-input" value={form.ends_at} onChange={set('ends_at')} />
            </Field>
          </div>
          <Field label="Location">
            <input className="admin-input" value={form.location} onChange={set('location')} placeholder="e.g. Muyenga, Kampala" />
          </Field>
          <Field label="Description — shown on the event's public page">
            <textarea className="admin-input" rows={5} value={form.description} onChange={set('description')}
              placeholder="Tell people what to expect — the vibe, what's on offer, why they should come. This is the full story shown on the event page (the card on the homepage only shows a short preview)." />
          </Field>
          <Field label="Cover Image URL (optional)">
            <input className="admin-input" value={form.image_url} onChange={set('image_url')} placeholder="https://…" />
          </Field>

          {mode !== 'new' && <GalleryManager eventId={event.id} />}
          {mode === 'new' && (
            <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#8C7355' }}>
              <Info size={12} /> Save the event first, then reopen it to add gallery photos.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Button label (optional)">
              <input className="admin-input" value={form.cta_label} onChange={set('cta_label')} placeholder="e.g. Build Your Box" />
            </Field>
            <Field label="Button link (optional)">
              <input className="admin-input" value={form.cta_url} onChange={set('cta_url')} placeholder="/shop or https://…" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#F2EAD8' }}>
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            Published (visible on the storefront)
          </label>
          {err && <p className="text-xs flex items-center gap-1.5" style={{ color: '#f87171' }}><AlertTriangle size={13} /> {err}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid #3D2000' }}>
          <Button onClick={onClose} variant="muted" size="sm">Cancel</Button>
          <Button onClick={onSave} disabled={saving} loading={saving} variant="primary" size="sm">Save Event</Button>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [bookingsFor, setBookingsFor] = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/events')
      .then(r => setEvents(r.data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew  = () => { setForm(EMPTY); setErr(null); setModal('new') }
  const openEdit = (ev) => {
    setForm({
      title: ev.title, description: ev.description || '', location: ev.location || '',
      starts_at: toInput(ev.starts_at), ends_at: toInput(ev.ends_at),
      image_url: ev.image_url || '', cta_label: ev.cta_label || '', cta_url: ev.cta_url || '',
      is_published: ev.is_published,
    })
    setErr(null); setModal(ev)
  }

  const save = async () => {
    if (!form.title.trim() || !form.starts_at) { setErr('Title and start time are required.'); return }
    if (form.ends_at && form.ends_at < form.starts_at) { setErr('End time cannot be before the start time.'); return }
    setSaving(true); setErr(null)
    const payload = { ...form, title: form.title.trim(), starts_at: toIso(form.starts_at), ends_at: toIso(form.ends_at) }
    try {
      if (modal === 'new') await adminApi.post('/admin/events', payload)
      else await adminApi.put(`/admin/events/${modal.id}`, payload)
      load(); setModal(null)
    } catch (e) { setErr(e.response?.data?.error || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const togglePublish = async (ev) => {
    try {
      await adminApi.put(`/admin/events/${ev.id}`, {
        ...ev, starts_at: ev.starts_at, ends_at: ev.ends_at, is_published: !ev.is_published,
      })
      load()
    } catch {}
  }
  const del = async (ev) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return
    try { await adminApi.delete(`/admin/events/${ev.id}`); load() } catch {}
  }

  return (
    <PageShell deps={[loading]} max="1000px">
      <PageHeader label="Storefront" title="Events" icon={CalendarDays} actions={
        <Button onClick={openNew} variant="primary" size="sm"><Plus size={14} /> Add Event</Button>
      } />

      <Card className="!py-3 flex items-start gap-3" style={{ background: 'rgba(184,117,42,0.06)', borderColor: 'rgba(184,117,42,0.2)' }}>
        <Info size={16} style={{ color: '#B8752A', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm leading-relaxed" style={{ color: '#8C7355' }}>
          Published events get their own page — cover photo, description, a gallery, and instant booking (name, phone, email). Each guest gets a confirmation email automatically.
        </p>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 rounded skeleton" style={{ background: '#3D2000' }} />)}</div>
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" sub="Add your first event to show it on the storefront." />
        ) : (
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #3D2000' }}>
                  {['Event', 'When', 'Location', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#8C7355' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,117,42,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: '#F2EAD8' }}>{ev.title}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8C7355' }}>{show(ev.starts_at)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8C7355' }}>{ev.location || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(ev)} className="admin-pill" title="Toggle published"
                        style={ev.is_published ? { color: '#4ade80', background: 'rgba(74,222,128,0.12)' } : { color: '#8C7355', background: 'rgba(140,115,85,0.12)' }}>
                        {ev.is_published ? <><CheckCircle2 size={11} /> Published</> : <><CircleOff size={11} /> Draft</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => setBookingsFor(ev)} className="inline-flex items-center gap-1 text-[10px] hover:underline" style={{ color: '#8C7355' }}><Users size={12} /> Bookings</button>
                        <button onClick={() => openEdit(ev)} className="inline-flex items-center gap-1 text-[10px] hover:underline" style={{ color: '#B8752A' }}><Pencil size={12} /> Edit</button>
                        <button onClick={() => del(ev)} className="inline-flex items-center gap-1 text-[10px] hover:underline" style={{ color: '#f87171' }}><Trash2 size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <EventModal mode={modal === 'new' ? 'new' : 'edit'} event={modal === 'new' ? null : modal} form={form} setForm={setForm} err={err} saving={saving}
          onClose={() => setModal(null)} onSave={save} />
      )}

      {bookingsFor && <BookingsModal event={bookingsFor} onClose={() => setBookingsFor(null)} />}
    </PageShell>
  )
}
