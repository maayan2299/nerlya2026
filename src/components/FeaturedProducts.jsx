import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getImageUrl } from '../lib/products'

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  async function fetchFeaturedProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (featuredProducts.length === 0) return null

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* כותרת אלגנטית עם לב */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-xl">🤍</span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-gray-900">
              המומלצים שלנו
            </h2>
            <span className="text-xl">🤍</span>
          </div>
          <p className="text-gray-600 text-sm md:text-base font-light">
            מוצרים נבחרים במיוחד עבורכם - איכות מעולה ועיצוב ייחודי
          </p>
        </div>

        {/* רשת מוצרים */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {featuredProducts.map((product) => {
            const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url
            const imageUrl = getImageUrl(primaryImage || product.main_image_url)

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* לב אדום קטן בפינה */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <span className="text-red-500 text-lg">❤</span>
                  </div>
                </div>

                {/* תמונה */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* פרטים */}
                <div className="p-4">
                  <h3 className="font-serif text-base md:text-lg font-normal text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-lg md:text-xl font-medium text-[#d4af37]">
                      ₪{parseFloat(product.price).toLocaleString('he-IL')}
                    </p>
                    
                    {product.engraving_available && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        ✨ חריטה
                      </span>
                    )}
                  </div>
                </div>

                {/* אפקט hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-lg transition-all duration-300 pointer-events-none"></div>
              </Link>
            )
          })}
        </div>

        {/* כפתור לכל המוצרים */}
        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            צפו בכל המוצרים
          </Link>
        </div>
      </div>
    </section>
  )
}
