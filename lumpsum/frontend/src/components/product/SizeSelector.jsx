export default function SizeSelector({ variants, selected, onChange }) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Size</label>
      <div className="flex flex-wrap gap-2">
        {variants.map(v => (
          <button
            key={v.id}
            onClick={() => onChange(v)}
            // ✅ Fixed: properly formed template literal for conditional className
            className={`px-4 py-2 border rounded transition ${
              selected?.id === v.id
                ? 'bg-primary text-dark border-primary font-semibold'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            {v.label} – UGX {Number(v.price).toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  )
}
