import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Crown from '../components/shared/Crown'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    if (!form.full_name.trim().includes(' ')) return 'Please enter your full name (first and last).'
    if (!form.phone) return 'Phone number required.'
    if (!form.email) return 'Email address required.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password)) return 'Password must include at least one special character.'
    return null
  }

  const submit = async e => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError(null)
    try {
      await login(form.email, form.password, form)  // register+login in one
      navigate('/account')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not create account. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-dark min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Crown accent */}
        <Crown size={22} color="#B8752A" className="mb-6 opacity-60" />

        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-2">Join HAIQ</p>
        <h1 className="font-serif font-bold text-light text-3xl mb-2">Create Account</h1>
        <div className="w-8 h-px bg-primary mb-8" />

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text',     placeholder: 'Amara Nakato' },
            { label: 'Phone',     key: 'phone',     type: 'tel',      placeholder: '+256 700 000 000' },
            { label: 'Email',     key: 'email',     type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password',  key: 'password',  type: 'password', placeholder: 'Min 6 chars, 1 special character' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-primary/70 uppercase tracking-[0.2em] mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={upd(key)}
                placeholder={placeholder}
                required
                className="w-full bg-dark2 border border-primary/20 px-4 py-3 text-sm text-light placeholder:text-light/25 focus:outline-none focus:border-primary transition"
              />
            </div>
          ))}

          {error && (
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-dark py-3.5 font-bold text-xs tracking-widest uppercase hover:bg-haiq-gold transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-light/30 text-xs text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-haiq-gold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
