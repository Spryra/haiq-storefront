import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import CartDrawer from './CartDrawer'

const PROMO_MESSAGES = [
  'Made For You — Baked Fresh Every Morning in Kampala',
  'Venom · Coconut · Crimson Sin · Campfire After Dark · Blackout',
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bannerShown, setBannerShown] = useState(true)
  const [promoIdx, setPromoIdx] = useState(0)
  const [promoVisible, setPromoVisible] = useState(true)

  const fixedRef = useRef(null)
  const [spacerH, setSpacerH] = useState(0)

  // Shared with every "Add to Cart" button across the app — previously this
  // was a local useState, so openDrawer() calls elsewhere had no effect on
  // the drawer actually rendered here. Now wired to the one source of truth.
  const { itemCount, drawerOpen, openDrawer, closeDrawer } = useCart()
  const { user } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const updateSpacer = useCallback(() => {
    if (fixedRef.current) {
      const h = fixedRef.current.offsetHeight
      setSpacerH(h)
      // Expose the real, measured nav height as a CSS variable so any page
      // (e.g. the home hero, which renders under the fixed nav instead of
      // using the spacer div below) can size its own top padding to match —
      // instead of guessing a fixed value that breaks whenever the promo
      // banner is shown/dismissed or the nav wraps to a different height.
      document.documentElement.style.setProperty('--nav-height', `${h}px`)
    }
  }, [])

  useLayoutEffect(() => {
    updateSpacer()
    window.addEventListener('resize', updateSpacer)
    return () => window.removeEventListener('resize', updateSpacer)
  }, [updateSpacer, bannerShown, menuOpen])

  const dismissBanner = () => {
    setBannerShown(false)
    setTimeout(updateSpacer, 50)
  }

  useEffect(() => {
    if (!bannerShown) return
    const t = setInterval(() => {
      setPromoVisible(false)
      setTimeout(() => {
        setPromoIdx(i => (i + 1) % PROMO_MESSAGES.length)
        setPromoVisible(true)
      }, 300)
    }, 4500)
    return () => clearInterval(t)
  }, [bannerShown])

  const isDark = !isHomePage || scrolled
  const textColor = (active) =>
    active
      ? '#A67C52'
      : (isDark ? 'rgba(245,234,216,0.6)' : 'rgba(245,234,216,0.8)')

  const hoverStyle = {
    onMouseEnter: e => e.currentTarget.style.color = '#F5EAD8',
    onMouseLeave: e => e.currentTarget.style.color = textColor(false),
  }

  return (
    <>
      <div
        ref={fixedRef}
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: isDark ? 'rgba(26,10,0,0.97)' : 'transparent',
          borderBottom: isDark ? '1px solid rgba(166,124,82,0.2)' : 'none',
          backdropFilter: isDark ? 'blur(8px)' : 'none',
        }}
      >
        <div style={{ height: '1px', background: 'rgba(166,124,82,0.3)' }} />

        {bannerShown && (
          <div
            className="relative overflow-hidden"
            style={{
              background: isDark ? 'rgba(61,32,0,0.95)' : '#A67C52',
              borderBottom: '1px solid rgba(166,124,82,0.15)',
            }}
          >
            <div className="container mx-auto px-12 py-2 flex items-center justify-center">
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-center transition-opacity duration-300"
                style={{
                  color: isDark ? '#D4C4A8' : '#1A0A00',
                  opacity: promoVisible ? 1 : 0,
                }}
              >
                {PROMO_MESSAGES[promoIdx]}
              </p>
            </div>
            <button
              onClick={dismissBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold leading-none transition-opacity hover:opacity-60"
              style={{ color: isDark ? '#8C7355' : '#1A0A00' }}
            >
              ×
            </button>
          </div>
        )}

        <div className="container mx-auto px-6 md:px-16">
          <div className="flex items-center justify-between" style={{ height: '84px' }}>

            {/* LEFT NAV */}
            <div className="hidden md:flex items-center gap-8">
              {[
                ['/', 'Home'], // ✅ ADDED
                ['/shop', 'Shop'],
                ['/build-your-box', 'Build Your Box'],
                ['/faq', 'FAQ'],
              ].map(([href, label]) => (
                <NavLink
                  key={href}
                  to={href}
                  style={({ isActive }) => ({
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: textColor(isActive),
                    transition: 'color 0.2s',
                    textDecoration: 'none',
                  })}
                  {...hoverStyle}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* LOGO */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/HAIQmain.png" alt="HAIQ" className="h-12 md:h-14 w-auto object-contain" />
            </Link>

            {/* RIGHT NAV */}
            <div className="hidden md:flex items-center gap-6">
              {[
                ['/contact', 'Contact'],
                [user ? '/account' : '/login', user ? 'Account' : 'Sign In'],
              ].map(([href, label]) => (
                <NavLink
                  key={href}
                  to={href}
                  style={({ isActive }) => ({
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: textColor(isActive),
                    transition: 'color 0.2s',
                    textDecoration: 'none',
                  })}
                  {...hoverStyle}
                >
                  {label}
                </NavLink>
              ))}

              <button
                onClick={openDrawer}
                className="relative transition-colors"
                style={{ color: textColor(false) }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>

                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#A67C52', color: '#1A0A00' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* MOBILE */}
            <div className="flex md:hidden items-center gap-4 ml-auto">
              <button onClick={openDrawer} className="relative"
                style={{ color: 'rgba(245,234,216,0.7)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#A67C52', color: '#1A0A00' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button onClick={() => setMenuOpen(o => !o)}
                className="flex flex-col gap-1.5 p-1"
                style={{ color: 'rgba(245,234,216,0.7)' }}>
                <span className={`block w-5 h-px bg-current ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-px bg-current ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-px bg-current ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: menuOpen ? '360px' : '0',
            opacity: menuOpen ? 1 : 0,
            background: 'rgba(26,10,0,0.98)',
          }}
        >
          <div className="container mx-auto px-6 py-6 flex flex-col gap-5">
            {[
              ['/', 'Home'], // ✅ ADDED
              ['/shop', 'Shop'],
              ['/build-your-box', 'Build Your Box'],
              ['/faq', 'FAQ'],
              ['/contact', 'Contact'],
              [user ? '/account' : '/login', user ? 'Account' : 'Sign In'],
            ].map(([href, label]) => (
              <Link key={href} to={href}
                className="text-[12px] font-semibold tracking-[0.25em] uppercase"
                style={{ color: 'rgba(245,234,216,0.6)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {!isHomePage && <div style={{ height: `${spacerH}px` }} />}

      <CartDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  )
}