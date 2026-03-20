import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useState, useRef, useEffect } from 'react'
import VariantPickerModal from './VariantPickerModal'

export default function ProductCard({ product, index = 0 }) {
  const [imgSrc,       setImgSrc]       = useState(product.images?.[0]?.url || '/placeholder-product.webp')
  const [imgSrc2]                       = useState(product.images?.[1]?.url || null)
  const [hovered,      setHovered]      = useState(false)
  const [added,        setAdded]        = useState(false)
  const [visible,      setVisible]      = useState(false)
  const [showPicker,   setShowPicker]   = useState(false) // variant modal

  const { addItem, openDrawer } = useCart()

  const nodeRef = useRef(null)
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const variants    = product.variants ?? []
  const hasMultiple = variants.length > 1
  const defaultV    = variants.find(v => v.is_default) ?? variants[0]
  const stockQty    = defaultV?.stock_qty ?? 0
  const isSoldOut   = stockQty === 0
  const isLow       = stockQty > 0 && stockQty <= 3

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSoldOut) return

    if (hasMultiple) {
      // Open variant picker — let user choose size first
      setShowPicker(true)
      return
    }

    // Single variant — add directly
    addItem(product, defaultV, 1)
    openDrawer()
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <div
        ref={nodeRef}
        className="h-full transition-all duration-700"
        style={{
          opacity:         visible ? 1 : 0,
          transform:       visible ? 'translateY(0)' : 'translateY(28px)',
          transitionDelay: `${index * 70}ms`,
        }}
      >
        <Link
          to={`/products/${product.slug}`}
          className="block h-full group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex flex-col h-full bg-light rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">

            {/* ── Square image ── */}
            <div className="relative w-full aspect-square bg-[#F0EBE3] overflow-hidden flex-shrink-0">
              <img
                src={imgSrc}
                alt={product.name}
                onError={() => setImgSrc('/placeholder-product.webp')}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                style={{
                  transform: hovered && imgSrc2 ? 'scale(1.03)' : 'scale(1)',
                  opacity:   hovered && imgSrc2 ? 0 : 1,
                }}
                loading="lazy"
              />
              {imgSrc2 && (
                <img
                  src={imgSrc2}
                  alt={`${product.name} view 2`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                  style={{
                    transform: hovered ? 'scale(1.03)' : 'scale(1.08)',
                    opacity:   hovered ? 1 : 0,
                  }}
                  loading="lazy"
                />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.is_limited && (
                  <span className="bg-dark text-primary text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">Limited</span>
                )}
                {product.is_featured && !product.is_limited && (
                  <span className="bg-primary text-dark text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">Featured</span>
                )}
                {isSoldOut && (
                  <span className="bg-gray-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">Sold Out</span>
                )}
              </div>

              {/* Multiple sizes indicator */}
              {hasMultiple && !isSoldOut && (
                <div className="absolute bottom-3 right-3 bg-dark/75 backdrop-blur-sm text-light text-[10px] font-bold px-2 py-1 rounded-full z-10">
                  {variants.length} sizes
                </div>
              )}

              {isLow && (
                <div className="absolute bottom-0 left-0 right-0 bg-dark/75 backdrop-blur-sm px-3 py-1.5 z-10">
                  <p className="text-primary text-[10px] font-semibold text-center tracking-wide">
                    Only {stockQty} remaining
                  </p>
                </div>
              )}
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 p-4">
              <div className="flex-1 mb-3">
                <h3 className="font-serif font-bold text-dark text-[15px] leading-snug line-clamp-1 mb-0.5">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-1 mb-2">
                  {product.subtitle || '\u00A0'}
                </p>
                <p className="text-primary font-bold text-sm mb-2">
                  {hasMultiple
                    ? `From UGX ${Math.min(...variants.map(v => Number(v.price))).toLocaleString()}`
                    : `UGX ${Number(defaultV?.price ?? product.base_price).toLocaleString()}`
                  }
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 min-h-[2.4em]">
                  {product.items?.length
                    ? product.items.slice(0, 3).map(i => i.label).join(' · ')
                    : '\u00A0'
                  }
                </p>
              </div>

              {/* Button */}
              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className={`
                  mt-auto w-full py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-200 active:scale-[0.97]
                  ${isSoldOut
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : added
                      ? 'bg-green-500 text-white'
                      : 'bg-dark text-light hover:bg-primary hover:text-dark'
                  }
                `}
              >
                {isSoldOut
                  ? 'Sold Out'
                  : added
                    ? '✓ Added'
                    : hasMultiple
                      ? 'Choose Size →'
                      : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Variant picker modal */}
      {showPicker && (
        <VariantPickerModal
          product={product}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
