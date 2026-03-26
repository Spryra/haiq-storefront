# fix-build.ps1
# Run from: D:\Junior Reactive Projects\HAIQ

Write-Host "Fixing build errors..." -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Fix index.css – move @import to the top
# -----------------------------------------------------------------------------
Write-Host "1. Fixing index.css..." -ForegroundColor Yellow

$indexCss = "frontend\src\index.css"
$cssContent = Get-Content $indexCss -Raw
# Remove any existing @import lines and prepend them
$importLine = '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap");'
# Remove all @import lines from content
$cssContent = $cssContent -replace '@import\s+url\([^)]+\);?\s*', ''
# Put import at the very top
$newCss = "$importLine`n`n$cssContent"
Set-Content -Path $indexCss -Value $newCss -NoNewline
Write-Host "   Fixed index.css"

# -----------------------------------------------------------------------------
# 2. Replace CartContext.jsx with a clean version (no self-import)
# -----------------------------------------------------------------------------
Write-Host "2. Replacing CartContext.jsx..." -ForegroundColor Yellow

$cartContextPath = "frontend\src\context\CartContext.jsx"
$cleanCartContext = @'
import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

/**
 * Cart item shape:
 *
 * For single cookies (itemType: 'single'):
 *   { key, productId, variantId, name, subtitle, imageUrl,
 *     variantLabel, price, quantity, itemType: 'single', boxId: null }
 *
 * For a box (itemType: 'box'):
 *   { key, productId: null, variantId: null, name: 'Box Office',
 *     price: <total box price>, quantity: 1, itemType: 'box',
 *     boxId, boxContents: [{ name, quantity, productId, variantId }],
 *     orderItems }
 */

const parsePrice = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // addItem – for single cookie orders
  const addItem = useCallback((product, variant, quantity = 1, options = {}) => {
    const { itemType = 'single' } = options;
    if (itemType === 'single') {
      const price = parsePrice(variant?.price ?? product?.base_price ?? 0);
      const key = `${product.id}-${variant.id}-single`;
      setItems(prev => {
        const existing = prev.find(i => i.key === key);
        if (existing) {
          return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, {
          key,
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          subtitle: product.subtitle || '',
          imageUrl: product.images?.[0]?.url || product.image_url || product.primary_image || null,
          variantLabel: variant.label || '4-Pack',
          price,
          quantity,
          itemType: 'single',
          boxId: null,
          boxContents: null,
        }];
      });
    }
  }, []);

  // addBox – adds a box as one cart line item (name always "Box Office")
  const addBox = useCallback((selections, boxPrice) => {
    const boxId = `box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const displayName = 'Box Office';
    const price = parsePrice(boxPrice);

    const boxContents = selections
      .filter(s => s.count > 0)
      .map(s => ({
        name: s.product.name,
        subtitle: s.product.subtitle || '',
        imageUrl: s.product.images?.[0]?.url || null,
        quantity: s.count,
        productId: s.product.id,
        variantId: s.variant?.id,
      }));

    const orderItems = selections
      .filter(s => s.count > 0)
      .map(s => ({
        product_id: s.product.id,
        variant_id: s.variant?.id,
        quantity: s.count,
      }));

    setItems(prev => [...prev, {
      key: boxId,
      productId: null,
      variantId: null,
      name: displayName,
      subtitle: `Your Box · ${boxContents.map(c => `${c.quantity}× ${c.name}`).join(', ')}`,
      imageUrl: null,
      variantLabel: 'Box of 4',
      price,
      quantity: 1,
      itemType: 'box',
      boxId,
      boxContents,
      orderItems,
    }]);
  }, []);

  const removeItem = useCallback((item) => {
    setItems(prev => prev.filter(i => i.key !== item.key));
  }, []);

  const updateQty = useCallback((item, qty) => {
    if (item.itemType === 'box') return; // box quantity is always 1
    if (qty < 1) setItems(prev => prev.filter(i => i.key !== item.key));
    else setItems(prev => prev.map(i => i.key === item.key ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const toOrderItems = () => {
    const result = [];
    items.forEach(item => {
      if (item.itemType === 'box' && item.orderItems) {
        result.push(...item.orderItems);
      } else if (item.productId && item.variantId) {
        result.push({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity });
      }
    });
    return result;
  };

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
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
'@

Set-Content -Path $cartContextPath -Value $cleanCartContext -NoNewline
Write-Host "   Replaced CartContext.jsx (no self-import)"

Write-Host "`n✅ Fixes applied." -ForegroundColor Green
Write-Host "`nNow restart your frontend dev server and test." -ForegroundColor Cyan