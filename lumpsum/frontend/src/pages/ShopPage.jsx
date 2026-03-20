import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'
import api from '../services/api'

const CATEGORIES = [
  { slug: '',           label: 'All' },
  { slug: 'cakes',      label: 'Cakes' },
  { slug: 'pastries',   label: 'Pastries' },
  { slug: 'bread',      label: 'Bread' },
  { slug: 'cookies',    label: 'Cookies' },
  { slug: 'gift-boxes', label: 'Gift Boxes' },
]

export default function ShopPage() {
  const { category }           = useParams()
  const [searchParams]         = useSearchParams()
  const categoryFilter         = category || searchParams.get('category') || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(true)

  // Reset to page 1 whenever category changes
  useEffect(() => { setPage(1); setProducts([]) }, [categoryFilter])

  useEffect(() => {
    setLoading(true)

    // ✅ Fixed: build URLSearchParams properly, then pass as string
    const params = new URLSearchParams({ page, limit: 12 })
    if (categoryFilter) params.set('category', categoryFilter)

    api.get(`/products?${params.toString()}`)
      .then(res => {
        const incoming = res.data.products || []
        setProducts(prev => page === 1 ? incoming : [...prev, ...incoming])
        setHasMore(incoming.length === 12)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [page, categoryFilter])

  const loadMore = () => setPage(p => p + 1)

  const activeLabel = CATEGORIES.find(c => c.slug === categoryFilter)?.label || 'All'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page heading */}
      <h1 className="text-3xl font-serif font-bold mb-6">
        Shop{categoryFilter ? ` — ${activeLabel}` : ''}
      </h1>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.slug}
            to={cat.slug ? `/shop/${cat.slug}` : '/shop'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              categoryFilter === cat.slug
                ? 'bg-primary text-dark border-primary'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
        {loading && Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
      </div>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products found in this category.</p>
          <Link to="/shop" className="text-primary mt-2 inline-block hover:underline">
            View all products
          </Link>
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            className="bg-primary text-dark px-8 py-3 rounded font-medium hover:bg-primary/80 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
