import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../lib/products'
import Breadcrumbs from '../components/Breadcrumbs'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState('') 

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await getProductById(id)
        if (!data) { setError('Product not found'); return; }
        setProduct(data)
      } catch (err) { setError('Failed to load product.') } finally { setLoading(false) }
    }
    if (id) fetchProduct()
  }, [id])

  const calculateEngravingPrice = () => {
    if (!product?.engraving_available || !customText.trim()) return 0
    if (product.category_id === 4) return customText.trim().length * 5
    return parseFloat(product.engraving_price) || 10
  }

  const calculateTotalPrice = () => {
    if (!product) return 0
    const basePrice = (product.on_sale && product.sale_price) ? parseFloat(product.sale_price) : parseFloat(product.price) || 0;
    return basePrice + calculateEngravingPrice();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>
  if (error || !product) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => navigate('/')} className="bg-black text-white px-4 py-2">חזרה</button></div>

  const images = product?.images?.map(img => img.image_url) || [product?.image_url].filter(Boolean)
  const mainImage = images[selectedImageIndex]

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex gap-4">
            <div className="flex-1 aspect-square bg-gray-50 border overflow-hidden">
                <img src={mainImage} className="w-full h-full object-cover" />
            </div>
        </div>
        <div className="flex flex-col text-right">
          <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
          <p className="text-3xl mb-8 font-light">₪{calculateTotalPrice().toLocaleString()}</p>
          <button onClick={() => addToCart(product, quantity, customText)} className="bg-black text-white py-4 hover:bg-gray-800 transition-all">הוספה לסל</button>
          <p className="mt-8 text-gray-600">{product.description}</p>
        </div>
      </main>
    </div>
  )
}
