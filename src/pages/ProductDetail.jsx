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
  
  // State חדש לאופציות שנבחרו
  const [selectedOptions, setSelectedOptions] = useState({})

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
        
        // אתחול אופציות ברירת מחדל (בוחר את האופציה הראשונה בכל קבוצה)
        if (data.options && data.options.length > 0) {
          const initial = {}
          data.options.forEach(group => {
            initial[group.title] = group.items[0]
          })
          setSelectedOptions(initial)
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  // חישוב מחיר האופציות שנבחרו
  const calculateOptionsPrice = () => {
    return Object.values(selectedOptions).reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  }

  const calculateEngravingPrice = () => {
    if (!product.engraving_available || !customText.trim()) return 0
    if (product.category_id === 4) return customText.trim().length * 5
    return parseFloat(product.engraving_price) || 10
  }

  const calculateTotalPrice = () => {
    const onSale = product.on_sale && product.sale_price;
    const basePrice = onSale ? parseFloat(product.sale_price) : parseFloat(product.price) || 0;
    return basePrice + calculateEngravingPrice() + calculateOptionsPrice();
  }

  const handleAddToCart = () => {
    // אנחנו שולחים לסל גם את האופציות שנבחרו כדי שיופיעו בהזמנה
    const productWithChoices = {
      ...product,
      selectedChoices: selectedOptions
    }
    addToCart(productWithChoices, quantity, customText.trim() || null)
    setCustomText('')
    setQuantity(1)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>
  if (error || !product) return <div className="min-h-screen flex items-center justify-center bg-white"><button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white">חזרה לבית</button></div>

  const images = product?.images?.map(img => img.image_url) || [product?.image_url].filter(Boolean)
  const mainImage = images[selectedImageIndex]

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <Breadcrumbs items={[
        { label: 'עמוד הבית', link: '/' },
        { label: product.category?.name || 'מוצר', link: `/category/${product.category_id}` },
        { label: product.name, link: null }
      ]} />

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
            <h1 className="font-serif text-3xl md:text-4xl mb-2 font-normal">{product.name}</h1>
            
            <div className="mb-6">
              <p className="text-3xl font-normal text-gray-900">
                ₪{calculateTotalPrice().toLocaleString('he-IL')}
              </p>
            </div>

            {/* --- אופציות בחירה (טליתות וכו') --- */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-6 mb-8 border-t border-gray-100 pt-6">
                {product.options.map((group, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm">{group.title}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {group.items.map((item, itemIdx) => (
                        <label 
                          key={itemIdx} 
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedOptions[group.title]?.name === item.name 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio"
                              name={group.title}
                              className="w-4 h-4 accent-black"
                              checked={selectedOptions[group.title]?.name === item.name}
                              onChange={() => setSelectedOptions({...selectedOptions, [group.title]: item})}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          {item.price > 0 && (
                            <span className="text-xs text-gray-500">+ ₪{item.price}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* החלק של החריטה */}
            {product.engraving_available && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm font-medium mb-2">חריטת שם אישית</p>
                <input
                  type="text"
                  placeholder="הקלידו שם לחריטה..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 text-right border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none bg-white"
                />
              </div>
            )}

            {/* כפתורי רכישה */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white py-4 font-medium hover:bg-gray-800 transition-all uppercase tracking-wider">
                הוספה לסל
              </button>
              <div className="flex items-center border border-gray-300">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-10 h-12">-</button>
                <span className="w-10 h-12 flex items-center justify-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-12">+</button>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
               <p className="text-sm text-gray-600 leading-relaxed"><span className="font-bold text-black">תיאור: </span>{product.description}</p>
               <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-2">📦 משלוח חינם מעל ₪400</div>
                  <div className="flex items-center gap-2">⏳ אספקה: 4-6 ימי עסקים</div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
