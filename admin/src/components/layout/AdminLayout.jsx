import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

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
  const location = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Admin'

  return (
    <div className="flex overflow-hidden" style={{ background: '#0E0600', height: '100svh' }}>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3.5 flex-shrink-0"
          style={{ background: '#1A0A00', borderBottom: '1px solid rgba(61,32,0,0.8)' }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
              aria-label="Open menu"
            >
              <span className="block w-5 h-px" style={{ background: 'rgba(242,234,216,0.5)' }} />
              <span className="block w-5 h-px" style={{ background: 'rgba(242,234,216,0.5)' }} />
              <span className="block w-5 h-px" style={{ background: 'rgba(242,234,216,0.5)' }} />
            </button>
            <h1 className="font-serif text-lg font-bold" style={{ color: '#F2EAD8' }}>{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
              style={{ color: '#8C7355' }}
            >
              ↗ View Store
            </a>
            <div className="w-px h-4" style={{ background: 'rgba(61,32,0,0.8)' }} />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] hidden sm:block" style={{ color: '#8C7355' }}>Live</span>
            </div>
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
