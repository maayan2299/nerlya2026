import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, getImageUrl } from '../lib/products'
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
  const [openAccordion, setOpenAccordion] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await getProductById(id)
        if (!data) {
          setError('Product not found')
          return
        }
        setProduct(data)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  // חישוב מחיר חריטה דינמי לפי קטגוריה
  const calculateEngravingPrice = () => {
    if (!product.engraving_available || !customText.trim()) {
      return 0
    }
    
    // קטגוריה 4 = כיסוי טלית ותפילין = 5₪ לאות
    if (product.category_id === 4) {
      return customText.trim().length * 5
    }
    
    // שאר הקטגוריות = מחיר קבוע מה-DB
    return parseFloat(product.engraving_price) || 10
  }

  // חישוב מחיר כולל
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.price) || 0
    const engravingPrice = calculateEngravingPrice()
    return basePrice + engravingPrice
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, customText.trim() || null)
    setCustomText('')
    setQuantity(1)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>
  if (error || !product) return <div className="min-h-screen flex items-center justify-center bg-white"><button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white">חזרה לבית</button></div>

  const images = product?.images?.map(img => img.image_url) || [product?.main_image_url].filter(Boolean)
  const mainImage = images[selectedImageIndex]

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: product.category?.name || 'מוצר', link: `/category/${product.category_id}` },
    { label: product.name, link: null }
  ]

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* תמונות */}
          <div className="flex gap-4">
            {images.length > 1 && (
              <div className="flex flex-col gap-3">
                {images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImageIndex(index)} className={`w-20 h-20 border-2 ${selectedImageIndex === index ? 'border-black' : 'border-gray-200'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-square bg-gray-50 border border-gray-200 overflow-hidden">
              <img src={mainImage} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* פרטי מוצר */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl md:text-4xl mb-4 font-normal">{product.name}</h1>
            
            <div className="mb-6">
              <p className="text-2xl md:text-3xl font-normal">
                ₪{calculateTotalPrice().toLocaleString('he-IL')}
              </p>
            </div>

            {/* החלק של החריטה */}
            {product.engraving_available && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    {product.category_id === 4 ? (
                      <>חריטת שם - ₪5 לכל אות</>
                    ) : (
                      <>חריטת שם - ₪{product.engraving_price || 10}</>
                    )}
                  </p>
                  {product.category_id === 4 && customText.trim() && (
                    <p className="text-xs text-amber-700 mt-1 bg-amber-50 inline-block px-2 py-1 rounded">
                      {customText.trim().length} אותיות × ₪5 = ₪{customText.trim().length * 5}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="אז מה השם אמרנו? :)"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
            )}

            {/* כפתורי רכישה */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white py-4 font-medium hover:bg-gray-800 transition-all">
                הוספה לסל
              </button>
              <div className="flex items-center border-2 border-gray-300">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-12 h-[52px]">-</button>
                <span className="w-12 h-[52px] flex items-center justify-center border-x-2 border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-[52px]">+</button>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">שווה לדעת!</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 p-4 bg-gray-50 flex items-center gap-3">
                <span className="text-sm">תיאור מוצר: {product.description}</span>
              </div>
              <div className="border border-gray-200 p-4 flex items-center gap-3 font-medium text-sm">
                <span>משלוח חינם עד הבית להזמנות מעל ₪400</span>
              </div>
              <div className="border border-gray-200 p-4 flex items-center gap-3 font-medium text-sm">
                <span>זמני אספקה 4-6 ימי עסקים</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

