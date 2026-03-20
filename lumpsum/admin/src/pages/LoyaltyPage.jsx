// LoyaltyPage.jsx — aligned with admin.loyalty.routes.js
// Backend: PATCH /admin/loyalty/:id  { action: 'approve'|'reject'|'dispatch'|'deliver' }
// Backend returns: { cards: [...] } with fields: full_name, email, loyalty_points, tier
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'

const STATUS_STYLE = {
  pending:    { label: 'Under Review', bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  approved:   { label: 'Approved',     bg: 'bg-green-500/15',  text: 'text-green-400'  },
  rejected:   { label: 'Not Approved', bg: 'bg-red-500/15',    text: 'text-red-400'    },
  dispatched: { label: 'Dispatched',   bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  delivered:  { label: 'Delivered',    bg: 'bg-green-700/15',  text: 'text-green-300'  },
}
const TIER_COLOR = { Crown: '#E8C88A', Reserve: '#B8752A', Classic: '#8C7355' }
const NEXT_ACTION = {
  pending:    [{ action: 'approve', label: 'Approve' }, { action: 'reject', label: 'Reject', danger: true }],
  approved:   [{ action: 'dispatch', label: 'Mark Dispatched' }],
  dispatched: [{ action: 'deliver',  label: 'Mark Delivered'  }],
  delivered:  [],
  rejected:   [],
}

export default function LoyaltyPage() {
  const [cards,    setCards]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter,   setFilter]   = useState('pending')

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/loyalty')
      .then(res => setCards(res.data.cards || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const doAction = async (id, action) => {
    setUpdating(id)
    try {
      await adminApi.patch(`/admin/loyalty/${id}`, { action })
      load()
    } catch (e) { console.error(e) }
    finally { setUpdating(null) }
  }

  const visible = filter === 'all' ? cards : cards.filter(c => c.status === filter)
  const pending = cards.filter(c => c.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Manage</p>
        <h1 className="font-serif font-bold text-light text-3xl">Loyalty Cards</h1>
      </div>

      {pending > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-5 py-3 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">⚠</span>
          <p className="text-yellow-300 text-sm">
            <strong>{pending}</strong> card application{pending > 1 ? 's' : ''} awaiting review.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'dispatched', 'delivered', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors ${
              filter === f ? 'bg-primary text-dark' : 'border border-border text-light/40 hover:text-light'
            }`}
          >
            {f === 'all' ? 'All' : (STATUS_STYLE[f]?.label ?? f)}
            {f === 'pending' && pending > 0 && (
              <span className="ml-2 bg-yellow-400 text-dark rounded-full px-1.5 py-0.5 text-[9px]">{pending}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? Array(4).fill(null).map((_, i) => (
          <div key={i} className="h-24 skeleton-dark rounded-lg" />
        )) : visible.length === 0 ? (
          <div className="admin-card text-center text-light/30 py-10 text-sm">No cards in this category.</div>
        ) : visible.map(card => {
          const st = STATUS_STYLE[card.status] || STATUS_STYLE.pending
          const tc = TIER_COLOR[card.tier] || '#8C7355'
          const actions = NEXT_ACTION[card.status] || []
          return (
            <div key={card.id} className="admin-card">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-light font-semibold">{card.full_name || card.email}</p>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ color: tc, backgroundColor: `${tc}20` }}>{card.tier}</span>
                    <span className={`status-badge ${st.bg} ${st.text}`}>{st.label}</span>
                  </div>
                  <p className="text-light/30 text-xs">{card.email}</p>
                  <p className="text-light/50 text-xs">📍 {card.delivery_address}</p>
                  {card.card_number && <p className="text-primary text-xs font-mono">Card: {card.card_number}</p>}
                  <p className="text-haiq-gold text-xs">{(card.loyalty_points || 0).toLocaleString()} pts</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map(({ action, label, danger }) => (
                    <button key={action} onClick={() => doAction(card.id, action)}
                      disabled={updating === card.id}
                      className={danger
                        ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-40'
                        : 'admin-btn-primary px-4 py-1.5 text-[10px] disabled:opacity-40'
                      }
                    >
                      {updating === card.id ? '…' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
