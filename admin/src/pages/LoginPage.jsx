import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function LoginPage() {
  const { login }  = useAdminAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(184,117,42,0.07) 0%, transparent 65%), #0E0600',
      }}
    >
      {/* Thin top line */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gold/30" />

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/HAIQmain.png"
            alt="HAIQ Bakery"
            className="h-14 w-auto object-contain mb-3"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          {/* Text fallback if logo missing */}
          <span
            className="font-serif font-bold text-gold text-3xl tracking-widest hidden"
            style={{ display: 'none' }}
          >
            HAIQ
          </span>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.3em]">
            Staff Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border p-8">

          <h1 className="font-serif text-xl font-bold text-haiq-cream mb-1">
            Welcome back
          </h1>
          <p className="text-muted text-sm mb-7">
            Sign in to the HAIQ admin dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@haiq.ug"
                className="
                  w-full bg-ink border border-border
                  px-4 py-3 text-sm text-haiq-cream
                  placeholder:text-muted/50
                  focus:outline-none focus:border-gold
                  transition-colors
                "
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="
                  w-full bg-ink border border-border
                  px-4 py-3 text-sm text-haiq-cream
                  placeholder:text-muted/50
                  focus:outline-none focus:border-gold
                  transition-colors
                "
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-gold text-ink
                py-3 font-bold text-sm tracking-widest uppercase
                hover:bg-haiq-tan transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                mt-2
              "
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-[10px] mt-6">
          HAIQ Bakery &middot; Internal Staff Portal
        </p>
      </div>
    </div>
  )
}
