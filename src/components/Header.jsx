import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import SearchModal from './SearchModal'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { getItemCount, setIsCartOpen } = useCart()

  // רשימת הקטגוריות
  const categories = [
    { id: 18, name: 'תפילות וברכונים' },
    { id: 4, name: 'כיסוי טלית ותפילין' },
    { id: 5, name: 'נטלות' },
    { id: 6, name: 'פמוטים' },
    { id: 7, name: 'כוסות יין' },
    { id: 8, name: 'מלחיות' },
    { id: 9, name: 'סט הבדלה' },
    { id: 17, name: 'מוצרי גבס' },
    { id: 11, name: 'מוצרים נוספים' }
  ]

  // זיהוי גלילה
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // נעילת גלילה כשהתפריט בנייד פתוח
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* פס הכרזה עליון */}
      <div className="bg-gray-50 text-black py-2 text-center border-b border-gray-200">
        <p className="text-xs sm:text-sm font-medium px-4">
          נר-ליה • אור של קדושה בכל בית | <span className="text-red-600 font-bold">האתר אינו עובד בשבת</span>
        </p>
      </div>

      {/* Header ראשי */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${
          scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between lg:grid lg:grid-cols-[200px_1fr_200px] gap-4">
            
            {/* צד ימין - לוגו (והחלק הימני בגריד) */}
            <div className="flex items-center gap-3">
              {/* כפתור המבורגר (רק בנייד) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="פתח תפריט"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* לוגו */}
              <Link to="/" className="group flex-shrink-0">
                <h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider transition-colors text-black"
                  style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400, letterSpacing: '0.1em' }}
                >
                  נר-ליה
                </h1>
              </Link>
            </div>

            {/* מרכז - תפריט ניווט לדסקטופ (החלק המרכזי בגריד) */}
            <nav className="hidden lg:flex items-center justify-center flex-wrap gap-x-5 gap-y-2 xl:gap-x-8">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="text-sm font-medium text-gray-600 hover:text-black hover:underline underline-offset-8 transition-all duration-200 whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* צד שמאל - אייקונים (החלק השמאלי בגריד) */}
            <div className="flex gap-2 items-center justify-end">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                aria-label="חיפוש"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all relative"
                aria-label="עגלת קניות"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* תפריט נייד משודרג (זהה לקוד הקודם, רק מוודא שנמצא פה) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-500 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 
              className="text-2xl font-bold text-gray-800" 
              style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400 }}
            >
              תפריט
            </h2>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 -ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-6 overflow-y-auto h-[calc(100%-80px)]">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-900 font-medium hover:bg-gray-100 transition-colors"
              >
                <span>דף הבית</span>
                <svg className="w-4 h-4 text-gray-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <span className="text-lg text-gray-600 group-hover:text-black group-hover:translate-x-1 transition-transform font-normal" style={{ fontFamily: "'StamSefarad', serif" }}>
                    {cat.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
             <div className="mt-8 pt-6 border-t border-gray-100 text-center">
               <p className="text-xs text-gray-400">נר-ליה יודאיקה © 2026</p>
            </div>
          </nav>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
