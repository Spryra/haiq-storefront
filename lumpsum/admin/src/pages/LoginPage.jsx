// LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function LoginPage() {
  const { login }   = useAdminAuth()
  const navigate    = useNavigate()
  const [email,     setEmail]    = useState('')
  const [password,  setPassword] = useState('')
  const [error,     setError]    = useState(null)
  const [loading,   setLoading]  = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-10 text-center">
          <p className="font-serif font-bold text-primary text-4xl tracking-widest mb-1">HAIQ</p>
          <p className="text-light/30 text-xs uppercase tracking-[0.3em]">Admin Dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@haiq.ug"
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="admin-input"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full admin-btn-primary py-3.5 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-light/20 text-[10px] text-center mt-8 uppercase tracking-widest">
          Made For You
        </p>
      </div>
    </div>
  )
}
