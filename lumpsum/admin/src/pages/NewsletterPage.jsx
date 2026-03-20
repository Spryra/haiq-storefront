// NewsletterPage.jsx
// Backend: GET /admin/newsletter  → { subscribers: [...] }
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    adminApi.get('/admin/newsletter')
      .then(res => setSubscribers(res.data.subscribers || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const active   = subscribers.filter(s => s.is_active).length
  const inactive = subscribers.length - active

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Subscribers</p>
          <h1 className="font-serif font-bold text-light text-3xl">Newsletter</h1>
        </div>
        <div className="flex gap-4">
          <div className="admin-card py-3 px-5 text-center min-w-[80px]">
            <p className="text-primary font-bold text-2xl font-serif">{active}</p>
            <p className="text-light/30 text-xs mt-0.5">Active</p>
          </div>
          <div className="admin-card py-3 px-5 text-center min-w-[80px]">
            <p className="text-light/40 font-bold text-2xl font-serif">{inactive}</p>
            <p className="text-light/30 text-xs mt-0.5">Inactive</p>
          </div>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-light/40 text-[10px] uppercase tracking-widest">
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Subscribed</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(null).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array(5).fill(null).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-3 skeleton-dark rounded w-28" /></td>
                  ))}
                </tr>
              )) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-light/30 py-12 text-sm">No subscribers yet.</td>
                </tr>
              ) : subscribers.map((s, i) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                  <td className="px-5 py-3.5 text-light/30 text-xs">{i + 1}</td>
                  <td className="px-5 py-3.5 text-light font-medium">{s.email}</td>
                  <td className="px-5 py-3.5 text-light/50">{s.name || '—'}</td>
                  <td className="px-5 py-3.5 text-light/30 text-xs">
                    {new Date(s.subscribed_at).toLocaleDateString('en-UG', { timeZone: 'Africa/Kampala' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`status-badge ${s.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {s.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
