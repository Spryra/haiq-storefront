import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '▦'  },
  { to: '/orders',       label: 'Orders',       icon: '📦' },
  { to: '/products',     label: 'Products',     icon: '🍪' },
  { to: '/messages',     label: 'Messages',     icon: '💬' },
  { to: '/loyalty',      label: 'Loyalty',      icon: '🃏' },
  { to: '/newsletter',   label: 'Newsletter',   icon: '✉'  },
  { to: '/special-days', label: 'Special Days', icon: '⭐' },
]

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/orders':       'Orders',
  '/products':     'Products',
  '/messages':     'Messages',
  '/loyalty':      'Loyalty Cards',
  '/newsletter':   'Newsletter',
  '/special-days': 'Special Days',
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const title = Object.entries(PAGE_TITLES).find(([p]) =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  )?.[1] ?? 'Admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ background: '#0E0600', minHeight: '100svh' }} className="flex flex-col lg:flex-row">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ background: '#1A0A00', borderRight: '1px solid rgba(61,32,0,0.8)', minHeight: '100svh' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
          {/* Crown SVG inline for distinction */}
          <svg width="18" height="13" viewBox="0 0 220 158" fill="none" aria-hidden="true" className="flex-shrink-0">
            <path d="M32 130 Q110 122 188 130" stroke="#B8752A" strokeWidth="8" strokeLinecap="round"/>
            <path d="M32 130 L22 58" stroke="#B8752A" strokeWidth="7" strokeLinecap="round"/>
            <path d="M22 58 Q18 42 28 36 Q40 30 46 44 Q50 54 44 62" stroke="#B8752A" strokeWidth="6" strokeLinecap="round"/>
            <path d="M44 62 Q62 100 82 66" stroke="#B8752A" strokeWidth="7" strokeLinecap="round"/>
            <path d="M82 66 Q110 10 138 66" stroke="#B8752A" strokeWidth="8" strokeLinecap="round"/>
            <path d="M138 66 Q158 100 176 62" stroke="#B8752A" strokeWidth="7" strokeLinecap="round"/>
            <path d="M176 62 Q184 52 198 58 L188 130" stroke="#B8752A" strokeWidth="7" strokeLinecap="round"/>
            <path d="M198 58 Q204 42 194 36 Q182 30 176 44 Q172 54 178 62" stroke="#B8752A" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <div className="min-w-0">
            <p className="font-serif font-bold text-sm leading-none" style={{ color: '#E8C88A' }}>HAIQ</p>
            <p className="text-[9px] tracking-[0.25em] uppercase mt-0.5" style={{ color: '#8C7355' }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
              style={({ isActive }) => ({
                background:  isActive ? 'rgba(232,200,138,0.08)' : 'transparent',
                borderLeft:  isActive ? '2px solid #E8C88A'      : '2px solid transparent',
                color:       isActive ? '#E8C88A'                 : 'rgba(242,234,216,0.45)',
                textDecoration: 'none',
              })}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}>
          <p className="text-xs font-medium truncate mb-1" style={{ color: '#F2EAD8' }}>{admin?.full_name || 'Admin'}</p>
          <p className="text-[10px] truncate mb-3" style={{ color: '#8C7355' }}>{admin?.email}</p>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-xs transition-colors hover:opacity-70"
            style={{ color: '#8C7355' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — mobile + desktop */}
        <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: '#1A0A00', borderBottom: '1px solid rgba(61,32,0,0.8)' }}>

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex flex-col gap-1.5 p-1 flex-shrink-0"
            style={{ color: 'rgba(242,234,216,0.6)' }}>
            <span className="block w-5 h-px bg-current" />
            <span className="block w-5 h-px bg-current" />
            <span className="block w-5 h-px bg-current" />
          </button>

          <h1 className="font-serif font-bold text-lg flex-1 truncate" style={{ color: '#F2EAD8' }}>{title}</h1>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="https://haiqweb.vercel.app" target="_blank" rel="noreferrer"
              className="hidden sm:block text-xs hover:opacity-80 transition" style={{ color: '#8C7355' }}>
              View Store
            </a>
            <div className="w-px h-4" style={{ background: 'rgba(61,32,0,0.8)' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* ── Mobile bottom navigation ── */}
        <nav className="lg:hidden flex-shrink-0"
          style={{ background: '#1A0A00', borderTop: '1px solid rgba(61,32,0,0.8)' }}>
          <div className="flex items-center justify-around">
            {NAV.slice(0, 5).map(item => (
              <NavLink key={item.to} to={item.to}
                className="flex flex-col items-center gap-0.5 py-2.5 px-2 flex-1 text-center"
                style={({ isActive }) => ({
                  color:          isActive ? '#B8752A' : 'rgba(242,234,216,0.4)',
                  textDecoration: 'none',
                })}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[9px] font-semibold tracking-wide leading-none mt-0.5">{item.label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Mobile slide-in sidebar (for extra nav items) ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden"
            style={{ background: '#1A0A00', borderRight: '1px solid rgba(61,32,0,0.8)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
              <p className="font-serif font-bold" style={{ color: '#E8C88A' }}>HAIQ Admin</p>
              <button onClick={() => setSidebarOpen(false)} className="text-xl" style={{ color: '#8C7355' }}>x</button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {NAV.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium"
                  style={({ isActive }) => ({
                    background:  isActive ? 'rgba(232,200,138,0.08)' : 'transparent',
                    borderLeft:  isActive ? '2px solid #E8C88A'      : '2px solid transparent',
                    color:       isActive ? '#E8C88A'                 : 'rgba(242,234,216,0.5)',
                    textDecoration: 'none',
                  })}>
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}>
              <button onClick={handleLogout} className="text-sm w-full text-left py-2"
                style={{ color: '#f87171' }}>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
