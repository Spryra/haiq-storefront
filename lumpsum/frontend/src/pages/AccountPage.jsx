import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Crown from '../components/shared/Crown'

const TABS = ['Profile', 'Orders', 'Loyalty Card']

// ── Points tier system ─────────────────────────────────────────────────────
const TIERS = [
  { name: 'Classic',   min: 0,    color: '#8C7355', desc: 'Every purchase earns you points.' },
  { name: 'Reserve',   min: 500,  color: '#B8752A', desc: 'Priority support and early access.' },
  { name: 'Crown',     min: 1500, color: '#E8C88A', desc: 'The highest tier. Personal service.' },
]

function getTier(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i]
  }
  return TIERS[0]
}

// ── Loyalty Card Application ───────────────────────────────────────────────
function LoyaltyTab({ user }) {
  const [cardStatus, setCardStatus]   = useState(user?.loyalty_status ?? null)
  const [applyOpen,  setApplyOpen]    = useState(false)
  const [address,    setAddress]      = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted,  setSubmitted]    = useState(false)
  const [error,      setError]        = useState(null)

  const points    = user?.loyalty_points ?? 0
  const tier      = getTier(points)
  const nextTier  = TIERS.find(t => t.min > points)
  const pctToNext = nextTier ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100)) : 100

  const handleApply = async () => {
    if (!address.trim()) { setError('Please enter your delivery address.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/loyalty/apply', { delivery_address: address })
      setSubmitted(true)
      setCardStatus('pending')
      setApplyOpen(false)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusMap = {
    null:        { label: 'Not Applied', color: 'text-muted', bg: 'bg-dark2' },
    pending:     { label: 'Under Review', color: 'text-haiq-gold', bg: 'bg-haiq-gold/10' },
    approved:    { label: 'Approved',    color: 'text-green-400', bg: 'bg-green-400/10' },
    dispatched:  { label: 'Card Dispatched', color: 'text-primary', bg: 'bg-primary/10' },
    delivered:   { label: 'Card Delivered', color: 'text-green-400', bg: 'bg-green-400/10' },
    rejected:    { label: 'Not Approved', color: 'text-red-400', bg: 'bg-red-400/10' },
  }

  const status = statusMap[cardStatus] ?? statusMap[null]

  return (
    <div className="space-y-8">

      {/* Points card */}
      <div className="relative bg-dark2 border border-primary/20 p-8 overflow-hidden">
        {/* Background crown watermark */}
        <div className="absolute top-4 right-6 opacity-5 pointer-events-none">
          <Crown size={120} color="#E8C88A" />
        </div>

        <div className="relative z-10">
          <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Your Points</p>
          <p className="font-serif font-bold text-haiq-gold" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
            {points.toLocaleString()}
          </p>

          {/* Tier badge */}
          <div className="flex items-center gap-2 mt-3 mb-6">
            <Crown size={14} color={tier.color} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: tier.color }}>
              {tier.name}
            </span>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-light/40">{tier.name}</span>
                <span className="text-light/40">{nextTier.name} at {nextTier.min.toLocaleString()} pts</span>
              </div>
              <div className="h-1 bg-dark rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pctToNext}%`, backgroundColor: tier.color }}
                />
              </div>
              <p className="text-light/40 text-xs mt-2">
                {(nextTier.min - points).toLocaleString()} points to {nextTier.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card status */}
      <div className="bg-dark2 border border-primary/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Physical Card Status</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
              <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
            </div>
          </div>

          {(!cardStatus || cardStatus === 'rejected') && !submitted && (
            <button
              onClick={() => setApplyOpen(true)}
              className="bg-primary text-dark px-6 py-2.5 font-bold text-xs tracking-widest uppercase hover:bg-haiq-gold transition-colors duration-200"
            >
              Apply for Card
            </button>
          )}
        </div>

        {/* Status descriptions */}
        {cardStatus === 'pending' && (
          <p className="text-light/40 text-xs mt-4 leading-relaxed">
            Your application is under review. We'll email you once a decision has been made.
          </p>
        )}
        {cardStatus === 'dispatched' && (
          <p className="text-light/40 text-xs mt-4 leading-relaxed">
            Your HAIQ loyalty card is on its way to you. Check your delivery address.
          </p>
        )}
        {cardStatus === 'delivered' && (
          <p className="text-light/40 text-xs mt-4 leading-relaxed">
            Your physical card has been delivered. Present it with your orders to earn points.
          </p>
        )}
      </div>

      {/* Apply form */}
      {applyOpen && (
        <div className="bg-dark2 border border-primary/40 p-6">
          <p className="font-serif font-bold text-light text-lg mb-2">Apply for Your HAIQ Card</p>
          <p className="text-light/40 text-sm leading-relaxed mb-6">
            Your physical loyalty card will be delivered to the address below.
            We'll review your account and respond via email.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-primary/70 tracking-widest uppercase mb-2">
              Delivery Address
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Plot 12, Muyenga Hill, Kampala..."
              className="w-full bg-dark border border-primary/30 px-4 py-3 text-sm text-light placeholder:text-light/30 focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={submitting}
              className="bg-primary text-dark px-6 py-2.5 font-bold text-xs tracking-widest uppercase hover:bg-haiq-gold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            <button
              onClick={() => setApplyOpen(false)}
              className="text-light/40 text-xs hover:text-light/70 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tier breakdown */}
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-4">Tier Benefits</p>
        <div className="space-y-3">
          {TIERS.map(t => (
            <div
              key={t.name}
              className={`flex items-center gap-4 p-4 border transition-all ${
                tier.name === t.name
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-primary/10 opacity-50'
              }`}
            >
              <Crown size={16} color={t.color} />
              <div>
                <p className="text-sm font-bold tracking-widest uppercase" style={{ color: t.color }}>{t.name}</p>
                <p className="text-light/50 text-xs">{t.desc}</p>
              </div>
              <p className="ml-auto text-xs text-light/30">{t.min.toLocaleString()}+ pts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const [form, setForm]       = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '', email: user?.email ?? '' })
  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [pwMsg, setPwMsg]     = useState(null)

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const updPw = (k) => (e) => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const saveProfile = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await api.put('/auth/profile', form)
      setMsg('Profile updated.')
    } catch { setMsg('Save failed.') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (pwForm.next.length < 6) { setPwMsg('Password must be at least 6 characters.'); return }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwForm.next)) { setPwMsg('Password must include at least one special character.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return }
    setSavingPw(true)
    setPwMsg(null)
    try {
      await api.put('/auth/password', { current_password: pwForm.current, new_password: pwForm.next })
      setPwMsg('Password updated.')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwMsg(err.response?.data?.error ?? 'Failed to update password.')
    } finally { setSavingPw(false) }
  }

  const field = (label, key, type = 'text') => (
    <div key={key}>
      <label className="block text-xs font-semibold text-primary/70 tracking-widest uppercase mb-2">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={upd(key)}
        className="w-full bg-dark2 border border-primary/20 px-4 py-3 text-sm text-light placeholder:text-light/30 focus:outline-none focus:border-primary transition"
      />
    </div>
  )

  return (
    <div className="space-y-10 max-w-lg">
      <div className="space-y-4">
        <p className="font-serif text-light text-xl font-bold">Your Details</p>
        {field('Full Name', 'full_name')}
        {field('Phone Number', 'phone', 'tel')}
        {field('Email Address', 'email', 'email')}
        {msg && <p className="text-primary text-xs">{msg}</p>}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-primary text-dark px-6 py-2.5 font-bold text-xs tracking-widest uppercase hover:bg-haiq-gold transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="border-t border-primary/20 pt-10 space-y-4">
        <p className="font-serif text-light text-xl font-bold">Change Password</p>
        {[
          ['Current Password', 'current'],
          ['New Password (min 6 chars, 1 special character)', 'next'],
          ['Confirm New Password', 'confirm'],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-primary/70 tracking-widest uppercase mb-2">{label}</label>
            <input
              type="password"
              value={pwForm[key]}
              onChange={updPw(key)}
              className="w-full bg-dark2 border border-primary/20 px-4 py-3 text-sm text-light placeholder:text-light/30 focus:outline-none focus:border-primary transition"
            />
          </div>
        ))}
        {pwMsg && <p className="text-primary text-xs">{pwMsg}</p>}
        <button
          onClick={changePassword}
          disabled={savingPw}
          className="bg-dark2 border border-primary/40 text-primary px-6 py-2.5 font-bold text-xs tracking-widest uppercase hover:bg-primary hover:text-dark transition-all disabled:opacity-50"
        >
          {savingPw ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}

// ── Orders tab ─────────────────────────────────────────────────────────────
function OrdersTab({ user }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-4">🍪</p>
      <p className="font-serif text-light text-xl font-bold mb-2">No orders yet</p>
      <p className="text-light/40 text-sm mb-6">Your order history will appear here.</p>
      <a href="/shop" className="inline-block bg-primary text-dark px-8 py-3 font-bold text-xs tracking-widest uppercase hover:bg-haiq-gold transition-colors">
        Shop Now
      </a>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Profile')

  return (
    <div className="bg-dark min-h-screen">

      {/* Header */}
      <div className="border-b border-primary/20 py-12 px-6 md:px-16">
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-3">
          Made For You
        </p>
        <h1 className="font-serif font-bold text-light text-4xl md:text-5xl">
          {user?.full_name?.split(' ')[0] ?? 'Your Account'}
        </h1>
      </div>

      <div className="px-6 md:px-16 py-10">

        {/* Tab navigation */}
        <div className="flex border-b border-primary/20 mb-10 gap-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-all duration-200 -mb-px ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light/40 hover:text-light/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Profile'      && <ProfileTab  user={user} />}
        {tab === 'Orders'       && <OrdersTab   user={user} />}
        {tab === 'Loyalty Card' && <LoyaltyTab  user={user} />}
      </div>
    </div>
  )
}
