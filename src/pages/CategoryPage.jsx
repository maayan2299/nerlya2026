import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getImageUrl } from '../lib/products'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CategoryPage() {
  const { id } = useParams() // ← זה המספר מה-URL!
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      setLoading(true)
      try {
        // 1. שלוף את הקטגוריה
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single()

        if (categoryError) throw categoryError
        setCategory(categoryData)

        // 2. שלוף את המוצרים של הקטגוריה
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
              image_url,
              is_primary
            )
          `)
          .eq('category_id', id)
          .eq('is_active', true)
          .order('name')

        if (productsError) throw productsError
        setProducts(productsData || [])
        
      } catch (error) {
        console.error("שגיאה בטעינה:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchCategoryAndProducts()
    }
  }, [id])

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: category?.name || 'קטגוריה', link: null }
  ]

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-serif text-black mb-2 font-normal">
                {category?.name || 'קטגוריה'}
              </h2>
              <div className="h-[1px] w-12 bg-black mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url
                const imgUrl = getImageUrl(primaryImage || product.main_image_url)

                return (
                  <div key={product.id} className="group relative">
                    {/* כפתור הוספה לעגלה */}
                    <button 
                      className="absolute top-3 left-3 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center z-20 border border-gray-100 hover:bg-black hover:text-white transition-all"
                      onClick={(e) => {
                        e.preventDefault()
                        addToCart(product, 1)
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
                          loading="lazy"
                        />
                      </div>
                      <div className="text-right px-1">
                        <h3 className="text-[14px] text-gray-800 font-medium mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-[15px] font-bold text-black mb-2">
                          ₪{parseFloat(product.price).toLocaleString('he-IL')}
                        </p>
                        
                        {product.engraving_available && (
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                            ✨ חריטה
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* הודעה אם אין מוצרים */}
            {products.length === 0 && (
              <div className="text-center py-24 text-gray-400 font-serif italic font-normal">
                המוצרים בקטגוריה זו יעלו בקרוב...
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
