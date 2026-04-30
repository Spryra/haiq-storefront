import { useState, useEffect } from 'react'
import adminApi from '../services/adminApi'

export default function DeliveryZonesPage() {
  const [zones,   setZones]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)   // null | 'new' | zone-object
  const [form,    setForm]    = useState({ name: '', price: '', sort_order: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/delivery-zones')
      .then(r => setZones(r.data.zones || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({ name: '', price: '', sort_order: zones.length + 1 })
    setErr(null)
    setModal('new')
  }
  const openEdit = (z) => {
    setForm({ name: z.name, price: z.price, sort_order: z.sort_order })
    setErr(null)
    setModal(z)
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) { setErr('Name and price are required.'); return }
    setSaving(true); setErr(null)
    try {
      if (modal === 'new') {
        await adminApi.post('/admin/delivery-zones', {
          name: form.name.trim(),
          price: parseFloat(form.price),
          sort_order: parseInt(form.sort_order) || 99,
        })
      } else {
        await adminApi.put(`/admin/delivery-zones/${modal.id}`, {
          name: form.name.trim(),
          price: parseFloat(form.price),
          sort_order: parseInt(form.sort_order) || modal.sort_order,
        })
      }
      load(); setModal(null)
    } catch (e) { setErr(e.response?.data?.error || 'Failed.') }
    finally { setSaving(false) }
  }

  const toggle = async (z) => {
    try {
      await adminApi.put(`/admin/delivery-zones/${z.id}`, { is_active: !z.is_active })
      load()
    } catch {}
  }

  const del = async (z) => {
    if (!confirm(`Delete zone "${z.name}"? This cannot be undone.`)) return
    try { await adminApi.delete(`/admin/delivery-zones/${z.id}`); load() } catch {}
  }

  const inputSty = {
    background: '#1A0A00', border: '1px solid rgba(184,117,42,0.2)',
    color: '#F2EAD8', fontSize: '13px', padding: '9px 13px',
    width: '100%', outline: 'none',
  }

  return (
    <div className="space-y-5 max-w-[760px]">
      <div className="flex items-center justify-between">
        <p className="text-sm leading-relaxed" style={{ color: '#8C7355' }}>
          Set delivery fees per area. Customers select their zone at checkout —
          the fee is added to their order total automatically.
        </p>
        <button onClick={openNew}
          className="px-4 py-2 font-bold text-[11px] tracking-wider uppercase ml-4 flex-shrink-0"
          style={{ background: '#B8752A', color: '#1A0A00' }}>
          + Add Zone
        </button>
      </div>

      <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 rounded" style={{ background: '#3D2000' }} />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: '#8C7355' }}>No zones configured.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
                {['#', 'Zone Name', 'Delivery Fee (UGX)', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold uppercase
                    tracking-wider" style={{ color: '#8C7355' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#8C7355' }}>
                    {z.sort_order}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#F2EAD8' }}>{z.name}</td>
                  <td className="px-4 py-3 text-xs font-bold" style={{ color: '#B8752A' }}>
                    {Number(z.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(z)}
                      className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider"
                      style={z.is_active
                        ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
                        : { color: '#8C7355', background: 'rgba(140,115,85,0.1)' }}>
                      {z.is_active ? '● Active' : '○ Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => openEdit(z)}
                      className="text-[10px] hover:underline" style={{ color: '#B8752A' }}>Edit</button>
                    <button onClick={() => del(z)}
                      className="text-[10px] hover:underline" style={{ color: '#f87171' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm mx-4 p-6"
            style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-5"
              style={{ color: '#8C7355' }}>
              {modal === 'new' ? 'Add Zone' : 'Edit Zone'}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Zone Name</p>
                <input style={inputSty} value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="e.g. Kololo / Naguru / Ntinda" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Delivery Fee (UGX)</p>
                <input type="number" style={inputSty} value={form.price}
                  onChange={e => setForm(f => ({...f, price: e.target.value}))}
                  placeholder="5000" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Sort Order (display position)</p>
                <input type="number" style={inputSty} value={form.sort_order}
                  onChange={e => setForm(f => ({...f, sort_order: e.target.value}))}
                  placeholder="1" />
              </div>
            </div>
            {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="text-sm hover:opacity-60" style={{ color: '#8C7355' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 font-bold text-[11px] tracking-wider uppercase disabled:opacity-50"
                style={{ background: '#B8752A', color: '#1A0A00' }}>
                {saving ? 'Saving…' : 'Save Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
