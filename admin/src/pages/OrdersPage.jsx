import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import adminApi from '../services/adminApi'

const ORDER_STATUSES = ['pending','freshly_kneaded','ovenbound','on_the_cart','en_route','delivered','cancelled']
const STATUS_NEXT = {
  pending:         ['freshly_kneaded', 'cancelled'],
  freshly_kneaded: ['ovenbound', 'cancelled'],
  ovenbound:       ['on_the_cart', 'cancelled'],
  on_the_cart:     ['en_route', 'cancelled'],
  en_route:        ['delivered'],
  delivered:       [],
  cancelled:       [],
}

const STATUS_COLORS = {
  pending:         '#E8C88A',
  freshly_kneaded: '#60a5fa',
  ovenbound:       '#fb923c',
  on_the_cart:     '#a78bfa',
  en_route:        '#D4A574',
  delivered:       '#4ade80',
  cancelled:       '#f87171',
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#8C7355'
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block"
      style={{ color, background: `${color}18` }}>
      {status?.replace(/_/g,' ')}
    </span>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)

  // Filters
  const [search,    setSearch]    = useState('')
  const [statusF,   setStatusF]   = useState('')
  const [payF,      setPayF]      = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')

  // Inline status update
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (search)   params.set('search',         search)
    if (statusF)  params.set('status',         statusF)
    if (payF)     params.set('payment_status', payF)
    if (dateFrom) params.set('date_from',      dateFrom)
    if (dateTo)   params.set('date_to',        dateTo)

    adminApi.get(`/admin/orders?${params}`)
      .then(r => { setOrders(r.data.orders || []); setTotal(r.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, statusF, payF])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load() }

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await adminApi.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed.')
    } finally { setUpdatingId(null) }
  }

  const inputSty = {
    background: '#1A0A00',
    border:     '1px solid rgba(184,117,42,0.2)',
    color:      '#F2EAD8',
    fontSize:   '12px',
    padding:    '8px 12px',
  }
  const selSty = { ...inputSty, cursor: 'pointer' }

  return (
    <div className="space-y-5 max-w-[1300px]">

      {/* Filter bar — HAIQ-styled */}
      <div className="p-4 md:p-5 space-y-3" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: '#8C7355' }}>Filters</p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, or order number…"
            className="flex-1 focus:outline-none"
            style={{ ...inputSty, borderColor: search ? '#B8752A' : 'rgba(184,117,42,0.2)' }}
          />
          <button type="submit"
            className="px-4 py-2 font-bold text-[11px] tracking-wider uppercase"
            style={{ background: '#B8752A', color: '#1A0A00' }}>
            Search
          </button>
          {(search || statusF || payF || dateFrom || dateTo) && (
            <button type="button"
              onClick={() => { setSearch(''); setStatusF(''); setPayF(''); setDateFrom(''); setDateTo(''); setPage(1); setTimeout(load, 0) }}
              className="px-4 py-2 text-[11px] tracking-wider"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#8C7355' }}>
              Clear
            </button>
          )}
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
            className="focus:outline-none" style={selSty}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
            ))}
          </select>

          <select value={payF} onChange={e => { setPayF(e.target.value); setPage(1) }}
            className="focus:outline-none" style={selSty}>
            <option value="">All Payments</option>
            {['unpaid','pending','paid','failed','refunded'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="focus:outline-none" style={selSty} />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="focus:outline-none" style={selSty} />
        </div>

        <p className="text-[10px]" style={{ color: '#8C7355' }}>
          {total.toLocaleString()} order{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
                {['Order','Customer','Total','Payment','Status','Update Status',''].map(h => (
                  <th key={h} className="px-3 md:px-4 py-3 text-left text-[9px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(null).map((_,i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                  {Array(7).fill(null).map((__,j) => (
                    <td key={j} className="px-4 py-4"><div className="h-2.5 rounded skeleton" style={{ background: '#3D2000', width: '75%' }} /></td>
                  ))}
                </tr>
              )) : orders.map(o => {
                const nextStatuses = STATUS_NEXT[o.status] || []
                const isUpdating   = updatingId === o.id
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
                      <p className="text-[10px] mt-0.5" style={{ color: '#8C7355' }}>
                        {new Date(o.created_at).toLocaleDateString('en-UG', { day:'numeric', month:'short' })}
                      </p>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: '#F2EAD8' }}>{o.first_name} {o.last_name}</p>
                      <p className="text-[10px] truncate max-w-[120px]" style={{ color: '#8C7355' }}>{o.email}</p>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-xs font-medium tabular-nums" style={{ color: '#F2EAD8' }}>
                      {Number(o.total).toLocaleString()}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: o.payment_status === 'paid' ? '#4ade80' : '#E8C88A' }}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      {nextStatuses.length > 0 ? (
                        <select
                          disabled={isUpdating}
                          defaultValue=""
                          onChange={e => { if (e.target.value) updateStatus(o.id, e.target.value) }}
                          className="focus:outline-none disabled:opacity-50"
                          style={{
                            background: '#1A0A00',
                            border:     '1px solid rgba(184,117,42,0.3)',
                            color:      '#B8752A',
                            fontSize:   '10px',
                            padding:    '5px 8px',
                            cursor:     'pointer',
                          }}
                        >
                          <option value="" disabled>{isUpdating ? 'Updating…' : 'Move to…'}</option>
                          {nextStatuses.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[10px]" style={{ color: '#8C7355' }}>—</span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <button onClick={() => navigate(`/orders/${o.id}`)}
                        className="text-[10px] hover:underline"
                        style={{ color: '#B8752A' }}>
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p-1)}
              className="text-xs font-semibold px-3 py-1.5 disabled:opacity-30 transition"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#B8752A' }}>
              ← Prev
            </button>
            <p className="text-xs" style={{ color: '#8C7355' }}>
              Page {page} of {Math.ceil(total / 20)}
            </p>
            <button disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p+1)}
              className="text-xs font-semibold px-3 py-1.5 disabled:opacity-30 transition"
              style={{ border: '1px solid rgba(184,117,42,0.3)', color: '#B8752A' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
