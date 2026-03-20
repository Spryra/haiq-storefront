import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { CartProvider }    from './context/CartContext'
import Layout              from './components/layout/Layout'

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

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Checkout has its own minimal header — no Layout */}
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/"                           element={<HomePage />} />
                  <Route path="/shop"                       element={<ShopPage />} />
                  <Route path="/products/:slug"             element={<ProductDetailPage />} />
                  <Route path="/order-confirmation/:token"  element={<OrderConfirmationPage />} />
                  <Route path="/track/:token"               element={<TrackOrderPage />} />
                  <Route path="/track"                      element={<TrackOrderPage />} />
                  <Route path="/build-your-box"             element={<BuildYourBoxPage />} />
                  <Route path="/account"                    element={<AccountPage />} />
                  <Route path="/contact"                    element={<ContactPage />} />
                  <Route path="/faq"                        element={<FAQPage />} />
                  <Route path="/moments"                    element={<MomentsPage />} />
                  <Route path="/login"                      element={<LoginPage />} />
                  <Route path="/register"                   element={<RegisterPage />} />
                </Routes>
              </Layout>
            }/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
