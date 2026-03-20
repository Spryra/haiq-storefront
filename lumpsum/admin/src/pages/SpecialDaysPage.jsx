// SpecialDaysPage.jsx
// Backend route responses: { days: [...] } | { day: {...} }
// Toggle: PATCH /admin/special-days/:id/toggle
// Delete: DELETE /admin/special-days/:id
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'

export default function SpecialDaysPage() {
  const [days,     setDays]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const [form,     setForm]     = useState({ label: '', date_from: '', date_to: '' })

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/special-days')
      .then(res => setDays(res.data.days || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async e => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await adminApi.post('/admin/special-days', form)
      setShowForm(false)
      setForm({ label: '', date_from: '', date_to: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to save.')
    } finally { setSaving(false) }
  }

  const toggle = async (id) => {
    try {
      await adminApi.patch(`/admin/special-days/${id}/toggle`)
      load()
    } catch (e) { console.error(e) }
  }

  const del = async (id) => {
    if (!confirm('Delete this special day?')) return
    try {
      await adminApi.delete(`/admin/special-days/${id}`)
      load()
    } catch (e) { console.error(e) }
  }

  const isToday = (day) => {
    const today = new Date().toISOString().slice(0, 10)
    return day.is_active && day.date_from <= today && today <= day.date_to
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Manage</p>
          <h1 className="font-serif font-bold text-light text-3xl">Special Days</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="admin-btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Day'}
        </button>
      </div>

      <div className="bg-haiq-gold/10 border border-haiq-gold/30 rounded-lg px-5 py-4">
        <p className="text-haiq-gold font-semibold text-sm mb-1">📅 How Special Days Work</p>
        <p className="text-light/50 text-xs leading-relaxed">
          On active special days, <strong className="text-haiq-gold">The Unboxing</strong> box is available at{' '}
          <strong className="text-haiq-gold">UGX 40,000</strong>. On all other days the off-peak price of{' '}
          <strong className="text-haiq-gold">UGX 80,000</strong> applies automatically.
        </p>
      </div>

      {showForm && (
        <div className="admin-card border-primary/30">
          <h2 className="font-serif font-bold text-light mb-4">New Special Day</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">Label</label>
              <input value={form.label} onChange={upd('label')}
                placeholder="e.g. Valentine's Day 2026" required className="admin-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">From</label>
                <input type="date" value={form.date_from} onChange={upd('date_from')} required className="admin-input" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">To</label>
                <input type="date" value={form.date_to} onChange={upd('date_to')} required className="admin-input" />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={saving} className="admin-btn-primary w-full py-3">
              {saving ? 'Saving…' : 'Save Special Day'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array(3).fill(null).map((_, i) => (
          <div key={i} className="h-16 skeleton-dark rounded-lg" />
        )) : days.length === 0 ? (
          <div className="admin-card text-center text-light/30 py-10 text-sm">
            No special days yet. Add one to activate box pricing.
          </div>
        ) : days.map(day => {
          const active = isToday(day)
          return (
            <div key={day.id}
              className={`admin-card flex items-center justify-between gap-4 flex-wrap ${active ? 'border-haiq-gold/40' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-light font-semibold">{day.label}</p>
                  {active && (
                    <span className="status-badge bg-haiq-gold/15 text-haiq-gold text-[9px]">🟡 Active Now</span>
                  )}
                  {!day.is_active && (
                    <span className="status-badge bg-gray-500/15 text-gray-400 text-[9px]">Disabled</span>
                  )}
                </div>
                <p className="text-light/40 text-xs">{day.date_from} → {day.date_to}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(day.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${day.is_active ? 'bg-primary' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-light transition-all duration-200 ${day.is_active ? 'left-5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => del(day.id)}
                  className="text-red-400/50 hover:text-red-400 text-xs transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
