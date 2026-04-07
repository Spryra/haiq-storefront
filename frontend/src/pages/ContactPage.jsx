import { useState } from 'react'
import api from '../services/api'

const CONTACT_ITEMS = [
  {
    icon: '📞',
    label: 'Phone',
    lines: ['+256 753 996 786', '+256 791 058 916'],
    link: 'tel:+256753996786',
    linkLabel: 'Call us',
  },
  {
    icon: '✉',
    label: 'Email',
    lines: ['haiqafrica@gmail.com'],
    link: 'mailto:haiqafrica@gmail.com',
    linkLabel: 'Send email',
  },
  {
    icon: '📍',
    label: 'Location',
    lines: ['Muyenga', 'Kampala, Uganda'],
    link: 'https://maps.google.com/?q=Muyenga+Kampala+Uganda',
    linkLabel: 'Open in Maps',
  },
]

const SOCIAL_ITEMS = [
  {
    platform: 'Instagram',
    handle: '@haiq_ug',
    url: 'https://instagram.com/haiq_ug',
    icon: '📸',
  },
  {
    platform: 'Facebook',
    handle: 'Haiqafrica',
    url: 'https://facebook.com/Haiqafrica',
    icon: '👥',
  },
  {
    platform: 'TikTok',
    handle: 'Haiqafrica',
    url: 'https://tiktok.com/@Haiqafrica',
    icon: '🎵',
  },
  {
    platform: 'Twitter / X',
    handle: 'Haiqafrica',
    url: 'https://twitter.com/Haiqafrica',
    icon: '🐦',
  },
]

export default function ContactPage() {
  const [form,   setForm]   = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | loading | success | error

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.post('/messages', {
        first_name: form.name.split(' ')[0] || form.name,
        last_name:  form.name.split(' ').slice(1).join(' ') || '',
        email:      form.email,
        body:       form.message,
      })
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-light min-h-screen">

      {/* Hero bar */}
      <div className="bg-dark text-light py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-[0.25em] uppercase mb-3">
            We would love to hear from you
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold">Contact Us</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* ── Left: Contact info ── */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-dark mb-8">Get in Touch</h2>

            {/* Contact items */}
            <div className="space-y-6 mb-12">
              {CONTACT_ITEMS.map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-1">
                      {item.label}
                    </p>
                    {item.lines.map(l => (
                      <p key={l} className="text-dark font-medium">{l}</p>
                    ))}
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="text-sm text-gray-400 hover:text-primary transition mt-0.5 inline-block"
                    >
                      {item.linkLabel} →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
                Follow Us
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_ITEMS.map(s => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-dark group-hover:text-primary transition">
                        {s.platform}
                      </p>
                      <p className="text-[11px] text-gray-400">{s.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="mt-10 p-5 bg-dark rounded-2xl text-light">
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">
                Order Hours
              </p>
              <p>Working Hours: 24/7</p>
              <p className="text-light/40 text-xs mt-3">
                Order before noon for same-day delivery in Kampala.
              </p>
            </div>
          </div>

          {/* ── Right: Message form ── */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-dark mb-8">Send a Message</h2>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">🍪</p>
                <h3 className="font-serif text-xl font-bold text-dark mb-2">Message received!</h3>
                <p className="text-gray-500 text-sm">
                  We will get back to you within a few hours on WhatsApp or email.
                </p>
                <button
                  onClick={() => setStatus(null)}
                  className="mt-5 text-sm text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Amara Nakato"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Ask us anything — about orders, custom cakes, corporate gifting, or just to say hi."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-500">
                    Something went wrong. Please try calling or emailing us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-dark text-light py-4 rounded-xl font-bold hover:bg-primary hover:text-dark transition-all duration-200 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We typically respond within 2–4 hours during business hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
