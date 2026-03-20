import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Crown from '../components/shared/Crown'

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, onUpdated }) {
  const fullName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
  const [form,    setForm]    = useState({ full_name: fullName, phone: user?.phone || '' })
  const [pwForm,  setPwForm]  = useState({ current: '', next: '', confirm: '' })
  const [saving,  setSaving]  = useState(false)
  const [pwSaving,setPwSaving]= useState(false)
  const [msg,     setMsg]     = useState(null)
  const [pwMsg,   setPwMsg]   = useState(null)

  const upd   = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const updPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const saveProfile = async () => {
    setSaving(true); setMsg(null)
    try {
      const parts = form.full_name.trim().split(' ')
      await api.put('/auth/profile', {
        full_name:  form.full_name.trim(),
        first_name: parts[0],
        last_name:  parts.slice(1).join(' '),
        phone:      form.phone.trim(),
      })
      setMsg({ ok: true, text: 'Profile updated.' })
      onUpdated?.()
    } catch { setMsg({ ok: false, text: 'Could not save. Try again.' }) }
    finally { setSaving(false) }
  }

  const changePw = async () => {
    if (pwForm.next.length < 6) { setPwMsg('Password must be at least 6 characters.'); return }
    if (!/[!@#$%^&*]/.test(pwForm.next)) { setPwMsg('Include at least one special character.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return }
    setPwSaving(true); setPwMsg(null)
    try {
      await api.put('/auth/password', { current_password: pwForm.current, new_password: pwForm.next })
      setPwMsg('Password updated.')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) { setPwMsg(err.response?.data?.error || 'Failed. Check your current password.') }
    finally { setPwSaving(false) }
  }

  const inputStyle = { background: '#1A0A00', border: '1px solid #3D2000', color: '#F2EAD8' }
  const field = (label, key, type='text', hint) => (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>{label}</label>
      <input type={type} value={form[key]} onChange={upd(key)}
        className="w-full px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
      {hint && <p className="text-[10px] mt-1" style={{ color: '#8C7355' }}>{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-10 max-w-lg">
      <div className="space-y-4">
        <p className="font-serif font-bold text-xl" style={{ color: '#F2EAD8' }}>Your Details</p>
        {field('Full Name', 'full_name', 'text', 'First and last name')}
        {field('Phone Number', 'phone', 'tel')}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>Email Address</label>
          <input type="email" value={user?.email} readOnly className="w-full px-4 py-3 text-sm cursor-not-allowed" style={{ ...inputStyle, opacity: 0.4 }} />
        </div>
        {msg && <p className="text-xs" style={{ color: msg.ok ? '#B8752A' : '#f87171' }}>{msg.text}</p>}
        <button onClick={saveProfile} disabled={saving}
          className="px-6 py-2.5 font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-50"
          style={{ background: '#B8752A', color: '#1A0A00' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4 pt-8" style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
        <p className="font-serif font-bold text-xl" style={{ color: '#F2EAD8' }}>Change Password</p>
        {[['Current Password','current'],['New Password (6+ chars, 1 special)','next'],['Confirm New Password','confirm']].map(([l,k]) => (
          <div key={k}>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>{l}</label>
            <input type="password" value={pwForm[k]} onChange={updPw(k)} className="w-full px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
        ))}
        {pwMsg && <p className="text-xs" style={{ color: pwMsg === 'Password updated.' ? '#B8752A' : '#f87171' }}>{pwMsg}</p>}
        <button onClick={changePw} disabled={pwSaving}
          className="px-6 py-2.5 font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-50"
          style={{ border: '1px solid rgba(184,117,42,0.4)', color: '#B8752A' }}>
          {pwSaving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 skeleton" style={{ background: 'rgba(184,117,42,0.06)' }} />)}</div>

  if (!orders.length) return (
    <div className="py-12 text-center">
      <p className="font-serif text-xl font-bold mb-2" style={{ color: '#F2EAD8' }}>No orders yet.</p>
      <Link to="/shop" className="inline-block mt-4 font-bold text-[11px] tracking-[0.2em] uppercase px-8 py-3"
        style={{ background: '#B8752A', color: '#1A0A00' }}>Shop Now</Link>
    </div>
  )

  return (
    <div className="space-y-3 max-w-lg">
      {orders.map(o => (
        <Link key={o.id} to={`/track/${o.tracking_token}`}
          className="flex items-center justify-between gap-4 p-4 transition-all"
          style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.15)', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#B8752A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(184,117,42,0.15)'}
        >
          <div>
            <p className="font-mono font-bold text-sm" style={{ color: '#E8C88A' }}>{o.order_number}</p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: '#8C7355' }}>{o.status?.replace(/_/g,' ')}</p>
          </div>
          <p className="font-bold text-sm" style={{ color: '#B8752A' }}>UGX {Number(o.total).toLocaleString()}</p>
        </Link>
      ))}
    </div>
  )
}

// ── Loyalty Card Tab ────────────────────────────────────────────────────────────
function LoyaltyTab({ user }) {
  const [card,       setCard]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [applyOpen,  setApplyOpen]  = useState(false)
  const [address,    setAddress]    = useState('')
  const [phone,      setPhone]      = useState(user?.phone || '')
  const [submitting, setSubmitting] = useState(false)
  const [err,        setErr]        = useState(null)
  const [done,       setDone]       = useState(false)

  useEffect(() => {
    api.get('/loyalty/me').then(r => setCard(r.data.card)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleApply = async () => {
    if (address.trim().length < 5) { setErr('Please enter your full delivery address.'); return }
    if (phone.trim().length < 7)   { setErr('Please enter a phone number for card delivery.'); return }
    setSubmitting(true); setErr(null)
    try {
      const r = await api.post('/loyalty/apply', { delivery_address: address.trim(), contact_phone: phone.trim() })
      setCard(r.data.card)
      setDone(true)
      setApplyOpen(false)
    } catch (e) { setErr(e.response?.data?.error || 'Could not submit application.') }
    finally { setSubmitting(false) }
  }

  const STATUS_INFO = {
    pending:    { label: 'Under Review',   color: '#E8C88A', desc: 'We\'ll review your application and respond by email.' },
    approved:   { label: 'Approved',       color: '#4ade80', desc: 'Your card has been approved and is being prepared.' },
    rejected:   { label: 'Not Approved',   color: '#f87171', desc: 'You can reapply. Reach out if you have questions.' },
    dispatched: { label: 'On Its Way',     color: '#B8752A', desc: 'Your card has been dispatched to your address.' },
    delivered:  { label: 'Card Delivered', color: '#4ade80', desc: 'Your HAIQ loyalty card has been delivered.' },
  }

  const canApply = !card || card.status === 'rejected'

  return (
    <div className="max-w-lg space-y-6">

      {/* Card status */}
      <div className="p-6 relative overflow-hidden" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        <div className="absolute -top-4 -right-4 opacity-[0.05] pointer-events-none">
          <Crown size={120} color="#E8C88A" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Crown size={16} color="#B8752A" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#8C7355' }}>
            HAIQ Loyalty Card
          </p>
        </div>

        {loading ? (
          <div className="h-8 skeleton rounded" style={{ background: 'rgba(184,117,42,0.08)', width: '60%' }} />
        ) : card ? (
          <>
            <div className="mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                style={{ background: `${STATUS_INFO[card.status]?.color}20`, color: STATUS_INFO[card.status]?.color || '#8C7355' }}>
                {STATUS_INFO[card.status]?.label || card.status}
              </span>
            </div>
            {card.card_number && (
              <p className="font-mono font-bold text-xl mt-2" style={{ color: '#E8C88A' }}>{card.card_number}</p>
            )}
            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(242,234,216,0.45)' }}>
              {STATUS_INFO[card.status]?.desc}
            </p>
            {card.delivery_address && (
              <p className="text-xs mt-3" style={{ color: '#8C7355' }}>
                Sending to: {card.delivery_address}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(242,234,216,0.45)' }}>
            You haven't applied for a loyalty card yet. Apply below to get yours.
          </p>
        )}

        {canApply && !done && (
          <button onClick={() => setApplyOpen(true)}
            className="mt-4 px-5 py-2.5 font-bold text-[11px] tracking-[0.2em] uppercase"
            style={{ background: '#B8752A', color: '#1A0A00' }}>
            Apply for Card
          </button>
        )}
      </div>

      {/* Apply form */}
      {applyOpen && (
        <div className="p-6" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
          <p className="font-serif font-bold text-lg mb-1" style={{ color: '#F2EAD8' }}>Apply for Your HAIQ Card</p>
          <p className="text-sm mb-5" style={{ color: 'rgba(242,234,216,0.4)' }}>
            Your physical card will be mailed to the address below. We'll notify you by email once approved.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>
                Delivery Address *
              </label>
              <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Plot 12, Muyenga Hill, Kampala..."
                className="w-full px-4 py-2.5 text-sm resize-none focus:outline-none"
                style={{ background: '#1A0A00', border: '1px solid #3D2000', color: '#F2EAD8' }} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>
                Phone Number for Delivery *
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
                className="w-full px-4 py-3 text-sm focus:outline-none"
                style={{ background: '#1A0A00', border: '1px solid #3D2000', color: '#F2EAD8' }} />
            </div>
          </div>
          {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleApply} disabled={submitting}
              className="px-6 py-2.5 font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-50"
              style={{ background: '#B8752A', color: '#1A0A00' }}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            <button onClick={() => setApplyOpen(false)} className="text-sm hover:opacity-60 transition"
              style={{ color: '#8C7355' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Messages Tab ──────────────────────────────────────────────────────────────
function MessagesTab({ user }) {
  const [messages, setMessages] = useState([])
  const [body,     setBody]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const bottomRef = useRef(null)

  const load = () => {
    api.get('/messages/direct/me').then(r => setMessages(r.data.messages || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!body.trim()) return
    setSending(true)
    try {
      await api.post('/messages/direct', { body: body.trim() })
      setBody('')
      load()
    } catch {} finally { setSending(false) }
  }

  return (
    <div className="max-w-lg flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
      <p className="font-serif font-bold text-xl mb-4" style={{ color: '#F2EAD8' }}>Message HAIQ</p>
      <p className="text-sm mb-5" style={{ color: 'rgba(242,234,216,0.4)' }}>
        Have a question not related to a specific order? Send us a message and we'll get back to you.
      </p>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {loading ? (
          <div className="py-8 text-center text-sm" style={{ color: '#8C7355' }}>Loading…</div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: '#8C7355' }}>
            No messages yet. Say hello — we're real people.
          </div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}>
            <div
              className="px-4 py-3 text-sm max-w-[85%] leading-relaxed"
              style={{
                background: m.sender_type === 'admin' ? '#2A1200' : '#1A0A00',
                border:     `1px solid ${m.sender_type === 'admin' ? 'rgba(184,117,42,0.3)' : 'rgba(61,32,0,0.8)'}`,
                color:      '#F2EAD8',
              }}
            >
              <p>{m.body}</p>
              <p className="text-[10px] mt-1.5" style={{ color: '#8C7355' }}>
                {m.sender_type === 'admin' ? 'HAIQ' : 'You'} · {new Date(m.created_at).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Your message…"
          className="flex-1 px-4 py-3 text-sm focus:outline-none"
          style={{ background: '#1A0A00', border: '1px solid #3D2000', color: '#F2EAD8' }}
        />
        <button onClick={send} disabled={sending || !body.trim()}
          className="px-5 py-3 font-bold text-[11px] tracking-wider uppercase disabled:opacity-40"
          style={{ background: '#B8752A', color: '#1A0A00' }}>
          {sending ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

// ── Main Account Page ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile',  label: 'Profile'     },
  { key: 'orders',   label: 'Orders'      },
  { key: 'loyalty',  label: 'Loyalty Card'},
  { key: 'messages', label: 'Messages'    },
]

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  if (!user) return (
    <div style={{ background: '#0E0600', minHeight: '80vh' }} className="flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-sm mb-4" style={{ color: '#8C7355' }}>Please sign in to view your account.</p>
        <Link to="/login" className="inline-block font-bold text-[11px] tracking-[0.2em] uppercase px-8 py-3"
          style={{ background: '#B8752A', color: '#1A0A00' }}>Sign In</Link>
      </div>
    </div>
  )

  const firstName = (user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()).split(' ')[0] || 'Account'

  return (
    <div style={{ background: '#0E0600', minHeight: '100vh' }}>

      {/* Header */}
      <div className="border-b px-6 md:px-16 py-12 md:py-16"
        style={{ borderColor: 'rgba(184,117,42,0.2)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style={{ color: '#B8752A' }}>
          Made For You
        </p>
        <h1 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#F2EAD8' }}>
          {firstName}.
        </h1>
      </div>

      <div className="px-6 md:px-16 py-8">
        {/* Tab strip — scrollable on mobile */}
        <div className="flex border-b mb-8 overflow-x-auto scrollbar-hide" style={{ borderColor: 'rgba(184,117,42,0.2)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-shrink-0 px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase border-b-2 transition -mb-px mr-2"
              style={{
                borderColor: tab === t.key ? '#B8752A' : 'transparent',
                color:       tab === t.key ? '#B8752A' : 'rgba(242,234,216,0.35)',
                whiteSpace:  'nowrap',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile'  && <ProfileTab user={user} onUpdated={() => {}} />}
        {tab === 'orders'   && <OrdersTab />}
        {tab === 'loyalty'  && <LoyaltyTab user={user} />}
        {tab === 'messages' && <MessagesTab user={user} />}
      </div>
    </div>
  )
}
