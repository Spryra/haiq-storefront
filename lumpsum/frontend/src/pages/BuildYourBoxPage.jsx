import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

const BOX_SIZES = [
  { slots: 4,  label: '4-Piece Box',  price: 40000,  description: 'Perfect for a personal treat' },
  { slots: 8,  label: '8-Piece Box',  price: 75000,  description: 'Great for sharing or gifting' },
  { slots: 12, label: '12-Piece Box', price: 108000, description: 'The full experience' },
]

function ProductChip({ product, selected, count, onAdd, onRemove, disabled }) {
  const variant  = product.variants?.find(v => v.is_default) ?? product.variants?.[0]
  const isSoldOut = (variant?.stock_qty ?? 0) === 0

  return (
    <div className={`
      relative rounded-2xl overflow-hidden border-2 transition-all duration-200
      ${selected > 0 ? 'border-dark shadow-lg' : 'border-transparent'}
      ${isSoldOut ? 'opacity-50' : ''}
    `}>
      {/* Image */}
      <div className="aspect-square bg-[#F0EBE3] relative">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍪</div>
        )}
        {/* Count bubble */}
        {selected > 0 && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-dark text-light rounded-full flex items-center justify-center text-sm font-bold shadow">
            {selected}
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-white p-3">
        <p className="font-serif font-bold text-dark text-xs leading-snug line-clamp-1 mb-1">{product.name}</p>
        <p className="text-[10px] text-gray-400 mb-2">
          UGX {Number(variant?.price ?? product.base_price).toLocaleString()}
        </p>

        {/* +/- controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onRemove}
            disabled={selected === 0}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-dark font-bold text-sm hover:bg-gray-200 transition disabled:opacity-30"
          >
            −
          </button>
          <span className="text-sm font-bold text-dark w-6 text-center">{selected}</span>
          <button
            onClick={onAdd}
            disabled={disabled || isSoldOut}
            className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center text-light font-bold text-sm hover:bg-primary hover:text-dark transition disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BuildYourBoxPage() {
  const navigate = useNavigate()
  const { addItem, openDrawer } = useCart()

  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [boxSize,    setBoxSize]    = useState(null)        // selected BOX_SIZES entry
  const [selections, setSelections] = useState({})          // { [product.id-variant.id]: count }
  const [step,       setStep]       = useState('size')      // size | pick

  useEffect(() => {
    api.get('/products?limit=50')
      .then(res => setProducts(res.data.products?.filter(p => p.is_active !== false) || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalSelected = Object.values(selections).reduce((s, n) => s + n, 0)
  const remaining     = boxSize ? boxSize.slots - totalSelected : 0
  const isFull        = remaining === 0
  const pct           = boxSize ? Math.round((totalSelected / boxSize.slots) * 100) : 0

  const getKey = (product) => {
    const variant = product.variants?.find(v => v.is_default) ?? product.variants?.[0]
    return `${product.id}__${variant?.id}`
  }

  const add = (product) => {
    if (isFull) return
    const key = getKey(product)
    setSelections(s => ({ ...s, [key]: (s[key] || 0) + 1 }))
  }

  const remove = (product) => {
    const key = getKey(product)
    setSelections(s => {
      const next = { ...s, [key]: Math.max(0, (s[key] || 0) - 1) }
      if (next[key] === 0) delete next[key]
      return next
    })
  }

  const addBoxToCart = () => {
    // Add each selected item individually to cart
    products.forEach(product => {
      const key   = getKey(product)
      const count = selections[key] || 0
      if (count > 0) {
        const variant = product.variants?.find(v => v.is_default) ?? product.variants?.[0]
        if (variant) addItem(product, variant, count)
      }
    })
    openDrawer()
    navigate('/checkout')
  }

  // ── Size selection screen ─────────────────────────────────────────────────
  if (step === 'size') {
    return (
      <div className="bg-light min-h-screen">
        <div className="bg-dark text-light py-16">
          <div className="container mx-auto px-6 text-center">
            <p className="text-primary text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              Make it yours
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Build Your Box</h1>
            <p className="text-light/60 max-w-md mx-auto">
              Pick your favourite HAIQ products and build a custom box — perfect for yourself or as a gift.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16">
          <h2 className="font-serif text-2xl font-bold text-dark text-center mb-10">
            First, choose your box size
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {BOX_SIZES.map(size => (
              <button
                key={size.slots}
                onClick={() => { setBoxSize(size); setStep('pick') }}
                className="group p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-dark transition-all text-left hover:shadow-xl"
              >
                <div className="text-4xl mb-4">📦</div>
                <p className="font-serif font-bold text-dark text-xl mb-1">{size.label}</p>
                <p className="text-gray-400 text-sm mb-4">{size.description}</p>
                <p className="text-primary font-bold text-xl">UGX {size.price.toLocaleString()}</p>
                <div className="mt-4 w-full py-2 rounded-xl bg-gray-100 group-hover:bg-dark group-hover:text-light transition text-center text-sm font-semibold text-dark">
                  Choose {size.slots} items →
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Product picker screen ─────────────────────────────────────────────────
  return (
    <div className="bg-light min-h-screen">
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep('size'); setSelections({}) }}
                className="text-xs text-gray-400 hover:text-dark transition"
              >
                ← Change size
              </button>
              <span className="text-sm font-bold text-dark">{boxSize?.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${isFull ? 'text-green-600' : 'text-dark'}`}>
                {totalSelected} / {boxSize?.slots} items
              </span>
              {isFull && (
                <button
                  onClick={addBoxToCart}
                  className="bg-primary text-dark px-4 py-1.5 rounded-full font-bold text-sm hover:bg-primary/90 transition animate-pulse"
                >
                  Add to Cart →
                </button>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {!isFull && (
            <p className="text-xs text-gray-400 mt-1">
              {remaining} more {remaining === 1 ? 'item' : 'items'} to go
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <h2 className="font-serif text-2xl font-bold text-dark mb-6">
          Choose your {boxSize?.slots} items
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill(null).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-200 skeleton" />
                <div className="bg-white p-3 space-y-2">
                  <div className="h-3 bg-gray-200 skeleton rounded w-3/4" />
                  <div className="h-7 bg-gray-200 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => {
              const key = getKey(product)
              const count = selections[key] || 0
              return (
                <ProductChip
                  key={product.id}
                  product={product}
                  selected={count}
                  onAdd={() => add(product)}
                  onRemove={() => remove(product)}
                  disabled={isFull && count === 0}
                />
              )
            })}
          </div>
        )}

        {/* Bottom CTA (full box) */}
        {isFull && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
            <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-dark">{boxSize?.label} — {boxSize?.slots} items</p>
                <p className="text-xs text-gray-400">{totalSelected} items selected · Ready to checkout</p>
              </div>
              <button
                onClick={addBoxToCart}
                className="bg-primary text-dark px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition whitespace-nowrap"
              >
                Add to Cart →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
