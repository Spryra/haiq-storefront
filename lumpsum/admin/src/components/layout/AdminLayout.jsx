// AdminLayout.jsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV = [
  { to: '/',             label: 'Dashboard',    icon: '⬛' },
  { to: '/orders',       label: 'Orders',       icon: '📦' },
  { to: '/products',     label: 'Products',     icon: '🍪' },
  { to: '/messages',     label: 'Messages',     icon: '💬' },
  { to: '/analytics',    label: 'Analytics',    icon: '📊' },
  { to: '/loyalty',      label: 'Loyalty',      icon: '👑' },
  { to: '/newsletter',   label: 'Newsletter',   icon: '📧' },
  { to: '/special-days', label: 'Special Days', icon: '📅' },
  { to: '/reviews',      label: 'Reviews',      icon: '⭐' },
]

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth()
  const navigate          = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-ink text-light">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col bg-panel border-r border-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        } flex-shrink-0`}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <span className="font-serif font-bold text-primary text-lg tracking-widest">HAIQ</span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-light/40 hover:text-primary transition ml-auto"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150
                 ${isActive
                   ? 'bg-primary/15 text-primary border-r-2 border-primary'
                   : 'text-light/50 hover:text-light hover:bg-surface'
                 }`
              }
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: admin info + logout */}
        <div className="border-t border-border p-4">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-light/60 text-xs truncate">{admin?.full_name || 'Admin'}</p>
              <p className="text-primary/60 text-[10px] uppercase tracking-wider">{admin?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left text-light/30 hover:text-red-400 text-xs transition-colors"
          >
            {collapsed ? '⏏' : 'Log out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="h-16 bg-panel border-b border-border flex items-center px-6 justify-between sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-light/40 text-xs hidden sm:block">
              {admin?.email}
            </span>
            <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">
              {(admin?.full_name || 'A')[0].toUpperCase()}
            </span>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
