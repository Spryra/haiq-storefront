import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../services/adminApi'

const ORDER_STATUSES = ['pending','en_route','delivered','cancelled']
const STATUS_NEXT = {
  pending:   ['en_route', 'cancelled'],
  en_route:  ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}
const STATUS_COLORS = {
  pending:   '#E8C88A',
  en_route:  '#D4A574',
  delivered: '#4ade80',
  cancelled: '#f87171',
}

// Admin cancellation reasons
const CANCEL_REASONS = [
  'Customer unreachable after multiple attempts',
  'Delivery address incomplete or incorrect',
  'Item out of stock',
  'Order placed by mistake (customer request)',
  'Suspected fraudulent order',
  'Kitchen capacity — unable to fulfil today',
  'Other',
]

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#8C7355'
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block"
      style={{ color, background: `${color}18` }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// Cancel modal for admin
function CancelModal({ order, onClose, onDone }) {
  const [selected,  setSelected]  = useState('')
  const [custom,    setCustom]    = useState('')
  const [submitting,setSubmitting]= useState(false)
  const [err,       setErr]       = useState(null)

  const reason = selected === 'Other' ? custom.trim() : selected

  const submit = async () => {
    if (!selected)                      { setErr('Please select a reason.'); return }
    if (selected === 'Other' && !custom.trim()) { setErr('Please describe the reason.'); return }
    setSubmitting(true); setErr(null)
    try {
      await adminApi.post(`/admin/orders/${order.id}/cancel`, { reason })
      onDone(); onClose()
    } catch (e) { setErr(e.response?.data?.error || 'Failed.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(184,117,42,0.2)' }}>
          <h3 className="font-serif font-bold text-sm" style={{ color: '#F2EAD8' }}>Cancel Order</h3>
          <button onClick={onClose} className="text-lg hover:opacity-60" style={{ color: '#8C7355' }}>x</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="px-3 py-2.5" style={{ background: '#1A0A00', border: '1px solid rgba(61,32,0,0.8)' }}>
            <p className="text-[10px]" style={{ color: '#8C7355' }}>Order</p>
            <p className="font-mono font-bold text-sm" style={{ color: '#E8C88A' }}>{order.order_number}</p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#8C7355' }}>
              Reason for Cancellation *
            </label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full px-3 py-2.5 text-sm focus:outline-none appearance-none"
              style={{ background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)', color: selected ? '#F2EAD8' : '#8C7355' }}
            >
              <option value="" disabled>Select a reason...</option>
              {CANCEL_REASONS.map(r => (
                <option key={r} value={r} style={{ background: '#1A0A00', color: '#F2EAD8' }}>{r}</option>
              ))}
            </select>
          </div>

          {selected === 'Other' && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>
                Tell the customer why *
              </label>
              <textarea
                rows={3}
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="Explain the reason in plain terms..."
                className="w-full px-3 py-2.5 text-sm resize-none focus:outline-none"
                style={{ background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)', color: '#F2EAD8' }}
              />
            </div>
          )}

          {err && <p className="text-xs" style={{ color: '#f87171' }}>{err}</p>}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm"
            style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#8C7355' }}>
            Keep Order
          </button>
          <button onClick={submit} disabled={submitting}
            className="flex-1 py-2.5 font-bold text-sm disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
            {submitting ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [search,       setSearch]       = useState('')
  const [statusF,      setStatusF]      = useState('')
  const [payF,         setPayF]         = useState('')
  const [cancelModal,  setCancelModal]  = useState(null)
  const [updatingId,   setUpdatingId]   = useState(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (search)  params.set('search', search)
    if (statusF) params.set('status', statusF)
    if (payF)    params.set('payment_status', payF)
    adminApi.get(`/admin/orders?${params}`)
      .then(r => { setOrders(r.data.orders || []); setTotal(r.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, statusF, payF])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load() }

  const updateStatus = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      setCancelModal(orders.find(o => o.id === orderId))
      return
    }
    setUpdatingId(orderId)
    try {
      await adminApi.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed.')
    } finally { setUpdatingId(null) }
  }

  // Styles for input/select consistent with HAIQ admin palette
  const inputSty = {
    background: '#1A0A00',
    border:     '1px solid rgba(184,117,42,0.25)',
    color:      '#F2EAD8',
    fontSize:   '12px',
    padding:    '8px 12px',
  }
  const selSty = { ...inputSty, cursor: 'pointer' }

  return (
    <div className="space-y-4 max-w-[1300px]">

      {/* Filter card — HAIQ styled */}
      <div className="p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: '#8C7355' }}>
          Search & Filter Orders
        </p>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or order number..."
            className="focus:outline-none flex-1 min-w-[200px]"
            style={{ ...inputSty, borderColor: search ? '#B8752A' : 'rgba(184,117,42,0.25)' }}
          />
          <button type="submit"
            className="px-4 py-2 font-bold text-[11px] tracking-wider uppercase"
            style={{ background: '#B8752A', color: '#1A0A00' }}>
            Search
          </button>
          {(search || statusF || payF) && (
            <button type="button"
              onClick={() => { setSearch(''); setStatusF(''); setPayF(''); setPage(1); setTimeout(load, 0) }}
              className="px-4 py-2 text-[11px] tracking-wider"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#8C7355' }}>
              Clear
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {/* Order Status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#8C7355' }}>Order Status</label>
            <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
              className="focus:outline-none" style={selSty}>
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s} style={{ background: '#1A0A00' }}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Payment Status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#8C7355' }}>Payment Status</label>
            <select value={payF} onChange={e => { setPayF(e.target.value); setPage(1) }}
              className="focus:outline-none" style={selSty}>
              <option value="">All Payments</option>
              {['unpaid','pending','paid','failed','refunded'].map(s => (
                <option key={s} value={s} style={{ background: '#1A0A00' }}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[10px] mt-2" style={{ color: '#8C7355' }}>
          {total.toLocaleString()} order{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Table */}
      <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
                {['Order','Customer','Total','Payment','Status','Update Status',''].map(h => (
                  <th key={h} className="px-3 md:px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#8C7355' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(null).map((_,i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                      {Array(7).fill(null).map((__,j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-2.5 rounded skeleton" style={{ background: '#3D2000', width: '75%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map(o => {
                    const next = STATUS_NEXT[o.status] || []
                    const isUpdating = updatingId === o.id
                    return (
                      <tr key={o.id}
                        style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,117,42,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-3 md:px-4 py-3">
                          <p className="font-mono text-[10px] font-bold cursor-pointer hover:underline"
                            style={{ color: '#E8C88A' }}
                            onClick={() => navigate(`/orders/${o.id}`)}>
                            {o.order_number}
                          </p>
                          <p className="text-[10px]" style={{ color: '#8C7355' }}>
                            {new Date(o.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })}
                          </p>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <p className="text-xs font-medium" style={{ color: '#F2EAD8' }}>{o.first_name} {o.last_name}</p>
                          <p className="text-[10px] truncate max-w-[100px]" style={{ color: '#8C7355' }}>{o.email}</p>
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs font-medium tabular-nums" style={{ color: '#F2EAD8' }}>
                          {Number(o.total).toLocaleString()}
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <span className="text-[9px] font-bold uppercase"
                            style={{ color: o.payment_status === 'paid' ? '#4ade80' : '#E8C88A' }}>
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div>
                            <StatusBadge status={o.status} />
                            {/* Show cancellation reason if cancelled */}
                            {o.status === 'cancelled' && o.cancellation_reason && (
                              <p className="text-[9px] mt-0.5 italic max-w-[120px]" style={{ color: '#8C7355' }}>
                                {o.cancelled_by === 'admin' ? 'Admin: ' : 'Customer: '}
                                {o.cancellation_reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          {next.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] uppercase tracking-wider" style={{ color: '#8C7355' }}>
                                Move to
                              </label>
                              <select
                                disabled={isUpdating}
                                defaultValue=""
                                onChange={e => { if (e.target.value) updateStatus(o.id, e.target.value) }}
                                className="focus:outline-none disabled:opacity-50"
                                style={{
                                  background: '#1A0A00',
                                  border:     '1px solid rgba(184,117,42,0.3)',
                                  color:      '#B8752A',
                                  fontSize:   '11px',
                                  padding:    '5px 8px',
                                  cursor:     'pointer',
                                }}
                              >
                                <option value="" disabled style={{ background: '#1A0A00' }}>
                                  {isUpdating ? 'Updating...' : 'Select status'}
                                </option>
                                {next.map(s => (
                                  <option key={s} value={s} style={{ background: '#1A0A00', color: s === 'cancelled' ? '#f87171' : '#F2EAD8' }}>
                                    {s === 'cancelled' ? '! Cancel order' : s.replace(/_/g, ' ')}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[10px]" style={{ color: '#8C7355' }}>
                              {o.status === 'delivered' ? 'Complete' : o.status === 'cancelled' ? 'Cancelled' : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button onClick={() => navigate(`/orders/${o.id}`)}
                            className="text-[10px] hover:underline" style={{ color: '#B8752A' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p-1)}
              className="text-xs font-semibold px-3 py-1.5 disabled:opacity-30"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#B8752A' }}>
              Previous
            </button>
            <p className="text-xs" style={{ color: '#8C7355' }}>
              Page {page} of {Math.ceil(total / 20)}
            </p>
            <button disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p+1)}
              className="text-xs font-semibold px-3 py-1.5 disabled:opacity-30"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#B8752A' }}>
              Next
            </button>
          </div>
        )}
      </div>

      {cancelModal && (
        <CancelModal
          order={cancelModal}
          onClose={() => setCancelModal(null)}
          onDone={() => { setCancelModal(null); load() }}
        />
      )}
    </div>
  )
}
