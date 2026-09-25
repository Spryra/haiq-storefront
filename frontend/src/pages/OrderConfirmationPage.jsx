import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'
import Crown from '../components/shared/Crown'
import { AlertTriangle, CheckCircle, Mail, MessageCircle, Package, Link2, Check } from 'lucide-react'

const PAGE = { background: '#0E0600', minHeight: '100vh' }
const CARD = { background: '#1A0A00', border: '1px solid rgba(166,124,82,0.2)' }
const LABEL = 'text-[10px] font-semibold tracking-[0.25em] uppercase'

export default function OrderConfirmationPage() {
  const { token }  = useParams()
  const { state }  = useLocation()
  const [order, setOrder] = useState(state?.order || null)
  const [loading, setLoading] = useState(!state?.order)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!order && token) {
      api.get(`/orders/track/${token}`)
        .then(res => setOrder(res.data.order))
        .catch(err => setError(err.message || 'Unable to load order'))
        .finally(() => setLoading(false))
    }
  }, [token, order])

  const copyTrackingLink = () => {
    const url = `${window.location.origin}/track/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div style={PAGE} className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#A67C52', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={PAGE} className="flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <AlertTriangle size={40} className="mx-auto mb-5" style={{ color: '#f87171' }} />
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: '#F5EAD8' }}>Couldn't Load Order</h1>
          <p className="mb-8 text-sm" style={{ color: '#8C7355' }}>
            {error}. If you just placed an order it was still received; check your email for the confirmation.
          </p>
          <Link
            to="/shop"
            className="block w-full py-3.5 font-bold text-[11px] tracking-[0.25em] uppercase"
            style={{ background: '#A67C52', color: '#1A0A00' }}
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={PAGE} className="flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <Crown size={20} color="#A67C52" className="mx-auto mb-5 opacity-65" />
        <CheckCircle size={44} className="mx-auto mb-5" style={{ color: '#A67C52' }} />

        <p className={`${LABEL} mb-2`} style={{ color: '#A67C52' }}>Order Confirmed</p>
        <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#F5EAD8' }}>Thank You!</h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: 'rgba(245,234,216,0.5)' }}>
          Your order has been received and we're already getting started on it.
        </p>

        {order && (
          <div className="p-6 mb-6 text-left space-y-4" style={CARD}>
            <div className="flex justify-between items-center">
              <span className={LABEL} style={{ color: '#A67C52' }}>Order Number</span>
              <span className="font-mono font-bold" style={{ color: '#F5EAD8' }}>{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={LABEL} style={{ color: '#A67C52' }}>Total</span>
              <span className="font-bold" style={{ color: '#F5EAD8' }}>UGX {Number(order.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={LABEL} style={{ color: '#A67C52' }}>Payment</span>
              <span className="capitalize text-sm" style={{ color: '#F5EAD8' }}>{order.payment_method?.replaceAll('_', ' ')}</span>
            </div>
          </div>
        )}

        <div className="p-5 mb-6 text-left" style={{ ...CARD, background: '#140800' }}>
          <p className={`${LABEL} mb-3`} style={{ color: '#A67C52' }}>What's Next</p>
          <div className="space-y-3 text-sm" style={{ color: 'rgba(245,234,216,0.75)' }}>
            <div className="flex items-center gap-2.5">
              <Mail size={14} style={{ color: '#A67C52', flexShrink: 0 }} />
              <span>Check your email for your order confirmation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageCircle size={14} style={{ color: '#A67C52', flexShrink: 0 }} />
              <span>We'll message you on WhatsApp with updates</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package size={14} style={{ color: '#A67C52', flexShrink: 0 }} />
              <span>Same-day delivery if ordered before noon</span>
            </div>
          </div>
        </div>

        {token && (
          <>
            <Link
              to={`/track/${token}`}
              className="block w-full py-3.5 font-bold text-[11px] tracking-[0.25em] uppercase mb-3"
              style={{ background: '#A67C52', color: '#1A0A00' }}
            >
              Track My Order
            </Link>
            <button
              onClick={copyTrackingLink}
              className="w-full py-3.5 mb-3 inline-flex items-center justify-center gap-2 font-semibold text-[11px] tracking-[0.2em] uppercase"
              style={{ border: '1px solid rgba(166,124,82,0.35)', color: copied ? '#A67C52' : 'rgba(245,234,216,0.6)' }}
            >
              {copied ? <><Check size={14} /> Link copied</> : <><Link2 size={14} /> Copy tracking link</>}
            </button>
            <p className="text-[11px] mb-6" style={{ color: '#8C7355' }}>
              Keep this link. It's how you can check on your order anytime.
            </p>
          </>
        )}

        <Link
          to="/shop"
          className="block w-full py-3.5 font-medium text-[11px] tracking-[0.25em] uppercase"
          style={{ border: '1px solid rgba(166,124,82,0.25)', color: 'rgba(245,234,216,0.6)' }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
