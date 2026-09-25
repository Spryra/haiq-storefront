import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/reset-password']

// Persistent phone/tablet cart bar: once something is in the cart, checkout is
// always one tap away while browsing. The spacer keeps it from covering the footer.
export default function MobileCartBar() {
  const { itemCount, subtotal, drawerOpen, openDrawer } = useCart()
  const { pathname } = useLocation()

  if (itemCount === 0 || HIDDEN_ON.includes(pathname)) return null

  return (
    <div className="lg:hidden">
      <div style={{ height: 68 }} aria-hidden="true" />
      {!drawerOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{
            background: '#1A0A00',
            borderTop: '1px solid rgba(166,124,82,0.35)',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <button
            onClick={openDrawer}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            aria-label="View cart"
          >
            <span className="relative flex-shrink-0">
              <ShoppingBag size={22} style={{ color: '#A67C52' }} />
              <span
                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#A67C52', color: '#1A0A00' }}
              >
                {itemCount}
              </span>
            </span>
            <span className="truncate">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,234,216,0.5)' }}>
                Your cart
              </span>
              <span className="block text-sm font-bold" style={{ color: '#F5EAD8' }}>
                UGX {Number(subtotal).toLocaleString()}
              </span>
            </span>
          </button>
          <Link
            to="/checkout"
            className="flex-shrink-0 font-bold text-[11px] tracking-[0.22em] uppercase px-6 py-3"
            style={{ background: '#A67C52', color: '#1A0A00' }}
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  )
}
