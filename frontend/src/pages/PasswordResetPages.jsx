// ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Crown from '../components/shared/Crown'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await requestPasswordReset(email.trim().toLowerCase())
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#1A0A00', minHeight: '85vh' }} className="flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Crown size={20} color="#B8752A" className="mb-6 opacity-60" />
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>Reset Password</p>
        <h1 className="font-serif font-bold text-3xl mb-2" style={{ color: '#F2EAD8' }}>Forgot Your Password?</h1>
        <div className="w-8 h-px mb-6" style={{ background: '#B8752A' }} />

        {done ? (
          <div>
            <div className="px-4 py-4 mb-5" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <p className="text-sm" style={{ color: '#4ade80' }}>
                If an account exists for <strong>{email}</strong>, we've sent a reset link. Check your inbox.
              </p>
            </div>
            <Link to="/login" className="text-sm hover:underline" style={{ color: '#B8752A' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(242,234,216,0.45)' }}>
              Enter the email address linked to your account and we'll send you a reset link.
            </p>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm focus:outline-none"
                style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.25)', color: '#F2EAD8' }} />
            </div>
            {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 font-bold text-[11px] tracking-[0.25em] uppercase disabled:opacity-50"
              style={{ background: '#B8752A', color: '#1A0A00' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-xs hover:underline" style={{ color: '#8C7355' }}>Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

// ResetPasswordPage.jsx
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Crown from '../components/shared/Crown'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const token = searchParams.get('token')

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6)          { setError('Password must be at least 6 characters.'); return }
    if (!/[!@#$%^&*]/.test(password)) { setError('Include at least one special character.'); return }
    if (password !== confirm)          { setError('Passwords do not match.'); return }
    setLoading(true); setError(null)
    try {
      await resetPassword(token, password)
      navigate('/login', { state: { message: 'Password updated. Please sign in.' } })
    } catch (err) {
      setError(err.response?.data?.error || 'This link may have expired. Request a new one.')
    } finally { setLoading(false) }
  }

  if (!token) return (
    <div style={{ background: '#1A0A00', minHeight: '85vh' }} className="flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-serif font-bold text-xl mb-3" style={{ color: '#F2EAD8' }}>Invalid link</p>
        <p className="text-sm mb-5" style={{ color: '#8C7355' }}>This reset link is invalid or has expired.</p>
        <a href="/forgot-password" className="text-sm" style={{ color: '#B8752A' }}>Request a new one</a>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#1A0A00', minHeight: '85vh' }} className="flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Crown size={20} color="#B8752A" className="mb-6 opacity-60" />
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>New Password</p>
        <h1 className="font-serif font-bold text-3xl mb-2" style={{ color: '#F2EAD8' }}>Reset Password</h1>
        <div className="w-8 h-px mb-8" style={{ background: '#B8752A' }} />

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="6+ chars, 1 special character"
              className="w-full px-4 py-3 text-sm focus:outline-none"
              style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.25)', color: '#F2EAD8' }} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8C7355' }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              placeholder="Repeat new password"
              className="w-full px-4 py-3 text-sm focus:outline-none"
              style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.25)', color: '#F2EAD8' }} />
          </div>
          {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 font-bold text-[11px] tracking-[0.25em] uppercase disabled:opacity-50"
            style={{ background: '#B8752A', color: '#1A0A00' }}>
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
