import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, getAddonsByCategory } from '../lib/products'  // ← נוסף getAddonsByCategory
import Breadcrumbs from '../components/Breadcrumbs'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'

// ← פסוקים לרקמה — ערכי לפי הצורך
const TALLIT_VERSES = [
  'אשר קידשנו במצוותיו וציוונו להתעטף בציצית',
  'ברוך אתה ה\' אלוהינו מלך העולם אשר קידשנו במצוותיו',
  'שמע ישראל ה\' אלוהינו ה\' אחד',
  'ואהבת לרעך כמוך',
  'בשם ה\' אלוהי ישראל',
]

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
  // ← נוסף: state לתוספות טלית
  const [addons, setAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState({})
  const [selectedVerse, setSelectedVerse] = useState('')
  const [productNotes, setProductNotes] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await getProductById(id)
        if (!data) { setError('Product not found'); return; }
        setProduct(data)
        // ← נוסף: טעינת תוספות רק לטליתות (category_id === 1)
        if (data.category_id === 1) {
          const fetchedAddons = await getAddonsByCategory(1)
          setAddons(fetchedAddons)
        }
      } catch (err) { setError('Failed to load product.') } finally { setLoading(false) }
    }
    if (id) fetchProduct()
  }, [id])

  const calculateEngravingPrice = () => {
    if (!product?.engraving_available || !customText.trim()) return 0
    if (product.category_id === 4) return customText.trim().length * 5
    return parseFloat(product.engraving_price) || 10
  }

  // ← נוסף
  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }))
  }

  // ← נוסף
  const calculateAddonsPrice = () => {
    return addons
      .filter(a => selectedAddons[a.id])
      .reduce((sum, a) => sum + parseFloat(a.price), 0)
  }

  const calculateTotalPrice = () => {
    if (!product) return 0
    const basePrice = (product.on_sale && product.sale_price) ? parseFloat(product.sale_price) : parseFloat(product.price) || 0;
    return basePrice + calculateEngravingPrice() + calculateAddonsPrice(); // ← נוסף calculateAddonsPrice()
  }

  // ← נוסף: wrapper ששולח גם addons/verse/notes
  const handleAddToCart = () => {
    const chosenAddons = addons.filter(a => selectedAddons[a.id])
    addToCart(product, quantity, customText, chosenAddons, selectedVerse, productNotes)
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

          {/* ← נוסף: סקשן תוספות — מופיע רק לטליתות */}
          {product.category_id === 1 && (
            <div className="mb-8 border border-gray-200 rounded-lg p-5 bg-gray-50 flex flex-col gap-5">

              {/* פסוק לרקמה */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  * בחרו פסוק לרקמה על הטרה :
                </label>
                <select
                  value={selectedVerse}
                  onChange={e => setSelectedVerse(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 bg-white text-right focus:outline-none focus:border-black text-sm"
                >
                  <option value="">— בחרו פסוק —</option>
                  {TALLIT_VERSES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* checkboxes תוספות */}
              {addons.length > 0 && (
                <div className="flex flex-col gap-3">
                  {addons.map(addon => (
                    <label key={addon.id} className="flex items-center justify-between gap-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedAddons[addon.id]}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-5 h-5 cursor-pointer accent-black"
                        />
                        <span className="text-sm text-gray-800">{addon.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">
                        ₪{parseFloat(addon.price).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* הערות */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  הוסיפו הערות למוצר במידת הצורך :
                </label>
                <textarea
                  value={productNotes}
                  onChange={e => setProductNotes(e.target.value)}
                  rows={3}
                  placeholder="לדוגמה: מידות מיוחדות, צבע מועדף..."
                  className="w-full border border-gray-300 rounded px-4 py-3 text-sm bg-white resize-none focus:outline-none focus:border-black"
                />
              </div>

            </div>
          )}
          {/* סוף סקשן תוספות */}

          {/* הכפתור המקורי — רק השתנה ל-handleAddToCart */}
          <button onClick={handleAddToCart} className="bg-black text-white py-4 hover:bg-gray-800 transition-all">הוספה לסל</button>
          <p className="mt-8 text-gray-600">{product.description}</p>
        </div>
      </main>
    </div>
  )
}
