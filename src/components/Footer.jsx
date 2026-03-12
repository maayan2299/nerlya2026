import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function Footer() {
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

  const aboutLinks = [
    { label: 'עלינו', link: '/about' },
    { label: 'מדיניות פרטיות ותקנון', link: '/privacy' },
  ]

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <ScrollToTop />
      <footer className="bg-black border-t border-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          
          {/* Grid עם לוגו בצד ימין */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            
            {/* עמודה 1 - לוגו גדול בצד ימין */}
            <div className="md:col-span-1 flex justify-center md:justify-end">
              <Link to="/" className="block" onClick={handleLinkClick}>
                <img 
                  src="https://ormbbartqrpgtsmoqxhm.supabase.co/storage/v1/object/public/product-images/logo.png"
                  alt="נר-ליה - תשמישי קדושה" 
                  className="w-48 md:w-56 h-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* שאר העמודות - 3 עמודות תוכן */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              
              {/* עמודה 2 - קטגוריות */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-lg mb-4 text-white">קטגוריות</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link 
                        to={`/category/${cat.id}`}
                        onClick={handleLinkClick}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* עמודה 3 - על החנות */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-lg mb-4 text-white">על החנות</h3>
                <ul className="space-y-2">
                  {aboutLinks.map((item, index) => (
                    <li key={index}>
                      <Link 
                        to={item.link}
                        onClick={handleLinkClick}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* עמודה 4 - יצירת קשר */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-lg mb-4 text-white">יצירת קשר</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <span className="font-semibold text-white">טלפון חנות:</span> 053-472-6022
                  </li>
                  <li>
                    <span className="font-semibold text-white">וואטסאפ לבירורים:</span> 053-472-6022
                  </li>
                  <li>
                    <span className="font-semibold text-white">מייל:</span>{' '}
                    <a href="mailto:info@nerlya.com" className="hover:text-white transition-colors">
                      info@nerlya.com
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold text-white">שעות פתיחה:</span> 8:30-17:00
                  </li>
                </ul>

                {/* אייקונים חברתיים */}
                <div className="flex gap-3 mt-6 justify-center md:justify-start">
                  <a 
                    href="https://www.facebook.com/nerlya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://instagram.com/nerlya_judaica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* קו מפריד */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>
                נבנה ועוצב ע״י{' '}
                <a 
                  href="https://wa.me/9720505515745"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-gray-300 transition-colors cursor-pointer"
                >
                  MB
                </a>
              </p>
              <p>© {new Date().getFullYear()} נר-ליה. כל הזכויות שמורות.</p>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}