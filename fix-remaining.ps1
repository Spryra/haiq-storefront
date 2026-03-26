# fix-remaining.ps1
# Run from: D:\Junior Reactive Projects\HAIQ

Write-Host "Starting fixes..." -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Database rename: "The Unboxing" → "Box Office"
# -----------------------------------------------------------------------------
Write-Host "1. Updating database..." -ForegroundColor Yellow

# Create rename-product.js if it doesn't exist
$renameScript = @"
const { query, pool } = require('./src/config/db');

(async () => {
  try {
    await query(\`
      UPDATE products
      SET name = 'Box Office',
          subtitle = 'Build Your Box',
          slug = 'box-office',
          is_box_item = true
      WHERE slug IN ('the-unboxing', 'box-office')
    \`);
    console.log('✅ Product renamed to Box Office');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
"@

$renamePath = "backend\rename-product.js"
if (-not (Test-Path $renamePath)) {
    Set-Content -Path $renamePath -Value $renameScript -NoNewline
    Write-Host "   Created $renamePath"
} else {
    Write-Host "   $renamePath already exists – using it."
}

# Run the rename script
Push-Location backend
node rename-product.js
Pop-Location
Write-Host "   Database rename completed."

# -----------------------------------------------------------------------------
# 2. Replace ProductCard.jsx (Box Office link & button)
# -----------------------------------------------------------------------------
Write-Host "2. Updating ProductCard.jsx..." -ForegroundColor Yellow

$productCardPath = "frontend\src\components\product\ProductCard.jsx"
$productCardContent = @'
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useState, useRef, useEffect } from 'react';
import VariantPickerModal from './VariantPickerModal';

const LOGO_FALLBACK = '/HAIQmain.png';

export default function ProductCard({ product, index = 0 }) {
  const [imgSrc, setImgSrc] = useState(product.images?.[0]?.url || LOGO_FALLBACK);
  const [imgSrc2] = useState(product.images?.[1]?.url || null);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const { addItem, openDrawer } = useCart();

  const nodeRef = useRef(null);
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const variants = product.variants ?? [];
  const hasMultiple = variants.length > 1;
  const defaultV = variants.find(v => v.is_default) ?? variants[0];
  const stockQty = defaultV?.stock_qty ?? 0;
  const isSoldOut = stockQty === 0;
  const isLow = stockQty > 0 && stockQty <= 3;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    if (product.is_box_item) {
      window.location.href = '/build-your-box';
      return;
    }
    if (hasMultiple) {
      setShowPicker(true);
      return;
    }
    addItem(product, defaultV, 1);
    openDrawer();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const cardLink = product.is_box_item ? '/build-your-box' : `/products/${product.slug}`;

  return (
    <>
      <div
        ref={nodeRef}
        className="h-full transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transitionDelay: `${index * 70}ms`,
        }}
      >
        <Link
          to={cardLink}
          className="block h-full group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex flex-col h-full bg-light rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full aspect-square bg-[#F0EBE3] overflow-hidden flex-shrink-0">
              <img
                src={imgSrc}
                alt={product.name}
                onError={() => { if (!imgFailed) { setImgSrc(LOGO_FALLBACK); setImgFailed(true); } }}
                className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                  imgFailed ? 'object-contain p-8 opacity-40' : 'object-cover'
                }`}
                style={{
                  transform: hovered && imgSrc2 ? 'scale(1.03)' : 'scale(1)',
                  opacity: hovered && imgSrc2 ? 0 : (imgFailed ? 0.4 : 1),
                }}
                loading="lazy"
              />
              {imgSrc2 && !imgFailed && (
                <img
                  src={imgSrc2}
                  alt={`${product.name} view 2`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                  style={{
                    transform: hovered ? 'scale(1.03)' : 'scale(1.08)',
                    opacity: hovered ? 1 : 0,
                  }}
                  loading="lazy"
                />
              )}
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
              {isLow && (
                <div className="absolute bottom-0 left-0 right-0 bg-dark/75 backdrop-blur-sm px-3 py-1.5 z-10">
                  <p className="text-primary text-[10px] font-semibold text-center tracking-wide">
                    Only {stockQty} remaining
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 p-4">
              <div className="flex-1 mb-3">
                <h3 className="font-serif font-bold text-dark text-[15px] leading-snug line-clamp-1 mb-0.5">
                  {product.name}
                </h3>
                <p className="text-muted text-xs line-clamp-1 mb-2">
                  {product.subtitle || '\u00A0'}
                </p>
                <p className="text-primary font-bold text-sm mb-2">
                  {hasMultiple
                    ? `From UGX ${Math.min(...variants.map(v => Number(v.price))).toLocaleString()}`
                    : `UGX ${Number(defaultV?.price ?? product.base_price).toLocaleString()}`
                  }
                </p>
                <p className="text-[11px] text-muted leading-relaxed line-clamp-2 min-h-[2.4em]">
                  {product.items?.length
                    ? product.items.slice(0, 3).map(i => i.label).join(' · ')
                    : '\u00A0'
                  }
                </p>
              </div>

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
                    : product.is_box_item
                      ? 'Build Your Box →'
                      : hasMultiple
                        ? 'Choose Size →'
                        : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </Link>
      </div>

      {showPicker && (
        <VariantPickerModal
          product={product}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
'@

Set-Content -Path $productCardPath -Value $productCardContent -NoNewline
Write-Host "   Updated $productCardPath"

# -----------------------------------------------------------------------------
# 3. Update CartContext.jsx – always use "Box Office" for box name
# -----------------------------------------------------------------------------
Write-Host "3. Updating CartContext.jsx..." -ForegroundColor Yellow

$cartContextPath = "frontend\src\context\CartContext.jsx"
$cartContent = Get-Content $cartContextPath -Raw
# Replace the getBoxName() call with "Box Office" inside addBox
$cartContent = $cartContent -replace "const displayName = getBoxName\(\)", "const displayName = 'Box Office'"
Set-Content -Path $cartContextPath -Value $cartContent -NoNewline
Write-Host "   Updated $cartContextPath"

# -----------------------------------------------------------------------------
# 4. Replace AuthContext.jsx with token-refresh version
# -----------------------------------------------------------------------------
Write-Host "4. Updating AuthContext.jsx..." -ForegroundColor Yellow

$authContextPath = "frontend\src\context\AuthContext.jsx"
$authContent = @'
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount – try to refresh token
  useEffect(() => {
    const restoreSession = async () => {
      if (window.__haiq_access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${window.__haiq_access_token}`;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setLoading(false);
          return;
        } catch {
          window.__haiq_access_token = null;
          delete api.defaults.headers.common['Authorization'];
        }
      }
      // Attempt refresh
      try {
        const res = await api.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.access_token;
        if (newToken) {
          window.__haiq_access_token = newToken;
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          const me = await api.get('/auth/me');
          setUser(me.data.user);
        }
      } catch (e) {
        // No valid refresh token – stay logged out
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user } = res.data;
    window.__haiq_access_token = access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    window.__haiq_access_token = null;
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      requestPasswordReset, resetPassword,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
'@

Set-Content -Path $authContextPath -Value $authContent -NoNewline
Write-Host "   Updated $authContextPath"

# -----------------------------------------------------------------------------
# 5. Create new Crown.jsx components (frontend & admin) that use image
# -----------------------------------------------------------------------------
Write-Host "5. Creating Crown.jsx components..." -ForegroundColor Yellow

$crownContent = @'
export default function Crown({ size = 32, color = '#B8752A', className = '' }) {
  return (
    <img
      src="/crown.png"
      alt="HAIQ Crown"
      width={size}
      height={Math.round(size * 0.72)}
      className={className}
    />
  );
}
'@

$frontendCrown = "frontend\src\components\shared\Crown.jsx"
$adminCrown = "admin\src\components\shared\Crown.jsx"

Set-Content -Path $frontendCrown -Value $crownContent -NoNewline
Set-Content -Path $adminCrown -Value $crownContent -NoNewline
Write-Host "   Created frontend and admin Crown.jsx"

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
Write-Host "`n✅ All fixes applied." -ForegroundColor Green
Write-Host "`n📦 Next steps (manual):" -ForegroundColor Yellow
Write-Host "1. Place your new product images in: frontend/public/images/products/"
Write-Host "   - venom.jpg"
Write-Host "   - coconut.jpg"
Write-Host "   - crimson_sin.jpg"
Write-Host "   - campfire.jpg"
Write-Host "   - boxoffice.jpg"
Write-Host "2. Place your new crown image in: frontend/public/crown.png"
Write-Host "   and also: admin/public/crown.png"
Write-Host "3. Commit and push:"
Write-Host "   git add -A"
Write-Host "   git commit -m 'feat: Box Office, login persistence, new crown'"
Write-Host "   git push"
Write-Host "4. Restart your frontend and backend dev servers if running."