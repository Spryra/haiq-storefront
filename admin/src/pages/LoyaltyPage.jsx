import { useState, useEffect } from 'react'
import adminApi from '../services/adminApi'
import Crown from '../components/shared/Crown'

const STATUS_STYLES = {
  pending:    { label: 'Pending',        color: '#E8C88A',  bg: 'rgba(232,200,138,0.12)' },
  approved:   { label: 'Approved',       color: '#4ade80',  bg: 'rgba(74,222,128,0.1)'   },
  rejected:   { label: 'Rejected',       color: '#f87171',  bg: 'rgba(239,68,68,0.1)'    },
  dispatched: { label: 'Dispatched',     color: '#60a5fa',  bg: 'rgba(96,165,250,0.1)'   },
  delivered:  { label: 'Delivered',      color: '#4ade80',  bg: 'rgba(74,222,128,0.1)'   },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { label: status, color: '#8C7355', bg: 'rgba(140,115,85,0.1)' }
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

// ── Review modal ──────────────────────────────────────────────────────────────
function ReviewModal({ card, onClose, onDone }) {
  const [action,     setAction]     = useState('')
  const [cardNumber, setCardNumber] = useState(`HAIQ-${Date.now().toString(36).toUpperCase()}`)
  const [notes,      setNotes]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState(null)

  const submit = async () => {
    if (!action) { setError('Select an action.'); return }
    setSaving(true); setError(null)
    try {
      await adminApi.patch(`/admin/loyalty/${card.id}`, { action, card_number: cardNumber, admin_notes: notes })
      onDone(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed.')
    } finally { setSaving(false) }
  }

  const inputSty = {
    background: '#0E0600',
    border:     '1px solid rgba(184,117,42,0.2)',
    color:      '#F2EAD8',
    fontSize:   '13px',
    padding:    '10px 14px',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>

        <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(184,117,42,0.2)' }}>
          <Crown size={14} color="#B8752A" />
          <h2 className="font-serif font-bold text-lg" style={{ color: '#F2EAD8' }}>Review Application</h2>
          <button onClick={onClose} className="ml-auto text-xl hover:opacity-60 transition" style={{ color: '#8C7355' }}>✕</button>
        </div>

        <div className="p-6 space-y-5">

          {/* Customer info */}
          <div className="p-4" style={{ background: '#1A0A00', border: '1px solid rgba(61,32,0,0.8)' }}>
            <p className="font-bold text-sm mb-1" style={{ color: '#F2EAD8' }}>{card.full_name}</p>
            <p className="text-xs mb-0.5" style={{ color: '#8C7355' }}>{card.email}</p>
            <p className="text-xs mb-3" style={{ color: '#8C7355' }}>{card.phone}</p>

            <div style={{ borderTop: '1px solid rgba(61,32,0,0.8)', paddingTop: '12px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#8C7355' }}>
                Card Delivery Address
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(242,234,216,0.7)' }}>
                {card.delivery_address}
              </p>
            </div>

            {card.contact_phone && (
              <div style={{ borderTop: '1px solid rgba(61,32,0,0.8)', paddingTop: '12px', marginTop: '12px' }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#8C7355' }}>
                  Phone for Delivery
                </p>
                <p className="text-sm" style={{ color: 'rgba(242,234,216,0.7)' }}>{card.contact_phone}</p>
              </div>
            )}
          </div>

          {/* Action selection */}
          <div className="grid grid-cols-2 gap-2">
            {['approve', 'reject'].map(a => (
              <button key={a} onClick={() => setAction(a)}
                className="py-3 text-xs font-bold uppercase tracking-wider transition border"
                style={{
                  background: action === a
                    ? (a === 'approve' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)')
                    : 'transparent',
                  borderColor: action === a
                    ? (a === 'approve' ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)')
                    : 'rgba(184,117,42,0.2)',
                  color: action === a
                    ? (a === 'approve' ? '#4ade80' : '#f87171')
                    : '#8C7355',
                }}>
                {a === 'approve' ? 'Approve' : 'Reject'}
              </button>
            ))}
          </div>

          {/* Card number — shown only for approve */}
          {action === 'approve' && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C7355' }}>
                Assign Card Number
              </label>
              <input value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                className="w-full focus:outline-none font-mono" style={inputSty} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C7355' }}>
              Internal Notes (optional)
            </label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full focus:outline-none resize-none" style={{ ...inputSty, padding: '10px 14px' }} />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
          <button onClick={onClose} className="text-sm hover:opacity-60 transition" style={{ color: '#8C7355' }}>Cancel</button>
          <button onClick={submit} disabled={saving || !action}
            className="px-5 py-2.5 font-bold text-[11px] tracking-wider uppercase disabled:opacity-50"
            style={{ background: '#B8752A', color: '#1A0A00' }}>
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cards table ───────────────────────────────────────────────────────────────
function CardsTable({ cards, loading, onReview, onDispatch, onDeliver }) {
  if (!loading && cards.length === 0) return (
    <div className="py-14 text-center" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
      <Crown size={22} color="#B8752A" className="mx-auto mb-3 opacity-25" />
      <p className="text-sm" style={{ color: '#8C7355' }}>No cards in this category.</p>
    </div>
  )

  return (
    <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
              {['Customer','Email','Delivery Address','Card No.','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(3).fill(null).map((_,i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                    {Array(6).fill(null).map((__,j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-2.5 rounded skeleton" style={{ background: '#3D2000', width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : cards.map(c => (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,117,42,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium" style={{ color: '#F2EAD8' }}>{c.full_name}</p>
                      <p className="text-[10px]" style={{ color: '#8C7355' }}>{c.contact_phone || '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-[10px] max-w-[140px] truncate" style={{ color: '#8C7355' }}>{c.email}</td>
                    <td className="px-4 py-4 text-xs max-w-[180px]">
                      <p className="truncate" style={{ color: 'rgba(242,234,216,0.6)' }}>{c.delivery_address}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-[10px]" style={{ color: '#E8C88A' }}>{c.card_number || '—'}</td>
                    <td className="px-4 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {c.status === 'pending'    && <button onClick={() => onReview(c)}   className="text-[10px] hover:underline font-medium" style={{ color: '#E8C88A' }}>Review</button>}
                        {c.status === 'approved'   && <button onClick={() => onDispatch(c)} className="text-[10px] hover:underline font-medium" style={{ color: '#60a5fa' }}>Mark Dispatched</button>}
                        {c.status === 'dispatched' && <button onClick={() => onDeliver(c)}  className="text-[10px] hover:underline font-medium" style={{ color: '#4ade80' }}>Mark Delivered</button>}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'pending',    label: 'Pending'        },
  { key: 'approved',   label: 'Dispatch Queue' },
  { key: 'all',        label: 'All Cards'      },
]

export default function LoyaltyPage() {
  const [tab,         setTab]         = useState('pending')
  const [cards,       setCards]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [reviewModal, setReviewModal] = useState(null)

  const load = () => {
    setLoading(true)
    const q = tab === 'all' ? '' : `?status=${tab}`
    adminApi.get(`/admin/loyalty${q}`)
      .then(r => setCards(r.data.cards || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  const doAction = async (cardId, action) => {
    try {
      await adminApi.patch(`/admin/loyalty/${cardId}`, { action })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.')
    }
  }

  return (
    <div className="space-y-5 max-w-[1100px]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Crown size={16} color="#B8752A" />
        <h1 className="font-serif font-bold text-xl" style={{ color: '#F2EAD8' }}>Loyalty Cards</h1>
        <span className="ml-auto text-[10px] px-2 py-0.5" style={{ color: '#8C7355', background: 'rgba(140,115,85,0.1)' }}>
          Physical card — one per customer
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 w-fit" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-semibold transition"
            style={{ background: tab===t.key ? '#B8752A' : 'transparent', color: tab===t.key ? '#1A0A00' : 'rgba(242,234,216,0.45)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <CardsTable
        cards={cards}
        loading={loading}
        onReview={c => setReviewModal(c)}
        onDispatch={c => doAction(c.id, 'dispatch')}
        onDeliver={c => doAction(c.id, 'deliver')}
      />

      {reviewModal && (
        <ReviewModal
          card={reviewModal}
          onClose={() => setReviewModal(null)}
          onDone={load}
        />
      )}
    </div>
  )
}
