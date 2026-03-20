// OrdersPage.jsx
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import adminApi from '../services/adminApi'

const STATUS_STYLE = {
  pending:         { label: 'Pending',         bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  freshly_kneaded: { label: 'Freshly Kneaded', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  ovenbound:       { label: 'Ovenbound',        bg: 'bg-red-500/15',    text: 'text-red-400'    },
  on_the_cart:     { label: 'On The Cart',      bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  en_route:        { label: 'En Route',         bg: 'bg-purple-500/15', text: 'text-purple-400' },
  delivered:       { label: 'Delivered',        bg: 'bg-green-500/15',  text: 'text-green-400'  },
  cancelled:       { label: 'Cancelled',        bg: 'bg-gray-500/15',   text: 'text-gray-400'   },
}
const PAY_STYLE = {
  paid:     { label: 'Paid',     bg: 'bg-green-500/15',  text: 'text-green-400'  },
  unpaid:   { label: 'Unpaid',   bg: 'bg-red-500/15',    text: 'text-red-400'    },
  pending:  { label: 'Pending',  bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  failed:   { label: 'Failed',   bg: 'bg-red-700/15',    text: 'text-red-500'    },
  refunded: { label: 'Refunded', bg: 'bg-gray-500/15',   text: 'text-gray-400'   },
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)

  // Filters
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('')
  const [payFilter,      setPayFilter]      = useState('')
  const [methodFilter,   setMethodFilter]   = useState('')

  const LIMIT = 20

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: LIMIT })
    if (search)       params.set('search',         search)
    if (statusFilter) params.set('status',          statusFilter)
    if (payFilter)    params.set('payment_status',  payFilter)
    if (methodFilter) params.set('payment_method',  methodFilter)

    adminApi.get(`/admin/orders?${params}`)
      .then(res => {
        setOrders(res.data.orders || [])
        setTotal(res.data.pagination?.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, payFilter, methodFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const fmt    = n => Number(n || 0).toLocaleString()
  const pages  = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Manage</p>
          <h1 className="font-serif font-bold text-light text-3xl">Orders</h1>
        </div>
        <p className="text-light/40 text-sm mt-2">{total} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, email, order #…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="admin-input w-64"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="admin-input w-44">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1) }}
          className="admin-input w-40">
          <option value="">All Payments</option>
          {Object.entries(PAY_STYLE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1) }}
          className="admin-input w-40">
          <option value="">All Methods</option>
          <option value="mtn_momo">MTN MoMo</option>
          <option value="airtel">Airtel Money</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-light/40 text-[10px] uppercase tracking-widest">
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Method</th>
                <th className="text-left px-5 py-3">Payment</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(null).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array(8).fill(null).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-3 skeleton-dark rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-light/30 py-12 text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : orders.map(order => {
                const st  = STATUS_STYLE[order.status]  || STATUS_STYLE.pending
                const pay = PAY_STYLE[order.payment_status] || PAY_STYLE.unpaid
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-light/70">{order.order_number}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-light font-medium">{order.first_name} {order.last_name}</p>
                      <p className="text-light/30 text-xs">{order.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-light/50">{order.items_count}</td>
                    <td className="px-5 py-3.5 text-primary font-semibold">UGX {fmt(order.total)}</td>
                    <td className="px-5 py-3.5 text-light/50 text-xs capitalize">
                      {order.payment_method?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`status-badge ${pay.bg} ${pay.text}`}>{pay.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`status-badge ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-light/30 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-UG', { timeZone: 'Africa/Kampala' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary text-xs hover:text-haiq-gold transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="admin-btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-light/40 text-xs">{page} / {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
            className="admin-btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
