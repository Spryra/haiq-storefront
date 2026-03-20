// OrderDetailPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import adminApi from '../services/adminApi'

const STATUS_LABELS = {
  pending:         'Pending',
  freshly_kneaded: 'Freshly Kneaded 🍪',
  ovenbound:       'Ovenbound 🔥',
  on_the_cart:     'On The Cart 🛒',
  en_route:        'En Route 🚴',
  delivered:       'Delivered Delight 🎉',
  cancelled:       'Cancelled',
}
const STATUS_TRANSITIONS = {
  pending:         ['freshly_kneaded', 'cancelled'],
  freshly_kneaded: ['ovenbound',       'cancelled'],
  ovenbound:       ['on_the_cart',     'cancelled'],
  on_the_cart:     ['en_route'],
  en_route:        ['delivered'],
  delivered:       [],
  cancelled:       [],
}

export default function OrderDetailPage() {
  const { id }       = useParams()
  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [newStatus,  setNewStatus]  = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updating,   setUpdating]   = useState(false)
  const [msgBody,    setMsgBody]    = useState('')
  const [sending,    setSending]    = useState(false)
  const [error,      setError]      = useState(null)
  const [success,    setSuccess]    = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get(`/admin/orders/${id}`)
      .then(res => { setOrder(res.data.order); setNewStatus('') })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const updateStatus = async () => {
    if (!newStatus) return
    setUpdating(true); setError(null); setSuccess(null)
    try {
      await adminApi.patch(`/admin/orders/${id}/status`, { status: newStatus, note: statusNote })
      setSuccess(`Status updated to "${STATUS_LABELS[newStatus]}"`)
      setStatusNote('')
      load()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Update failed')
    } finally { setUpdating(false) }
  }

  const sendMessage = async () => {
    if (!msgBody.trim()) return
    setSending(true); setError(null)
    try {
      await adminApi.post(`/admin/orders/${id}/messages`, { body: msgBody })
      setMsgBody('')
      load()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Send failed')
    } finally { setSending(false) }
  }

  const fmt = n => Number(n || 0).toLocaleString()

  if (loading) return (
    <div className="space-y-4">
      {Array(4).fill(null).map((_, i) => (
        <div key={i} className="h-24 skeleton-dark rounded-lg" />
      ))}
    </div>
  )

  if (!order) return (
    <div className="text-center py-20 text-light/30">Order not found.</div>
  )

  const allowed = STATUS_TRANSITIONS[order.status] || []

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Back + header */}
      <div>
        <Link to="/orders" className="text-primary/60 text-xs hover:text-primary transition-colors">
          ← Back to Orders
        </Link>
        <div className="flex items-start justify-between mt-3 flex-wrap gap-3">
          <div>
            <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">
              {order.order_number}
            </p>
            <h1 className="font-serif font-bold text-light text-2xl">
              {order.first_name} {order.last_name}
            </h1>
            <p className="text-light/40 text-sm">{order.email} · {order.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-haiq-gold font-bold text-xl font-serif">UGX {fmt(order.total)}</p>
            <p className="text-light/30 text-xs mt-0.5 capitalize">
              {order.payment_method?.replace('_', ' ')} · {order.payment_status}
            </p>
          </div>
        </div>
      </div>

      {error   && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Order items */}
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-light font-medium">{item.product_name}</p>
                  <p className="text-light/30 text-xs">{item.variant_label} × {item.quantity}</p>
                </div>
                <p className="text-primary font-bold">UGX {fmt(item.line_total)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-light/50">
              <span>Subtotal</span><span>UGX {fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-light/50">
              <span>Delivery</span><span>UGX {fmt(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-light font-bold mt-2 pt-2 border-t border-border">
              <span>Total</span><span className="text-haiq-gold">UGX {fmt(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light mb-4">Delivery</h2>
          <p className="text-light/60 text-sm leading-relaxed">{order.delivery_address}</p>
          {order.delivery_note && (
            <p className="text-light/40 text-xs mt-2">Note: {order.delivery_note}</p>
          )}
          {order.gift_note && (
            <div className="mt-3 bg-primary/10 border border-primary/20 p-3 rounded">
              <p className="text-primary text-[10px] uppercase tracking-wider mb-1">Gift Note</p>
              <p className="text-light/70 text-sm italic">"{order.gift_note}"</p>
            </div>
          )}
        </div>

        {/* Status update */}
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light mb-4">Update Status</h2>
          <p className="text-light/40 text-xs mb-3">
            Current: <span className="text-primary font-semibold">{STATUS_LABELS[order.status]}</span>
          </p>
          {allowed.length === 0 ? (
            <p className="text-light/30 text-sm">No further transitions available.</p>
          ) : (
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="admin-input"
              >
                <option value="">Select new status…</option>
                {allowed.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Internal note (optional)"
                rows={2}
                className="admin-input resize-none"
              />
              <button
                onClick={updateStatus}
                disabled={!newStatus || updating}
                className="admin-btn-primary w-full py-2.5 disabled:opacity-40"
              >
                {updating ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          )}
        </div>

        {/* Payment records */}
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light mb-4">Payments</h2>
          {order.payments?.length === 0 ? (
            <p className="text-light/30 text-sm">No payment records.</p>
          ) : (
            <div className="space-y-3">
              {order.payments?.map(p => (
                <div key={p.id} className="bg-ink rounded p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-light/60 capitalize">{p.payment_method?.replace('_', ' ')}</span>
                    <span className={`font-bold ${p.status === 'successful' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-primary font-bold">UGX {fmt(p.amount)}</p>
                  {p.provider_ref && (
                    <p className="text-light/30 text-xs mt-1 font-mono">Ref: {p.provider_ref}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="admin-card">
        <h2 className="font-serif font-bold text-light mb-4">Message Thread</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide mb-4">
          {(!order.messages || order.messages.length === 0) ? (
            <p className="text-light/30 text-sm">No messages yet.</p>
          ) : order.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender_type === 'admin'
                    ? 'bg-primary text-dark'
                    : 'bg-surface text-light'
                }`}
              >
                <p>{msg.body}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.sender_type === 'admin' ? 'text-dark/60' : 'text-light/30'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-UG', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kampala'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <textarea
            value={msgBody}
            onChange={e => setMsgBody(e.target.value)}
            placeholder="Reply to customer…"
            rows={2}
            className="admin-input flex-1 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!msgBody.trim() || sending}
            className="admin-btn-primary px-5 disabled:opacity-40 self-end"
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>

      {/* Event timeline */}
      {order.events?.length > 0 && (
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light mb-4">Event Timeline</h2>
          <div className="space-y-2">
            {order.events.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 text-xs">
                <span className="text-primary/40 flex-shrink-0 mt-0.5">
                  {new Date(ev.created_at).toLocaleString('en-UG', { timeZone: 'Africa/Kampala' })}
                </span>
                <span className="text-light/50 capitalize">
                  {ev.event_type.replace('_', ' ')}
                  {ev.old_value && ev.new_value && (
                    <> · <span className="text-light/30">{ev.old_value}</span> → <span className="text-primary">{ev.new_value}</span></>
                  )}
                  {ev.note && <> · <span className="italic text-light/30">"{ev.note}"</span></>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
