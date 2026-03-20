// DashboardPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'
import { Link } from 'react-router-dom'

const STATUS_STYLE = {
  pending:        { label: 'Pending',          bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  freshly_kneaded:{ label: 'Freshly Kneaded',  bg: 'bg-orange-500/15', text: 'text-orange-400' },
  ovenbound:      { label: 'Ovenbound',         bg: 'bg-red-500/15',    text: 'text-red-400'    },
  on_the_cart:    { label: 'On The Cart',       bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  en_route:       { label: 'En Route',          bg: 'bg-purple-500/15', text: 'text-purple-400' },
  delivered:      { label: 'Delivered',         bg: 'bg-green-500/15',  text: 'text-green-400'  },
  cancelled:      { label: 'Cancelled',         bg: 'bg-gray-500/15',   text: 'text-gray-400'   },
}

function StatCard({ label, value, sub, color = 'text-primary' }) {
  return (
    <div className="admin-card">
      <p className="text-light/40 text-[10px] uppercase tracking-[0.25em] mb-2">{label}</p>
      <p className={`font-serif font-bold text-3xl ${color}`}>{value}</p>
      {sub && <p className="text-light/30 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [summary,      setSummary]      = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts,  setTopProducts]  = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/analytics/summary'),
      adminApi.get('/admin/orders?limit=5'),
      adminApi.get('/admin/analytics/top-products'),
    ]).then(([s, o, p]) => {
      setSummary(s.data.summary)
      setRecentOrders(o.data.orders || [])
      setTopProducts(p.data.products || [])
    }).catch(console.error)
      .finally(() => setLoadingStats(false))
  }, [])

  const fmt = n => Number(n || 0).toLocaleString()

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Overview</p>
        <h1 className="font-serif font-bold text-light text-3xl">Dashboard</h1>
      </div>

      {/* Summary cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="admin-card h-24 skeleton-dark rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={fmt(summary?.total_orders)}
            sub={`${fmt(summary?.active_orders)} active`}
          />
          <StatCard
            label="Revenue (UGX)"
            value={`${fmt(summary?.total_revenue)}`}
            sub={summary?.weekly_change_pct != null
              ? `${summary.weekly_change_pct >= 0 ? '+' : ''}${summary.weekly_change_pct}% this week`
              : 'vs last week'}
            color={summary?.weekly_change_pct >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatCard
            label="Customers"
            value={fmt(summary?.total_customers)}
          />
          <StatCard
            label="Active Orders"
            value={fmt(summary?.active_orders)}
            color="text-haiq-gold"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <div className="lg:col-span-2 admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-bold text-light text-lg">Recent Orders</h2>
            <Link to="/orders" className="text-primary text-xs hover:text-haiq-gold transition-colors">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-light/30 text-sm text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const st = STATUS_STYLE[order.status] || STATUS_STYLE.pending
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between p-3 bg-ink rounded-lg hover:bg-surface transition-colors group"
                  >
                    <div>
                      <p className="text-light text-sm font-semibold group-hover:text-primary transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-light/40 text-xs mt-0.5">
                        {order.first_name} {order.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`status-badge ${st.bg} ${st.text} mb-1`}>
                        {st.label}
                      </span>
                      <p className="text-light/40 text-xs">
                        UGX {fmt(order.total)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="admin-card">
          <h2 className="font-serif font-bold text-light text-lg mb-5">Top Cookies</h2>
          {topProducts.length === 0 ? (
            <p className="text-light/30 text-sm text-center py-8">No sales data yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-primary/40 font-serif font-bold text-sm w-5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-light text-sm font-medium truncate">{p.name}</p>
                    <p className="text-light/30 text-xs">{fmt(p.units_sold)} units</p>
                  </div>
                  <p className="text-primary text-xs font-bold flex-shrink-0">
                    UGX {fmt(p.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
