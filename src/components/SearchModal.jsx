import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getImageUrl } from '../lib/products'

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isOpen])

  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim().length < 1) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const allProducts = await getProducts()
        // מציג את כל המוצרים שמתאימים - ללא הגבלה!
        const filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered) // כל התוצאות!
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(performSearch, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* רקע כהה */}
      <div 
        className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* החלון */}
      <div className="fixed top-32 md:top-36 left-0 right-0 bottom-0 z-40 overflow-y-auto" dir="rtl">
        <div className="h-full px-4 py-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl animate-slideIn h-full overflow-y-auto">
            
            {/* Header עם שורת החיפוש */}
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl z-10">
              <div className="px-6 py-5 flex items-center gap-4">
                {/* כפתור סגירה */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="סגור"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* שורת החיפוש */}
                <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="מה תרצה לחפש?"
                    className="flex-1 text-lg outline-none bg-transparent"
                    autoFocus
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* מספר תוצאות */}
              {searchQuery && !loading && searchResults.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    נמצאו {searchResults.length} תוצאות
                  </p>
                </div>
              )}
            </div>

            {/* תוכן */}
            <div className="p-6">
              {/* טוען */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
              )}

              {/* אין תוצאות */}
              {!loading && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">
                    לא נמצאו תוצאות עבור "{searchQuery}"
                  </p>
                </div>
              )}

              {/* גריד מוצרים - בדיוק כמו בתמונה שלך! */}
              {!loading && searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="group cursor-pointer"
                    >
                      {/* תמונה */}
                      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                        <img
                          src={getImageUrl(product.main_image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* שם מוצר */}
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* מחיר */}
                      <p className="text-base font-bold text-black">
                        ₪{product.price}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {/* הצעות חיפוש */}
              {!searchQuery && (
                <div className="py-8">
                  <p className="text-sm text-gray-500 mb-4">חיפושים פופולריים:</p>
                  <div className="flex flex-wrap gap-3">
                    {['נרות שבת', 'פמוטים', 'כוסות יין', 'נטלות', 'מלחיות', 'הבדלה', 'מזוזות', 'ברכונים'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors font-medium"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}} />
    </>
  )
}