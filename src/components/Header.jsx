import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import SearchModal from './SearchModal'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { getItemCount, setIsCartOpen } = useCart()

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          נר-ליה • אור של קדושה בכל בית | <span className="text-red-600">!האתר אינו עובד בשבת</span>
        </p>
      </div>

      {/* Header */}
      <header 
        className={`sticky top-0 z-[100] shadow-lg transition-all duration-500 ${
          scrolled ? 'bg-black' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[200px_1fr_120px] items-center py-4 gap-4">
            
            {/* אזור ימין - המבורגר + לוגו */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* המבורגר לנייד */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 transition-colors ${scrolled ? 'text-white' : 'text-black'}`}
                aria-label="תפריט"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* לוגו */}
              <Link to="/">
                <h1 
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider transition-colors whitespace-nowrap ${scrolled ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400, letterSpacing: '0.15em' }}
                >
                  נר-ליה
                </h1>
              </Link>
            </div>

            {/* אזור מרכז - קטגוריות (רק דסקטופ) */}
            <nav className="hidden lg:flex items-center justify-center gap-3 xl:gap-4">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className={`text-[13px] xl:text-sm font-medium transition-colors whitespace-nowrap hover:underline ${
                    scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* אזור שמאל - אייקונים */}
            <div className="flex gap-3 md:gap-4 items-center justify-end">
              <button 
                onClick={() => setSearchOpen(true)}
                className={`p-2 md:p-2.5 transition-all hover:scale-110 ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                aria-label="חיפוש"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`p-2 md:p-2.5 transition-all hover:scale-110 relative ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                aria-label="עגלת קניות"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${scrolled ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* תפריט נייד */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        
        <div className={`absolute top-0 right-0 h-full w-[240px] bg-white shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400 }}>נר-ליה</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-3 overflow-y-auto h-[calc(100%-65px)]">
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors font-normal text-gray-800 text-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}


