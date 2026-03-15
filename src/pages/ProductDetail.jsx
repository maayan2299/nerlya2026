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
  const [selectedOptions, setSelectedOptions] = useState({})

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await getProductById(id)
        if (!data) { setError('Product not found'); return; }
        setProduct(data)
        if (data.options && data.options.length > 0) {
          const initial = {}
          data.options.forEach(group => { initial[group.title] = group.items[0] })
          setSelectedOptions(initial)
        }
      } catch (err) { setError('Failed to load product.') } finally { setLoading(false) }
    }
    if (id) fetchProduct()
  }, [id])

  const calculateTotalPrice = () => {
    if (!product) return 0;
    const basePrice = parseFloat(product.price) || 0;
    const optionsPrice = Object.values(selectedOptions).reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const engravingPrice = (product.engraving_available && customText.trim()) ? (product.category_id === 4 ? customText.trim().length * 5 : parseFloat(product.engraving_price) || 10) : 0;
    return basePrice + optionsPrice + engravingPrice;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>
  if (error || !product) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => navigate('/')}>חזרה לבית</button></div>

  // תיקון שגיאת התמונה מהצילום מסך
  const images = product.images?.length > 0 
    ? product.images.map(img => img.image_url) 
    : [product.image_url].filter(Boolean);
  const mainImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <Breadcrumbs items={[{ label: 'עמוד הבית', link: '/' }, { label: product.name, link: null }]} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gray-50 border rounded-xl overflow-hidden">
            <img src={mainImage} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 mt-4">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImageIndex(i)} className={`w-20 h-20 border-2 ${selectedImageIndex === i ? 'border-black' : 'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-serif mb-4">{product.name}</h1>
          <p className="text-2xl mb-8">₪{calculateTotalPrice().toLocaleString()}</p>

          {product.options?.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-bold mb-3 text-sm">{group.title}</h3>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={iIdx}
                    onClick={() => setSelectedOptions({...selectedOptions, [group.title]: item})}
                    className={`flex justify-between p-3 border rounded-lg ${selectedOptions[group.title]?.name === item.name ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <span>{item.name}</span>
                    {item.price > 0 && <span className="text-gray-500">+ ₪{item.price}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button onClick={() => addToCart({...product, selectedChoices: selectedOptions}, quantity, customText)} className="w-full bg-black text-white py-4 font-bold mt-4">
            הוספה לסל
          </button>
          
          <p className="mt-8 text-gray-600">{product.description}</p>
        </div>
      </main>
    </div>
  )
}
