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
    <section className="py-12 md:py-16 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* כותרת מינימליסטית */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-gray-900 inline-flex items-center gap-2">
            המומלצים שלנו
            <span className="text-2xl">🖤</span>
          </h2>
        </div>

        {/* גלילה אופקית - שורה אחת בלבד */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
              {featuredProducts.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url
                const imageUrl = getImageUrl(primaryImage || product.main_image_url)

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex-shrink-0"
                    style={{ width: 'calc((100vw - 2rem - 3rem) / 2)', maxWidth: '280px' }}
                  >
                    {/* לב אדום קטן */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
                        <span className="text-red-500 text-base">❤</span>
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
                    <div className="p-3">
                      <h3 className="font-serif text-sm md:text-base font-normal text-gray-900 mb-1.5 line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-base md:text-lg font-medium text-[#d4af37]">
                          ₪{parseFloat(product.price).toLocaleString('he-IL')}
                        </p>
                        
                        {product.engraving_available && (
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
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
          </div>

          {/* אינדיקטור גלילה (אם יש יותר מ-4) */}
          {featuredProducts.length > 4 && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">← גלול לצפייה בעוד מוצרים →</p>
            </div>
          )}
        </div>

        {/* כפתור לכל המוצרים */}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            צפו בכל המוצרים
          </Link>
        </div>
      </div>

      {/* CSS להסתרת סרגל גלילה */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (min-width: 768px) {
          .flex > * {
            width: calc((100% - 4.5rem) / 4) !important;
            max-width: 280px;
          }
        }
      `}</style>
    </section>
  )
}
