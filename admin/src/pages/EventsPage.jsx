import { useState, useEffect } from 'react'
import adminApi from '../services/adminApi'
import Button from '../components/shared/Button'
import { PageShell, PageHeader, Card, EmptyState } from '../components/shared/ui'
import { usePop } from '../lib/anim'
import { CalendarDays, Plus, Pencil, Trash2, CheckCircle2, CircleOff, AlertTriangle, X, Info } from 'lucide-react'

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

function EventModal({ mode, form, setForm, err, saving, onClose, onSave }) {
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
          <Field label="Description">
            <textarea className="admin-input" rows={3} value={form.description} onChange={set('description')} placeholder="What should people expect?" />
          </Field>
          <Field label="Image URL (optional)">
            <input className="admin-input" value={form.image_url} onChange={set('image_url')} placeholder="https://…" />
          </Field>
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
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState(null)

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
          Published events show on the storefront home page (desktop) and the Events tab (phone and tablet) until they finish. Drafts stay hidden.
        </p>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 rounded skeleton" style={{ background: '#3D2000' }} />)}</div>
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" sub="Add your first event to show it on the storefront." />
        ) : (
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full text-sm min-w-[640px]">
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
        <EventModal mode={modal === 'new' ? 'new' : 'edit'} form={form} setForm={setForm} err={err} saving={saving}
          onClose={() => setModal(null)} onSave={save} />
      )}
    </PageShell>
  )
}
