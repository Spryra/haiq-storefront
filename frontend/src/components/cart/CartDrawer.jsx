import { useCart } from '../../context/CartContext'
import CartLineItem from './CartLineItem'
import { Link } from 'react-router-dom'

export default function CartDrawer() {
  const { isOpen, closeDrawer, items, subtotal } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={closeDrawer}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-light text-dark shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={closeDrawer} className="text-2xl">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            items.map(item => <CartLineItem key={item.variantId} item={item} />)
          )}
        </div>
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-light">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Subtotal</span>
              <span>UGX {subtotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={closeDrawer}>
              <button className="w-full bg-primary text-dark py-3 rounded font-bold hover:bg-primary/80">
                Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}