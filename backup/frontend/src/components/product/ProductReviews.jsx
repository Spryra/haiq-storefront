import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${sz} transition-transform ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <span style={{ color: (hover || value) >= star ? '#C19A6B' : '#D1D5DB' }}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-dark text-sm">{review.name}</p>
          {review.verified_purchase && (
            <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              ✓ Verified Purchase
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.rating} readonly size="sm" />
          <span className="text-[11px] text-gray-400">
            {new Date(review.created_at).toLocaleDateString('en-UG', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function ProductReviews({ productSlug }) {
  const { user } = useAuth()

  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [rating,     setRating]     = useState(5)
  const [comment,    setComment]    = useState('')
  const [name,       setName]       = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '')
  const [token,      setToken]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status,     setStatus]     = useState(null) // null | success | error | no-order

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  useEffect(() => {
    api.get(`/products/${productSlug}/reviews`)
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [productSlug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !name.trim()) return
    setSubmitting(true)
    setStatus(null)
    try {
      await api.post(`/products/${productSlug}/reviews`, {
        rating,
        comment: comment.trim(),
        name:    name.trim(),
        tracking_token: token.trim() || undefined,
      })
      setStatus('success')
      setComment('')
      setToken('')
      setShowForm(false)
      // Refresh
      const res = await api.get(`/products/${productSlug}/reviews`)
      setReviews(res.data.reviews || [])
    } catch (err) {
      const code = err.response?.data?.code
      setStatus(code === 'ORDER_NOT_FOUND' ? 'no-order' : 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-1">
            Customer Feedback
          </p>
          <h2 className="font-serif text-3xl font-bold text-dark">Reviews</h2>
        </div>

        {/* Summary */}
        {avgRating && (
          <div className="text-right hidden sm:block">
            <p className="font-serif text-4xl font-bold text-dark">{avgRating}</p>
            <StarRating value={Math.round(avgRating)} readonly />
            <p className="text-xs text-gray-400 mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="py-5 border-b border-gray-100">
              <div className="h-4 bg-gray-200 skeleton rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 skeleton rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 skeleton rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center bg-gray-50 rounded-2xl">
          <p className="text-3xl mb-3">🍪</p>
          <p className="font-serif text-lg font-bold text-dark mb-1">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to share your experience.</p>
        </div>
      ) : (
        <div>
          {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
      )}

      {/* Success message */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
          ✓ Thank you — your review has been submitted and is pending approval.
        </div>
      )}

      {/* Leave review toggle */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-8 border border-dark text-dark px-6 py-3 rounded-full font-medium text-sm hover:bg-dark hover:text-light transition-all duration-200"
        >
          Leave a Review
        </button>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-serif text-xl font-bold text-dark mb-6">Share Your Experience</h3>

          {/* Rating */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark mb-2">Your Rating</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-1">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Sarah K."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-1">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              rows={4}
              placeholder="What did you love about it? Would you recommend it?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Tracking token for verified purchase badge */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-1">
              Order Tracking Token
              <span className="text-gray-400 font-normal ml-2">(optional — adds a Verified Purchase badge)</span>
            </label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="trk_xxxxxxxx (from your order confirmation)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Error messages */}
          {status === 'error' && (
            <p className="mb-4 text-sm text-red-500">Something went wrong. Please try again.</p>
          )}
          {status === 'no-order' && (
            <p className="mb-4 text-sm text-red-500">We could not verify that tracking token. Please double-check it or leave it blank.</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-dark text-light px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary hover:text-dark transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setStatus(null) }}
              className="text-gray-400 text-sm hover:text-dark transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
