import { Link } from 'react-router-dom'
import { useState } from 'react'
import Crown from '../shared/Crown'
import api from '../../services/api'

export default function Footer() {
  const [email,     setEmail]     = useState('')
  const [name,      setName]      = useState('')
  const [subStatus, setSubStatus] = useState(null)  // null | 'loading' | 'done' | 'error'

  const subscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setSubStatus('loading')
    try {
      await api.post('/newsletter/subscribe', { email, name })
      setSubStatus('done')
      setEmail('')
      setName('')
    } catch {
      setSubStatus('error')
    }
  }

  return (
    <footer className="bg-dark border-t border-primary/20">

      {/* Top rule */}
      <div className="h-px bg-primary/20" />

      <div className="container mx-auto px-6 md:px-16 py-16">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">

          {/* Brand column */}
          <div className="md:col-span-1">
            <img src="/HAIQmain.png" alt="HAIQ" className="h-10 w-auto object-contain mb-4" />
            <p className="text-light/40 text-xs leading-relaxed mb-4">
              Made For You.<br />
              Muyenga, Kampala, Uganda.
            </p>
            <div className="flex items-center gap-2 opacity-30">
              <Crown size={16} color="#B8752A" />
            </div>
          </div>

          {/* Shop column */}
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.3em] mb-4">Shop</p>
            <ul className="space-y-3">
              {[
                ['All Cookies', '/shop'],
                ['Build Your Box', '/build-your-box'],
                ['The Unboxing', '/products/the-unboxing'],
                ['Moments', '/moments'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-light/50 text-xs hover:text-primary transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info column */}
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.3em] mb-4">Info</p>
            <ul className="space-y-3">
              {[
                ['FAQ', '/faq'],
                ['Contact', '/contact'],
                ['Track Order', '/track'],
                ['Loyalty Card', '/account'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-light/50 text-xs hover:text-primary transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.3em] mb-4">Stay Close</p>
            <p className="text-light/40 text-xs leading-relaxed mb-4">
              New flavours, special days, and drops — first in your inbox.
            </p>

            {subStatus === 'done' ? (
              <div className="border border-primary/30 px-4 py-3">
                <p className="text-primary text-xs font-medium">You're in. Watch your inbox.</p>
              </div>
            ) : (
              <form onSubmit={subscribe} className="space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-dark2 border border-primary/20 px-3 py-2.5 text-xs text-light placeholder:text-light/30 focus:outline-none focus:border-primary transition"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-dark2 border border-primary/20 px-3 py-2.5 text-xs text-light placeholder:text-light/30 focus:outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="w-full bg-primary text-dark py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-haiq-gold transition-colors disabled:opacity-50"
                >
                  {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
                {subStatus === 'error' && (
                  <p className="text-red-400 text-[10px]">Something went wrong. Try again.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary/15 px-6 md:px-16 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-light/30 text-[10px] tracking-wide">
            © {new Date().getFullYear()} HAIQ Bakery. Made For You.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/haiq_ug" target="_blank" rel="noopener noreferrer"
              className="text-light/30 text-[10px] tracking-wider hover:text-primary transition-colors">
              @haiq_ug
            </a>
            <span className="text-light/20 text-[10px]">Haiqafrica</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
