// ProductsPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/products')
      .then(res => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (product) => {
    setToggling(product.id)
    try {
      await adminApi.put(`/admin/products/${product.id}`, { is_active: !product.is_active })
      load()
    } catch (e) { console.error(e) }
    finally { setToggling(null) }
  }

  const toggleBox = async (product) => {
    setToggling(product.id)
    try {
      await adminApi.put(`/admin/products/${product.id}`, { is_box_item: !product.is_box_item })
      load()
    } catch (e) { console.error(e) }
    finally { setToggling(null) }
  }

  const fmt = n => Number(n || 0).toLocaleString()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">Manage</p>
        <h1 className="font-serif font-bold text-light text-3xl">Products</h1>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-light/40 text-[10px] uppercase tracking-widest">
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Off-Peak Price</th>
                <th className="text-left px-5 py-3">Sold</th>
                <th className="text-left px-5 py-3">Box Item</th>
                <th className="text-left px-5 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(6).fill(null).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array(6).fill(null).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 skeleton-dark rounded w-24" />
                    </td>
                  ))}
                </tr>
              )) : products.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-light font-medium">{p.name}</p>
                    <p className="text-light/30 text-xs">{p.subtitle}</p>
                  </td>
                  <td className="px-5 py-4 text-primary font-semibold">
                    UGX {fmt(p.base_price)}
                  </td>
                  <td className="px-5 py-4 text-light/50">
                    {p.is_box_item && p.off_peak_price
                      ? <span className="text-haiq-gold font-semibold">UGX {fmt(p.off_peak_price)}</span>
                      : <span className="text-light/20">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-light/50">{p.total_sold || 0}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleBox(p)}
                      disabled={toggling === p.id}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${
                        p.is_box_item
                          ? 'bg-haiq-gold/20 text-haiq-gold'
                          : 'bg-surface text-light/30 hover:text-light'
                      }`}
                    >
                      {p.is_box_item ? 'Box Item' : 'Regular'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(p)}
                      disabled={toggling === p.id}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        p.is_active ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-light transition-all duration-200 ${
                          p.is_active ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg px-5 py-4 text-sm">
        <p className="text-primary font-semibold mb-1">📅 Box Pricing Note</p>
        <p className="text-light/50 text-xs leading-relaxed">
          Products marked as <strong className="text-haiq-gold">Box Item</strong> will use their off-peak price
          (UGX 80,000) on days that are NOT marked as Special Days in the Special Days module.
          On special days, the regular price (UGX 40,000) applies.
        </p>
      </div>
    </div>
  )
}
