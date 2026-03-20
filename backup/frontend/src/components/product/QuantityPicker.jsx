export default function QuantityPicker({ quantity, onChange }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Quantity</label>
      <div className="flex items-center border rounded w-fit">
        <button onClick={() => onChange(quantity - 1)} disabled={quantity <= 1} className="px-3 py-1 border-r">-</button>
        <span className="px-4 py-1">{quantity}</span>
        <button onClick={() => onChange(quantity + 1)} className="px-3 py-1 border-l">+</button>
      </div>
    </div>
  )
}