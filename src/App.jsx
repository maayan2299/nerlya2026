import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

// ייבוא דפים
import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'

// ייבוא דשבורד
import NerLiyaDashboard from './components/NerLiyaDashboard'

function App() {
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

          {/* דשבורד ניהול - ללא הגנה */}
          <Route path="/admin" element={<NerLiyaDashboard />} />

          {/* ניתוב ברירת מחדל - אם הגיעו לדף שלא קיים, חזרה לבית */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
