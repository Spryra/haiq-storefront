import { useCart } from '../../context/CartContext'

export default function CartSummary() {
  const { subtotal } = useCart()
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between font-bold">
        <span>Subtotal</span>
        <span>UGX {subtotal.toLocaleString()}</span>
      </div>
    </div>
  )
}