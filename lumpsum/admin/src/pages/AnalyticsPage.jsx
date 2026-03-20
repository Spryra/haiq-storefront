// AnalyticsPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'

const TIER_COLOR = { Crown: '#E8C88A', Reserve: '#B8752A', Classic: '#8C7355' }
const PIE_COLORS = ['#B8752A', '#D4A574', '#8C7355', '#7A3B1E']

const fmt    = n => Number(n || 0).toLocaleString()
const fmtDay = s => {
  const d = new Date(s)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function SectionHeader({ label, title }) {
  return (
    <div className="mb-4">
      <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">{label}</p>
      <h2 className="font-serif font-bold text-light text-xl">{title}</h2>
    </div>
  )
}

export default function AnalyticsPage() {
  const [revenue,       setRevenue]       = useState([])
  const [payBreakdown,  setPayBreakdown]  = useState([])
  const [statusBreak,   setStatusBreak]   = useState([])
  const [topCustomers,  setTopCustomers]  = useState([])
  const [topProducts,   setTopProducts]   = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/analytics/revenue'),
      adminApi.get('/admin/analytics/payment-breakdown'),
      adminApi.get('/admin/analytics/orders-by-status'),
      adminApi.get('/admin/analytics/top-customers'),
      adminApi.get('/admin/analytics/top-products'),
    ]).then(([r, p, s, c, prod]) => {
      setRevenue(r.data.data || [])
      setPayBreakdown(p.data.data || [])
      setStatusBreak(s.data.data || [])
      setTopCustomers(c.data.customers || [])
      setTopProducts(prod.data.products || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border px-4 py-2.5 rounded text-xs">
        <p className="text-light/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name === 'revenue' ? `UGX ${fmt(p.value)}` : p.value}
          </p>
        ))}
      </div>
    )
  }

  if (loading) return (
    <div className="space-y-6">
      {Array(3).fill(null).map((_, i) => (
        <div key={i} className="h-48 skeleton-dark rounded-lg" />
      ))}
    </div>
  )

  return (
    <div className="space-y-10">

      {/* Page header */}
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Insights</p>
        <h1 className="font-serif font-bold text-light text-3xl">Analytics</h1>
      </div>

      {/* Revenue chart */}
      <div className="admin-card">
        <SectionHeader label="Last 30 Days" title="Revenue" />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenue} margin={{ left: 0, right: 8 }}>
            <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fill: '#8C7355', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#8C7355', fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={36} />
            <Tooltip content={customTooltip} />
            <Line type="monotone" dataKey="revenue" stroke="#B8752A" strokeWidth={2}
              dot={false} activeDot={{ r: 5, fill: '#B8752A' }} name="revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Payment method breakdown */}
        <div className="admin-card">
          <SectionHeader label="Breakdown" title="Payment Methods" />
          {payBreakdown.length === 0 ? (
            <p className="text-light/30 text-sm py-4">No payment data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={payBreakdown} dataKey="revenue" nameKey="payment_method"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {payBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => <span style={{ color: '#F2EAD8', fontSize: 11 }}>{v?.replace('_', ' ')}</span>}
                />
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status */}
        <div className="admin-card">
          <SectionHeader label="Breakdown" title="Orders by Status" />
          {statusBreak.length === 0 ? (
            <p className="text-light/30 text-sm py-4">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusBreak} margin={{ left: -10 }}>
                <XAxis dataKey="status" tick={{ fill: '#8C7355', fontSize: 9 }}
                  tickLine={false} axisLine={false}
                  tickFormatter={s => s?.replace('_', '\n')} />
                <YAxis tick={{ fill: '#8C7355', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" fill="#B8752A" radius={[3, 3, 0, 0]} name="orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="admin-card">
        <SectionHeader label="Sales" title="Top Cookies" />
        {topProducts.length === 0 ? (
          <p className="text-light/30 text-sm">No sales yet.</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="text-primary/40 font-serif font-bold text-sm w-6 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-light text-sm font-medium">{p.name}</p>
                    <p className="text-primary text-xs font-bold">UGX {fmt(p.revenue)}</p>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (p.units_sold / (topProducts[0]?.units_sold || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-light/30 text-xs mt-1">{fmt(p.units_sold)} units</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TOP CUSTOMERS (admin-only — not visible on frontend) ──────────────── */}
      <div className="admin-card border-l-2 border-haiq-gold/40">
        <div className="flex items-start justify-between mb-4">
          <SectionHeader label="Internal — Admin Only" title="Top Customers" />
          <span className="text-[10px] bg-haiq-gold/10 text-haiq-gold border border-haiq-gold/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
            👑 Hidden from customers
          </span>
        </div>
        <p className="text-light/30 text-xs mb-5 leading-relaxed">
          Use this list to identify loyal customers for gifting or personal outreach.
          This data is never surfaced on the customer-facing website.
        </p>

        {topCustomers.length === 0 ? (
          <p className="text-light/30 text-sm">No customer data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-light/30 text-[10px] uppercase tracking-widest border-b border-border">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Tier</th>
                  <th className="text-left py-2 pr-4">Points</th>
                  <th className="text-left py-2 pr-4">Orders</th>
                  <th className="text-left py-2">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-surface/40 transition-colors">
                    <td className="py-3 pr-4 text-primary/40 font-serif font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 pr-4 text-light font-medium">{c.full_name}</td>
                    <td className="py-3 pr-4 text-light/40 text-xs">{c.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          color:            TIER_COLOR[c.loyalty_tier] || '#8C7355',
                          backgroundColor:  `${TIER_COLOR[c.loyalty_tier] || '#8C7355'}20`,
                        }}
                      >
                        {c.loyalty_tier || 'Classic'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-haiq-gold font-semibold">
                      {fmt(c.loyalty_points)} pts
                    </td>
                    <td className="py-3 pr-4 text-light/50">{c.total_orders}</td>
                    <td className="py-3 text-primary font-bold">UGX {fmt(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
