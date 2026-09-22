import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import ProductImageCarousel from '../components/product/ProductImageCarousel'
import SizeSelector from '../components/product/SizeSelector'
import QuantityPicker from '../components/product/QuantityPicker'
import ItemListAccordion from '../components/product/ItemListAccordion'
import RelatedProducts from '../components/product/RelatedProducts'
import ProductReviews from '../components/product/ProductReviews'
import { ProductSEO } from '../components/shared/SEO'
import Container from '../components/shared/Container'
import Button from '../components/shared/Button'
import { Package, UtensilsCrossed, MessageCircle, Lock, AlertTriangle, Check, Share2 } from 'lucide-react'

export default function ProductDetailPage() {
  const { slug }            = useParams()
  const navigate            = useNavigate()
  const [searchParams]      = useSearchParams()
  const autoAddFired        = useRef(false)

  const [product,         setProduct]         = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity,        setQuantity]        = useState(1)
  const [added,           setAdded]           = useState(false)
  const [copied,          setCopied]          = useState(false)

  const { addItem, openDrawer } = useCart()

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    setQuantity(1)

    api.get(`/products/${slug}`)
      .then(res => {
        const p = res.data.product
        setProduct(p)
        const def = p.variants?.find(v => v.is_default) ?? p.variants?.[0]
        setSelectedVariant(def ?? null)
      })
      .catch(() => navigate('/shop', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // ?add=1 share links: auto-add the default variant and open the drawer once.
  useEffect(() => {
    if (searchParams.get('add') !== '1') return
    if (!product || !selectedVariant || autoAddFired.current) return
    autoAddFired.current = true
    addItem(product, selectedVariant, 1)
    openDrawer()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [product, selectedVariant, searchParams, addItem, openDrawer])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    addItem(product, selectedVariant, quantity)
    openDrawer()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const stockQty  = selectedVariant?.stock_qty ?? 0
  const isSoldOut = stockQty === 0
  const isLow     = stockQty > 0 && stockQty <= 3
  const isDrink   = product?.category?.slug === 'drinks'

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: '#0E0600', minHeight: '100vh' }}>
        <Container className="py-12">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square skeleton" style={{ background: 'rgba(166,124,82,0.08)' }} />
            <div className="space-y-4 pt-2">
              <div className="h-5 skeleton rounded" style={{ background: 'rgba(166,124,82,0.08)', width: '25%' }} />
              <div className="h-9 skeleton rounded" style={{ background: 'rgba(166,124,82,0.08)', width: '75%' }} />
              <div className="h-5 skeleton rounded" style={{ background: 'rgba(166,124,82,0.08)', width: '50%' }} />
              <div className="h-7 skeleton rounded" style={{ background: 'rgba(166,124,82,0.08)', width: '33%' }} />
              <div className="h-20 skeleton rounded mt-4" style={{ background: 'rgba(166,124,82,0.08)' }} />
              <div className="h-12 skeleton rounded mt-4" style={{ background: 'rgba(166,124,82,0.08)' }} />
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!product) return null

  return (
    <div style={{ background: '#0E0600', minHeight: '100vh' }}>
      <ProductSEO product={product} />

      {/* Breadcrumb */}
      <Container className="pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs" style={{ color: 'rgba(166,124,82,0.5)' }}>
          <Link to="/" className="transition hover:opacity-80" style={{ color: 'rgba(166,124,82,0.5)' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" className="transition hover:opacity-80" style={{ color: 'rgba(166,124,82,0.5)' }}>Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop/${product.category.slug}`} className="transition hover:opacity-80 capitalize"
                style={{ color: 'rgba(166,124,82,0.5)' }}>
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="line-clamp-1" style={{ color: '#F5EAD8' }}>{product.name}</span>
        </nav>
      </Container>

      {/* Main product section */}
      <Container className="py-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div className="md:sticky md:top-24 self-start">
            <ProductImageCarousel images={product.images} productName={product.name} />
          </div>

          {/* ── Right: Info ── */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 flex-wrap mb-4">
              {product.is_limited && (
                <span className="text-[10px] font-bold px-3 py-1 tracking-widest uppercase"
                  style={{ background: 'rgba(168,85,247,0.85)', color: '#fff' }}>
                  Limited Edition
                </span>
              )}
              {product.is_featured && (
                <span className="text-[10px] font-bold px-3 py-1 tracking-widest uppercase"
                  style={{ background: '#A67C52', color: '#1A0A00' }}>
                  Featured
                </span>
              )}
              {isSoldOut && (
                <span className="text-[10px] font-bold px-3 py-1 tracking-widest uppercase"
                  style={{ background: 'rgba(166,124,82,0.15)', color: 'rgba(245,234,216,0.4)' }}>
                  Sold Out
                </span>
              )}
            </div>

            {/* Name + subtitle */}
            <h1 className="font-serif text-4xl font-bold leading-tight mb-1" style={{ color: '#F5EAD8' }}>
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="text-lg mb-4" style={{ color: 'rgba(166,124,82,0.7)' }}>{product.subtitle}</p>
            )}

            {/* Price */}
            <p className="text-3xl font-bold mb-5" style={{ color: '#A67C52' }}>
              UGX {Number(selectedVariant?.price ?? product.base_price).toLocaleString()}
            </p>

            {/* Description */}
            {product.description && (
              <p className="leading-relaxed mb-6 text-base" style={{ color: 'rgba(245,234,216,0.55)' }}>
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {product.variants?.length > 1 && (
              <SizeSelector
                variants={product.variants}
                selected={selectedVariant}
                onChange={v => { setSelectedVariant(v); setQuantity(1) }}
              />
            )}

            {/* Quantity */}
            {!isSoldOut && (
              <QuantityPicker quantity={quantity} onChange={setQuantity} />
            )}

            {/* Low stock */}
            {isLow && (
              <p className="text-sm font-medium mb-3 flex items-center gap-1.5" style={{ color: '#D97706' }}>
                <AlertTriangle size={14} /> Only {stockQty} left in stock
              </p>
            )}

            {/* Add to cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              variant={isSoldOut ? 'secondary' : 'primary'}
              className={`w-full rounded-2xl mb-4 text-base ${added ? 'bg-green-500 text-white hover:bg-green-500' : ''}`}
              size="lg"
            >
              {isSoldOut
                ? 'Sold Out'
                : added
                  ? <span className="inline-flex items-center gap-1.5"><Check size={18} strokeWidth={2.5} /> Added to Cart</span>
                  : `Add to Cart — UGX ${Number(selectedVariant?.price ?? product.base_price).toLocaleString()}`
              }
            </Button>

            {/* Share link */}
            <button
              onClick={() => {
                const url = `${window.location.origin}/products/${product.slug}?add=1`
                navigator.clipboard.writeText(url).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
              }}
              className="w-full flex items-center justify-center gap-2 mb-4 font-semibold text-[11px] tracking-[0.2em] uppercase py-3 transition-all"
              style={{ border: '1px solid rgba(166,124,82,0.25)', color: copied ? '#A67C52' : 'rgba(245,234,216,0.35)' }}
            >
              {copied
                ? <><Check size={13} strokeWidth={2.5} /> Link copied</>
                : <><Share2 size={13} /> Share &amp; add to cart</>
              }
            </button>

            {/* Tasting notes */}
            {product.tasting_notes && (
              <div className="rounded-none p-5 mb-5" style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.2)' }}>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#A67C52' }}>
                  Tasting Notes
                </p>
                <p className="text-sm leading-relaxed italic font-serif text-base" style={{ color: 'rgba(245,234,216,0.75)' }}>
                  "{product.tasting_notes}"
                </p>
              </div>
            )}

            {/* What's in the box / Ingredients */}
            <ItemListAccordion items={product.items} title={isDrink ? 'Ingredients' : "What's in the box"} />

            {/* Trust signals */}
            <div className="mt-6 pt-5 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(166,124,82,0.15)' }}>
              {[
                [Package,         'Same-day delivery in Kampala'],
                [UtensilsCrossed, isDrink ? 'Crafted fresh daily' : 'Baked fresh daily'],
                [MessageCircle,   'WhatsApp order updates'],
                [Lock,            'Secure checkout'],
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={14} style={{ color: '#A67C52', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: 'rgba(245,234,216,0.4)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        <RelatedProducts categorySlug={product.category?.slug} currentId={product.id} />

        {/* Reviews */}
        <ProductReviews productSlug={product.slug} />
      </Container>
    </div>
  )
}
