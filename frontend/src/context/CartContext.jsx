import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

/**
 * Cart item shape:
 *
 * For single cookies (itemType: 'single'):
 *   { key, productId, variantId, name, subtitle, imageUrl,
 *     variantLabel, price, quantity, itemType: 'single', boxId: null }
 *
 * For a box (itemType: 'box') — stored as ONE item representing the full box:
 *   { key, productId: null, variantId: null, name: <box display name>,
 *     price: <total box price, e.g. 40000 or 80000>, quantity: 1,
 *     itemType: 'box', boxId, boxContents: [{ name, quantity, productId, variantId }] }
 */

const BOX_DISPLAY_NAMES = [
  'The Drop',
  'Dark Selection',
  'Cookie Suite',
  'The Reserve',
  'The Craving',
  'Night Batch',
  'The Usual',
  'Signature Pick',
]
let boxCounter = 0

function getBoxName() {
  const name = BOX_DISPLAY_NAMES[boxCounter % BOX_DISPLAY_NAMES.length]
  boxCounter++
  return name
}

const parsePrice = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }

export function CartProvider({ children }) {
  const [items,      setItems]      = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── addItem — for single cookie orders ────────────────────────────────────
  const addItem = useCallback((product, variant, quantity = 1, options = {}) => {
    const { itemType = 'single' } = options

    if (itemType === 'single') {
      const price = parsePrice(variant?.price ?? product?.base_price ?? 0)
      const key   = `${product.id}-${variant.id}-single`

      setItems(prev => {
        const existing = prev.find(i => i.key === key)
        if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
        return [...prev, {
          key,
          productId:    product.id,
          variantId:    variant.id,
          name:         product.name,
          subtitle:     product.subtitle || '',
          imageUrl:     product.images?.[0]?.url || product.image_url || product.primary_image || null,
          variantLabel: variant.label || '4-Pack',
          price,
          quantity,
          itemType: 'single',
          boxId:    null,
          boxContents: null,
        }]
      })
    }
  }, [])

  // ── addBox — adds an entire box as ONE cart line item ─────────────────────
  // selections: [{ product, variant, count }]
  // boxPrice: the total box price (40000 on special day, else 80000)
  const addBox = useCallback((selections, boxPrice) => {
    const boxId       = `box-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    const displayName = getBoxName()
    const price       = parsePrice(boxPrice)

    // Store cookie detail for display (no individual prices shown)
    const boxContents = selections
      .filter(s => s.count > 0)
      .map(s => ({
        name:      s.product.name,
        subtitle:  s.product.subtitle || '',
        imageUrl:  s.product.images?.[0]?.url || null,
        quantity:  s.count,
        productId: s.product.id,
        variantId: s.variant?.id,
      }))

    // For the order API, we still need individual items
    const orderItems = selections
      .filter(s => s.count > 0)
      .map(s => ({
        product_id: s.product.id,
        variant_id: s.variant?.id,
        quantity:   s.count,
      }))

    setItems(prev => [...prev, {
      key:          `${boxId}`,
      productId:    null,   // box has no single product_id
      variantId:    null,
      name:         displayName,
      subtitle:     `Your Box · ${boxContents.map(c => `${c.quantity}× ${c.name}`).join(', ')}`,
      imageUrl:     null,
      variantLabel: 'Box of 4',
      price,
      quantity:     1,
      itemType:     'box',
      boxId,
      boxContents,
      orderItems,   // used when building the order payload
    }])
  }, [])

  const removeItem = useCallback((item) => {
    setItems(prev => prev.filter(i => i.key !== item.key))
  }, [])

  const updateQty = useCallback((item, qty) => {
    if (item.itemType === 'box') return  // box quantity is always 1
    if (qty < 1) setItems(prev => prev.filter(i => i.key !== item.key))
    else setItems(prev => prev.map(i => i.key === item.key ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart   = useCallback(() => setItems([]), [])
  const openDrawer  = useCallback(() => setDrawerOpen(true),  [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0)

  // Builds the items array for the POST /v1/orders payload
  const toOrderItems = () => {
    const result = []
    items.forEach(item => {
      if (item.itemType === 'box' && item.orderItems) {
        result.push(...item.orderItems)
      } else if (item.productId && item.variantId) {
        result.push({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity })
      }
    })
    return result
  }

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      drawerOpen,
      addItem,
      addBox,
      removeItem,
      updateQty,
      clearCart,
      openDrawer,
      closeDrawer,
      toOrderItems,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
