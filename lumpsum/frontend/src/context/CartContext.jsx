import { createContext, useContext, useEffect } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Zustand cart store persisted to sessionStorage (cleared on tab close, per spec).
 * Import and use `useCart` directly in any component — no need for useContext.
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items:      [],
      isOpen:     false,
      totalItems: 0,
      subtotal:   0,

      // ─── Add item (merge if same variant) ──────────────────
      addItem: (product, variant, quantity = 1) => {
        const items    = get().items
        const existing = items.find(item => item.variantId === variant.id)

        if (existing) {
          set({
            items: items.map(item =>
              item.variantId === variant.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                productId:    product.id,
                variantId:    variant.id,
                name:         product.name,
                variantLabel: variant.label,
                price:        parseFloat(variant.price),
                quantity,
                image:        product.images?.[0]?.url || '/placeholder-product.webp',
                slug:         product.slug,
              },
            ],
          })
        }
        get()._recalc()
      },

      // ─── Remove item by variantId ───────────────────────────
      removeItem: (variantId) => {
        set({ items: get().items.filter(item => item.variantId !== variantId) })
        get()._recalc()
      },

      // ─── Update quantity; removes item if qty drops to 0 ───
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        })
        get()._recalc()
      },

      // ─── Clear entire cart ─────────────────────────────────
      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0 }),

      // ─── Drawer controls ───────────────────────────────────
      openDrawer:  () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      // ─── Internal: recalculate derived values ──────────────
      _recalc: () => {
        const items      = get().items
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
        const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        set({ totalItems, subtotal })
      },
    }),
    {
      name:    'haiq-cart',                            // sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // clears on tab close
      partialize: state => ({ items: state.items }),   // only persist items array
      onRehydrateStorage: () => state => {
        // Recalculate derived values after rehydration
        if (state) state._recalc()
      },
    }
  )
)

// ─── CartProvider ──────────────────────────────────────────────
// Exists solely to trigger recalculation on app mount.
// Components consume `useCart` directly; this context carries no value.
const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  useEffect(() => {
    useCart.getState()._recalc()
  }, [])
  return (
    <CartContext.Provider value={null}>{children}</CartContext.Provider>
  )
}
