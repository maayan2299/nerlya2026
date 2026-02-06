import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { CartProvider } from './context/CartContext'

// ייבוא דפים
import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AdminLogin from './pages/AdminLogin' // דף ההתחברות שיצרנו

// ייבוא קומפוננטות
import NerLiyaDashboard from './components/NerLiyaDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. בדיקה אם המשתמש כבר מחובר כשהדף נטען
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. האזנה לשינויים במצב החיבור (התחברות או התנתקות)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // בזמן שהאפליקציה בודקת אם המשתמש מחובר, לא נציג כלום או נציג אינדיקטור טעינה
  if (loading) return <div className="flex items-center justify-center min-h-screen">טוען...</div>

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* נתיבים ציבוריים ללקוחות */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* נתיב התחברות למנהל */}
          <Route path="/login-manager" element={<AdminLogin />} />

          {/* הגנה על הדשבורד: אם מחובר - הצג דשבורד. אם לא - שלח לדף התחברות */}
          <Route 
            path="/admin" 
            element={session ? <NerLiyaDashboard /> : <Navigate to="/login-manager" />} 
          />

          {/* ניתוב ברירת מחדל - אם הגיעו לדף שלא קיים, חזרה לבית */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App