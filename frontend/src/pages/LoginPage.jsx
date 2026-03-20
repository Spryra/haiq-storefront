import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Crown from '../components/shared/Crown'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  // Redirect to where they came from, or account page
  const from = location.state?.from?.pathname || '/account'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark min-h-[85vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">

        <Crown size={20} color="#B8752A" className="mb-6 opacity-55" />

        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-2">
          Welcome Back
        </p>
        <h1 className="font-serif font-bold text-light text-3xl mb-2">
          Sign In
        </h1>
        <div className="w-8 h-px bg-primary mb-8" />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-[0.2em] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-dark2 border border-primary/20 px-4 py-3 text-sm text-light placeholder:text-light/20 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-[0.2em] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-dark2 border border-primary/20 px-4 py-3 text-sm text-light placeholder:text-light/20 focus:outline-none focus:border-primary transition-colors"
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
            className="w-full bg-primary text-dark py-3.5 font-bold text-[11px] tracking-[0.25em] uppercase hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-light/30 text-xs text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-secondary transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
