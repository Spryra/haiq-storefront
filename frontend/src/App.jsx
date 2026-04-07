import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import Layout            from './components/layout/Layout'
import ScrollToTop       from './components/ScrollToTop'

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

// Each route explicitly wraps with Layout
const withLayout = (Page) => (
  <Layout><Page /></Layout>
)

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          {/* ✅ THIS IS THE FIX */}
          <ScrollToTop />

          <Routes>
            <Route path="/"                element={withLayout(HomePage)} />
            <Route path="/shop"            element={withLayout(ShopPage)} />
            <Route path="/shop/:category"  element={withLayout(ShopPage)} />
            <Route path="/products/:slug"  element={withLayout(ProductDetailPage)} />
            <Route path="/moments"         element={withLayout(MomentsPage)} />
            <Route path="/faq"             element={withLayout(FAQPage)} />
            <Route path="/contact"         element={withLayout(ContactPage)} />
            <Route path="/build-your-box"  element={withLayout(BuildYourBoxPage)} />
            <Route path="/account"         element={withLayout(AccountPage)} />
            <Route path="/track"           element={withLayout(TrackOrderPage)} />
            <Route path="/track/:token"    element={withLayout(TrackOrderPage)} />
            <Route path="/login"           element={withLayout(LoginPage)} />
            <Route path="/register"        element={withLayout(RegisterPage)} />
            <Route path="/forgot-password" element={withLayout(ForgotPasswordPage)} />
            <Route path="/reset-password"  element={withLayout(ResetPasswordPage)} />

            {/* Checkout — full screen */}
            <Route path="/checkout"                  element={<CheckoutPage />} />
            <Route path="/order-confirmation/:token" element={<OrderConfirmationPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}