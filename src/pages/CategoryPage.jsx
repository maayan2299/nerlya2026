import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseUrl } from '../lib/supabase'
import { getProducts, getImageUrl } from '../lib/products'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'

export default function CategoryPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // מיפוי בין ID בנתיב ל-ID בדאטהבייס
  const categoryIdMap = {
    'prayers': 18,           // תפילות וברכונים
    'tallit-covers': 4,      // כיסוי טלית ותפילין
    'natlot': 5,             // נטלות
    'candlesticks': 6,       // פמוטים
    'wine-cups': 7,          // כוסות יין
    'salt-shakers': 8,       // מלחיות
    'havdalah': 9,           // סט הבדלה
    'plaster': 17,           // מוצרי גבס
    'other': 11              // מוצרים נוספים
  }

  // רשימת כל הקטגוריות לתצוגה
  const categories = [
    { id: 'prayers', name: 'תפילות וברכונים' },
    { id: 'tallit-covers', name: 'כיסוי טלית ותפילין' },
    { id: 'natlot', name: 'נטלות' },
    { id: 'candlesticks', name: 'פמוטים' },
    { id: 'wine-cups', name: 'כוסות יין' },
    { id: 'salt-shakers', name: 'מלחיות' },
    { id: 'havdalah', name: 'סט הבדלה' },
    { id: 'plaster', name: 'מוצרי גבס' },
    { id: 'other', name: 'מוצרים נוספים' }
  ]

  const currentCategory = categories.find(c => c.id === id)

  useEffect(() => {
    async function fetchCategoryProducts() {
      setLoading(true)
      try {
        const allProducts = await getProducts()
        // סינון לפי category_id המספרי
        const categoryDbId = categoryIdMap[id]
        const filtered = allProducts.filter(p => p.category_id === categoryDbId)
        
        // סידור לפי שם (א-ב)
        const sorted = filtered.sort((a, b) => 
          a.name.localeCompare(b.name, 'he')
        )
        
        setProducts(sorted)
      } catch (error) {
        console.error("שגיאה בטעינה:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryProducts()
  }, [id])

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* עגלת קניות */}
      <CartDrawer />
      
      {/* Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-serif text-black mb-2 font-normal">{currentCategory?.name}</h2>
          <div className="h-[1px] w-12 bg-black mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400">טוען...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => {
                const imgUrl = product.main_image_url 
                  ? getImageUrl(product.main_image_url)
                  : '';

                return (
                  <div key={product.id} className="group relative">
                    {/* אייקון עגלה עגול לבן */}
                    <button 
                      className="absolute top-3 left-3 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center z-20 border border-gray-100 hover:bg-black hover:text-white transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product, 1);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>

                    <Link to={`/product/${product.id}`} className="block">
                      <div className="aspect-square bg-[#f9f9f9] rounded-lg overflow-hidden mb-4 border border-gray-50">
                        <img 
                          src={imgUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="text-right px-1">
                        <h3 className="text-[14px] text-gray-800 font-medium mb-1">{product.name}</h3>
                        <p className="text-[15px] font-bold text-black mb-2">₪{product.price}</p>
                        
                        {/* עיגולי צבעים */}
                        {product.related_products && product.related_products.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {/* הצבע הנוכחי */}
                            <div 
                              className="w-5 h-5 rounded-full border border-black" 
                              style={{ backgroundColor: product.color_code }}
                              title={product.color_name}
                            />
                            
                            {/* צבעים אחרים */}
                            {product.related_products.map((variant) => (
                              <div
                                key={variant.id}
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.code }}
                                title={variant.color}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* הודעה אם אין מוצרים בקטגוריה */}
            {products.length === 0 && (
              <div className="text-center py-24 text-gray-400 font-serif italic font-normal">
                המוצרים בקטגוריה זו יעלו בקרוב...
              </div>
            )}
          </>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}