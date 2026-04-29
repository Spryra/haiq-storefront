import { useState, useEffect } from 'react'
import adminApi from '../services/adminApi'
import Button from '../components/shared/Button'

export default function SpecialDaysPage() {
  const [days,      setDays]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [label,     setLabel]     = useState('')
  const [adding,    setAdding]    = useState(false)
  const [err,       setErr]       = useState(null)

  const load = () => {
    adminApi.get('/admin/special-days')
      .then(r => setDays(r.data.days || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!dateFrom || !dateTo || !label.trim()) { setErr('Date range and label are required.'); return }
    if (new Date(dateTo) < new Date(dateFrom)) { setErr('End date must be on or after start date.'); return }
    setAdding(true); setErr(null)
    try {
      await adminApi.post('/admin/special-days', { label: label.trim(), date_from: dateFrom, date_to: dateTo })
      setDateFrom(''); setDateTo(''); setLabel('')
      load()
    } catch (e) { setErr(e.response?.data?.error || 'Failed.') }
    finally { setAdding(false) }
  }

  const toggle = async (id) => {
    try { await adminApi.patch(`/admin/special-days/${id}/toggle`); load() } catch {}
  }

  const del = async (id) => {
    if (!confirm('Delete this special day?')) return
    try { await adminApi.delete(`/admin/special-days/${id}`); load() } catch {}
  }

  const today = new Date().toISOString().slice(0, 10)
  const inputSty = {
    background: '#1A0A00',
    border:     '1px solid rgba(184,117,42,0.2)',
    color:      '#F2EAD8',
    fontSize:   '13px',
    padding:    '9px 13px',
  }

  return (
    <div className="space-y-5 max-w-[700px]">
      <p className="text-sm leading-relaxed" style={{ color: '#8C7355' }}>
        Special days make Build Your Box available at the discounted price of UGX 40,000.
        Outside of these days it reverts to UGX 80,000.
      </p>

      {/* Add form */}
      <div className="p-5" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#8C7355' }}>
          Add Special Day
        </p>
        <div className="flex gap-3 flex-wrap">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="focus:outline-none" style={{ ...inputSty, minWidth: '150px' }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="focus:outline-none" style={{ ...inputSty, minWidth: '150px' }} />
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Valentine's Day" className="flex-1 focus:outline-none min-w-[160px]" style={inputSty} />
          <Button onClick={add} disabled={adding} loading={adding} variant="primary" size="sm">
            Add
          </Button>
        </div>
        {err && <p className="text-red-400 text-xs mt-2">{err}</p>}
      </div>

      {/* Days list */}
      <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 skeleton rounded" style={{ background: '#3D2000' }} />)}
          </div>
        ) : days.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: '#8C7355' }}>No special days configured yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
                {['Date From','Date To','Label','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(d => {
                const isPast = d.date_to < today
                const isToday = today >= d.date_from && today <= d.date_to
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#F2EAD8' }}>{d.date_from}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#F2EAD8' }}>{d.date_to}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: isToday ? '#E8C88A' : '#F2EAD8' }}>
                      {d.label}
                      {isToday && <span className="ml-2 text-[9px] font-bold" style={{ color: '#E8C88A' }}>TODAY</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(d.id)}
                        className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider"
                        style={d.is_active
                          ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
                          : { color: '#8C7355', background: 'rgba(140,115,85,0.1)' }}>
                        {d.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(d.id)} className="text-[10px] hover:opacity-70 transition"
                        style={{ color: '#f87171' }}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
