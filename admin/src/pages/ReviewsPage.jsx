// ReviewsPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'

const STATUS_STYLE = {
  pending:  { label: 'Pending',  bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  approved: { label: 'Approved', bg: 'bg-green-500/15',  text: 'text-green-400'  },
  rejected: { label: 'Rejected', bg: 'bg-red-500/15',    text: 'text-red-400'    },
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array(5).fill(null).map((_, i) => (
        <span key={i} className={i < rating ? 'text-haiq-gold' : 'text-light/20'}>★</span>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('pending')
  const [updating, setUpdating] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/reviews')
      .then(res => setReviews(res.data.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateReview = async (id, status) => {
    setUpdating(id)
    try {
      await adminApi.patch(`/admin/reviews/${id}`, { status })
      load()
    } catch (e) { console.error(e) }
    finally { setUpdating(null) }
  }

  const visible  = filter === 'all' ? reviews : reviews.filter(r => r.status === filter)
  const pending  = reviews.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Manage</p>
        <h1 className="font-serif font-bold text-light text-3xl">Reviews</h1>
      </div>

      {pending > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-5 py-3 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">⭐</span>
          <p className="text-yellow-300 text-sm">
            <strong>{pending}</strong> review{pending > 1 ? 's' : ''} awaiting moderation.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors ${
              filter === f
                ? 'bg-primary text-dark'
                : 'border border-border text-light/40 hover:text-light'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_STYLE[f]?.label}
            {f === 'pending' && pending > 0 && (
              <span className="ml-2 bg-yellow-400 text-dark rounded-full px-1.5 py-0.5 text-[9px]">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? Array(4).fill(null).map((_, i) => (
          <div key={i} className="h-24 skeleton-dark rounded-lg" />
        )) : visible.length === 0 ? (
          <div className="admin-card text-center text-light/30 py-10 text-sm">
            No reviews in this category.
          </div>
        ) : visible.map(review => {
          const st = STATUS_STYLE[review.status] || STATUS_STYLE.pending
          return (
            <div key={review.id} className="admin-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-light font-semibold">{review.name}</p>
                    <Stars rating={review.rating} />
                    <span className={`status-badge ${st.bg} ${st.text}`}>{st.label}</span>
                    {review.verified_purchase && (
                      <span className="status-badge bg-primary/15 text-primary">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-primary/60 text-xs uppercase tracking-wider">
                    {review.product_name}
                  </p>
                  <p className="text-light/60 text-sm leading-relaxed">"{review.comment}"</p>
                  <p className="text-light/20 text-xs">
                    {new Date(review.created_at).toLocaleDateString('en-UG', { timeZone: 'Africa/Kampala' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateReview(review.id, 'approved')}
                      disabled={updating === review.id}
                      className="admin-btn-primary px-4 py-1.5 text-[10px]"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateReview(review.id, 'rejected')}
                      disabled={updating === review.id}
                      className="border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
