// App.jsx — Admin Dashboard router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'

import AdminLayout    from './components/layout/AdminLayout'
import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import OrdersPage     from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProductsPage   from './pages/ProductsPage'
import MessagesPage   from './pages/MessagesPage'
import AnalyticsPage  from './pages/AnalyticsPage'
import LoyaltyPage    from './pages/LoyaltyPage'
import NewsletterPage from './pages/NewsletterPage'
import SpecialDaysPage from './pages/SpecialDaysPage'
import ReviewsPage    from './pages/ReviewsPage'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-primary text-sm tracking-widest uppercase animate-pulse">Loading…</div>
    </div>
  )
  return admin ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/"             element={<DashboardPage />} />
                  <Route path="/orders"       element={<OrdersPage />} />
                  <Route path="/orders/:id"   element={<OrderDetailPage />} />
                  <Route path="/products"     element={<ProductsPage />} />
                  <Route path="/messages"     element={<MessagesPage />} />
                  <Route path="/analytics"    element={<AnalyticsPage />} />
                  <Route path="/loyalty"      element={<LoyaltyPage />} />
                  <Route path="/newsletter"   element={<NewsletterPage />} />
                  <Route path="/special-days" element={<SpecialDaysPage />} />
                  <Route path="/reviews"      element={<ReviewsPage />} />
                  <Route path="*"             element={<Navigate to="/" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
