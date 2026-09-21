import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import ProductCardSkeleton from '../product/ProductCardSkeleton'
import api from '../../services/api'

// Replaces FeaturedCollections + CoreCollectionCarousel (phase 2 — merge
// the two competing home-page product sections into one, shown immediately
// after the hero so a first-time visitor sees the full menu without
// scrolling past a full viewport of hero-only content).
export default function CoreCollection() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/products?limit=50')
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 md:py-20" style={{ background: '#0E0600' }} id="core-collection">
      <div className="container mx-auto px-6 md:px-16">

        {/* Section header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Our full range, first
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-light">
              Core Collection
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 text-light font-medium text-sm hover:text-primary transition group"
          >
            View all
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid — every active product, immediately, no carousel hiding inventory */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {loading
            ? Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>

        {/* Mobile view-all link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-primary/40 text-light px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-dark transition"
          >
            View all products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
