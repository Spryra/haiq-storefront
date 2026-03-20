import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useState, useEffect } from 'react'
import adminApi from '../../services/adminApi'
import Crown from '../shared/Crown'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '▦'  },
  { to: '/orders',       label: 'Orders',       icon: '📦' },
  { to: '/products',     label: 'Products',     icon: '🍪' },
  { to: '/messages',     label: 'Messages',     icon: '💬' },
  { to: '/loyalty',      label: 'Loyalty Cards',icon: '🃏' },
  { to: '/newsletter',   label: 'Newsletter',   icon: '✉'  },
  { to: '/special-days', label: 'Special Days', icon: '⭐' },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { admin, logout } = useAdminAuth()
  const navigate          = useNavigate()

  const [pendingOrders,  setPendingOrders]  = useState(0)
  const [pendingLoyalty, setPendingLoyalty] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    adminApi.get('/admin/analytics/summary')
      .then(res => {
        setPendingOrders(res.data.pending_orders || 0)
      })
      .catch(() => {})

    adminApi.get('/admin/loyalty?status=pending')
      .then(res => setPendingLoyalty(res.data.cards?.length || 0))
      .catch(() => {})

    adminApi.get('/admin/messages')
      .then(res => {
        const unread = (res.data.messages || []).filter(m => !m.is_read).length
        setUnreadMessages(unread)
      })
      .catch(() => {})
  }, [])

  const getBadge = (label) => {
    if (label === 'Orders'        && pendingOrders  > 0) return pendingOrders
    if (label === 'Messages'      && unreadMessages > 0) return unreadMessages
    if (label === 'Loyalty Cards' && pendingLoyalty > 0) return pendingLoyalty
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col w-60',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        ].join(' ')}
        style={{ background: '#1A0A00', borderRight: '1px solid rgba(61,32,0,0.8)' }}
      >

        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}
        >
          <img src="/HAIQmain.png" alt="HAIQ" className="h-8 w-auto flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-serif font-bold text-sm leading-none" style={{ color: '#E8C88A' }}>HAIQ</p>
            <p className="text-[9px] tracking-[0.25em] uppercase mt-0.5" style={{ color: '#8C7355' }}>Admin Panel</p>
          </div>
          {/* Mobile close */}
          <button onClick={onClose} className="ml-auto lg:hidden text-lg" style={{ color: '#8C7355' }} aria-label="Close menu">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map(item => {
            const badge = getBadge(item.label)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => [
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'text-gold'
                    : 'hover:text-zinc-100',
                ].join(' ')}
                style={({ isActive }) => ({
                  background:   isActive ? 'rgba(232,200,138,0.08)' : 'transparent',
                  borderLeft:   isActive ? '2px solid #E8C88A'      : '2px solid transparent',
                  color:        isActive ? '#E8C88A'                 : 'rgba(242,234,216,0.5)',
                })}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {badge && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#B8752A', color: '#1A0A00' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(232,200,138,0.15)', color: '#E8C88A' }}
            >
              {admin?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#F2EAD8' }}>
                {admin?.full_name ?? 'Admin'}
              </p>
              <p className="text-[10px] truncate" style={{ color: '#8C7355' }}>{admin?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-all"
            style={{ color: 'rgba(242,234,216,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(242,234,216,0.35)'}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
