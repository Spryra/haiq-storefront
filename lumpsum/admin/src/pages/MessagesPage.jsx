// MessagesPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'
import { Link } from 'react-router-dom'

export default function MessagesPage() {
  const [threads,  setThreads]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    adminApi.get('/admin/messages')
      .then(res => setThreads(res.data.threads || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const unreadCount = threads.filter(t => t.unread_count > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Inbox</p>
          <h1 className="font-serif font-bold text-light text-3xl">Messages</h1>
        </div>
        {unreadCount > 0 && (
          <span className="bg-primary text-dark text-xs font-bold px-2.5 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="space-y-2">
        {loading ? Array(4).fill(null).map((_, i) => (
          <div key={i} className="h-16 skeleton-dark rounded-lg" />
        )) : threads.length === 0 ? (
          <div className="admin-card text-center text-light/30 py-10 text-sm">
            No messages yet.
          </div>
        ) : threads.map(thread => (
          <Link
            key={thread.order_id || thread.id}
            to={`/orders/${thread.order_id}`}
            className="flex items-center justify-between admin-card hover:border-primary/40 transition-colors group py-4"
          >
            <div>
              <p className="text-light font-medium group-hover:text-primary transition-colors">
                {thread.order_number || `Order #${thread.order_id?.slice(0, 8)}`}
              </p>
              <p className="text-light/40 text-xs mt-0.5 line-clamp-1 max-w-xs">
                {thread.last_message || '—'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {thread.unread_count > 0 && (
                <span className="bg-primary text-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {thread.unread_count}
                </span>
              )}
              <p className="text-light/20 text-xs mt-1">
                {thread.last_message_at
                  ? new Date(thread.last_message_at).toLocaleDateString('en-UG', { timeZone: 'Africa/Kampala' })
                  : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
