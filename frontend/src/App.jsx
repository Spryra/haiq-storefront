import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { HelmetProvider } from 'react-helmet-async'
import Layout            from './components/layout/Layout'

import HomePage              from './pages/HomePage'
import ShopPage              from './pages/ShopPage'
import ProductDetailPage     from './pages/ProductDetailPage'
import CheckoutPage          from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import TrackOrderPage        from './pages/TrackOrderPage'
import BuildYourBoxPage      from './pages/BuildYourBoxPage'
import AccountPage           from './pages/AccountPage'
import ContactPage           from './pages/ContactPage'
import FAQPage               from './pages/FAQPage'
import MomentsPage           from './pages/MomentsPage'
import LoginPage             from './pages/LoginPage'
import RegisterPage          from './pages/RegisterPage'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordResetPages'

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Full-layout pages */}
              <Route element={<Layout />}>
                <Route path="/"                element={<HomePage />} />
                <Route path="/shop"            element={<ShopPage />} />
                <Route path="/shop/:category"  element={<ShopPage />} />
                <Route path="/products/:slug"  element={<ProductDetailPage />} />
                <Route path="/moments"         element={<MomentsPage />} />
                <Route path="/faq"             element={<FAQPage />} />
                <Route path="/contact"         element={<ContactPage />} />
                <Route path="/build-your-box"  element={<BuildYourBoxPage />} />
                <Route path="/account"         element={<AccountPage />} />
                <Route path="/track"           element={<TrackOrderPage />} />
                <Route path="/track/:token"    element={<TrackOrderPage />} />
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/register"        element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password"  element={<ResetPasswordPage />} />
              </Route>

              {/* Checkout — no navbar/footer */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:token" element={<OrderConfirmationPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
