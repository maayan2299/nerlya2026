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
  const [selectedColor, setSelectedColor] = useState(null)
  const [engravingText, setEngravingText] = useState('')
  const [engravingColor, setEngravingColor] = useState('black')

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
        // בחר צבע ראשון אם יש
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].id)
        }
      } catch (err) { 
        console.error('Error:', err)
        setError('Failed to load product.') 
      } finally { 
        setLoading(false) 
      }
    }
    if (id) fetchProduct()
  }, [id])

  const calculateEngravingPrice = () => {
    if (!product?.allows_engraving || !engravingText.trim()) return 0
    return parseFloat(product.engraving_price) || 0
  }

  const calculateTotalPrice = () => {
    if (!product) return 0
    const basePrice = (product.on_sale && product.sale_price) 
      ? parseFloat(product.sale_price) 
      : parseFloat(product.price) || 0
    return basePrice + calculateEngravingPrice()
  }

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      selectedColor: selectedColor ? product.colors?.find(c => c.id === selectedColor) : null,
      engraving: product.allows_engraving ? {
        text: engravingText.trim(),
        color: engravingColor,
        price: calculateEngravingPrice()
      } : null
    }
    addToCart(cartItem)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error || 'המוצר לא נמצא'}</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition"
        >
          חזרה לעמוד הבית
        </button>
      </div>
    </div>
  )

  const images = product?.images?.sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  }).map(img => img.image_url) || []

  const mainImage = images[selectedImageIndex]
  const selectedColorObj = product.colors?.find(c => c.id === selectedColor)

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs />
        
        {/* Grid: תמונה בימין, מידע בשמאל */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          
          {/* ========== תמונה (ימין) ========== */}
          <div className="flex flex-col-reverse lg:flex-col gap-4 order-2 lg:order-1">
            {/* תמונה ראשית */}
            <div className="w-full aspect-square bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
              {mainImage && (
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* תמונות קטנות */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 overflow-hidden transition-all ${
                      selectedImageIndex === idx 
                        ? 'border-black' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========== מידע (שמאל) ========== */}
          <div className="flex flex-col order-1 lg:order-2">
            
            {/* כותרת ומחיר */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif mb-2 text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-4">{product.category}</p>
              
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-light text-gray-900">
                  ₪{calculateTotalPrice().toLocaleString('he-IL')}
                </p>
                {product.on_sale && (
                  <p className="text-lg text-gray-400 line-through">
                    ₪{parseFloat(product.price).toLocaleString('he-IL')}
                  </p>
                )}
              </div>

              {product.on_sale && (
                <div className="mt-2">
                  <span className="inline-block bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded">
                    {product.sale_percentage}% הנחה
                  </span>
                </div>
              )}
            </div>

            {/* תיאור */}
            {product.description && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {/* אפשרויות */}
            <div className="mb-8 space-y-8">
              
              {/* בחירת צבע */}
              {product.has_color_options && product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    צבע:
                    {selectedColorObj && (
                      <span className="text-gray-600 font-normal"> {selectedColorObj.color_name}</span>
                    )}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`flex items-center gap-2 px-4 py-2 border-2 rounded transition-all ${
                          selectedColor === color.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color_code }}
                        />
                        <span className="text-sm text-gray-800">{color.color_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* חריטה */}
              {product.allows_engraving && (
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={engravingText.trim().length > 0}
                      onChange={e => {
                        if (!e.target.checked) {
                          setEngravingText('')
                        }
                      }}
                      className="w-5 h-5 rounded accent-black cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      הוספת חריטה (₪{parseFloat(product.engraving_price || 0).toLocaleString('he-IL')})
                    </span>
                  </label>

                  {engravingText.trim().length > 0 || true && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          טקסט לחריטה:
                        </label>
                        <input
                          type="text"
                          placeholder="הקלידו את הטקסט..."
                          value={engravingText}
                          onChange={e => setEngravingText(e.target.value)}
                          maxLength="50"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {engravingText.length}/50
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          צבע חריטה:
                        </label>
                        <div className="flex gap-2">
                          {['black', 'white', 'gold', 'silver'].map(color => (
                            <button
                              key={color}
                              onClick={() => setEngravingColor(color)}
                              className={`w-10 h-10 rounded border-2 transition-all ${
                                engravingColor === color
                                  ? 'border-black'
                                  : 'border-gray-300'
                              }`}
                              style={{
                                backgroundColor: color === 'black' ? '#000' : 
                                               color === 'white' ? '#fff' :
                                               color === 'gold' ? '#d4af37' :
                                               color === 'silver' ? '#c0c0c0' : '#000'
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* כמות וכפתור */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition"
                >
                  −
                </button>
                <span className="px-6 py-3 border-l border-r border-gray-300 text-center w-16">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-4 rounded text-lg font-semibold hover:bg-gray-800 transition-all mb-4"
            >
              הוסף לסל
            </button>

            {!product.in_stock && (
              <p className="text-red-600 text-sm text-center">המוצר אינו במלאי</p>
            )}

            {/* קישורים נוספים */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <button className="text-sm text-gray-600 hover:text-black transition mb-3 block w-full">
                ❤ שמירה להצעות מעדפות
              </button>
              <button className="text-sm text-gray-600 hover:text-black transition block w-full">
                שיתוף בחברתיות
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
