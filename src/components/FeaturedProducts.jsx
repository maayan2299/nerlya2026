import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getImageUrl } from '../lib/products'

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, is_primary)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error loading featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white" dir="rtl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return null // אם אין מוצרים מומלצים, לא להציג כלום
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* כותרת */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">⭐</span>
            <h2 className="font-serif text-4xl md:text-5xl text-black tracking-tight">
              המומלצים שלנו
            </h2>
            <span className="text-4xl">⭐</span>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            מוצרים נבחרים במיוחד עבורכם - איכות מעולה ועיצוב ייחודי
          </p>
        </div>

        {/* רשת מוצרים */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredProducts.map((product) => {
            const primaryImage = product.product_images?.find(img => img.is_primary)
            const imageUrl = getImageUrl(primaryImage?.image_url || product.main_image_url)

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group block bg-white transition-all duration-500 hover:shadow-xl rounded-lg overflow-hidden relative"
              >
                {/* תג מומלץ */}
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <span>⭐</span>
                  <span>מומלץ</span>
                </div>

                {/* תמונה */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name || 'מוצר נר-ליה'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* אפקט מעבר */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                {/* פרטי מוצר */}
                <div className="p-4 text-center">
                  <h3 className="font-serif text-lg md:text-xl text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300 tracking-tight font-medium">
                    {product.name || 'מוצר יוקרה'}
                  </h3>
                  
                  {product.price && (
                    <p className="font-light text-gray-700 text-base md:text-lg font-semibold">
                      ₪{parseFloat(product.price).toLocaleString('he-IL')}
                    </p>
                  )}

                  {/* אינדיקטור חריטה */}
                  {product.engraving_available && (
                    <p className="text-xs text-yellow-600 mt-2 flex items-center justify-center gap-1">
                      <span>✨</span>
                      <span>זמין לחריטה</span>
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* כפתור לכל המוצרים */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-base tracking-wide font-medium rounded-lg"
          >
            צפו בכל המוצרים →
          </Link>
        </div>
      </div>
    </section>
  )
}
