import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import api from '../../services/api'

export default function RelatedProducts({ categorySlug, currentId }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false)
      return
    }
    // ✅ Fixed: properly formed template literal URL
    api.get(`/products?category=${categorySlug}&limit=4`)
      .then(res => {
        const all = res.data.products || []
        setProducts(all.filter(p => p.id !== currentId).slice(0, 3))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [categorySlug, currentId])

  if (!loading && products.length === 0) return null

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif font-bold mb-6">You might also like</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array(3).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </div>
  )
}
