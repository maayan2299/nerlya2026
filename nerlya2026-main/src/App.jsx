import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentError from './pages/PaymentError'
import CartDrawer from './components/CartDrawer'
import NerLiyaDashboard from './components/NerLiyaDashboard'

function App() {
  
  useEffect(() => {
    // בודק אם הלקוח הגיע לכאן אחרי שלחץ על "תשלום" ב-Checkout
    const triggerPayment = sessionStorage.getItem('trigger_payment')
    const paymentData = sessionStorage.getItem('payment_data')

    if (triggerPayment === 'true' && paymentData) {
      // מנקים מיד את הזיכרון כדי שלא יקרה שוב בריענון
      sessionStorage.removeItem('trigger_payment')
      sessionStorage.removeItem('payment_data')

      const params = JSON.parse(paymentData)
      const targetUrl = 'https://icom.yaad.net/p/'
      const queryString = new URLSearchParams(params).toString()
      
      // המעבר קורה מכאן (דף הבית) - ה-Referer יהיה https://nerlya.com/
      window.location.href = `${targetUrl}?${queryString}`
    }
  }, [])

  return (
    <CartProvider>
      <Router>
        <CartDrawer /> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-error" element={<PaymentError />} />
          <Route path="/admin" element={<NerLiyaDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
