import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

// ייבוא דפים
import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentError from './pages/PaymentError'
import CartDrawer from './components/CartDrawer'
// ייבוא דשבורד
import NerLiyaDashboard from './components/NerLiyaDashboard'

function App() {
  
  // --- המנגנון שעוקף את שגיאת ה-Referer ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('to_pay') === 'true') {
      // אם הגענו לכאן עם סימן לתשלום, אנחנו מנקים את הסימן ומעבירים ליעד
      const targetUrl = 'https://icom.yaad.net/p/';
      params.delete('to_pay');
      
      // המעבר קורה מכאן (דף הבית), לכן ה-Referer יהיה תקין
      window.location.href = `${targetUrl}?${params.toString()}`;
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        {/* המגירה כאן! מחוץ לנתיבים, כדי שתהיה זמינה תמיד מעל כל דף */}
        <CartDrawer /> 
        
        <Routes>
          {/* נתיבים ציבוריים ללקוחות */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* דפי תשלום HYP */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-error" element={<PaymentError />} />

          {/* דשבורד ניהול */}
          <Route path="/admin" element={<NerLiyaDashboard />} />

          {/* ניתוב ברירת מחדל */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
