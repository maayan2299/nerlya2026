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
<div className="bg-gray-50 text-black py-3 text-center border-b border-gray-200">
  <span 
    className="text-lg md:text-xl"
    style={{ 
      fontFamily: "'Dancing Script', 'Amatic SC', 'Caveat', cursive",
      fontWeight: 700,
      letterSpacing: '0.08em'
    }}
  >
    "נר-ליה" - אור של קדושה בכל בית | האתר אינו עובד בשבת
  </span>
</div>

      {/* Header */}
      <header 
        className={`sticky top-0 z-[100] border-b shadow-lg transition-all duration-500 ${
          scrolled 
            ? 'bg-black border-black' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            
            {/* המבורגר לנייד - צד ימין */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${
                scrolled ? 'text-white' : 'text-black'
              }`}
              aria-label="תפריט"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* לוגו - במרכז בנייד, בצד ב-desktop */}
            <Link to="/" className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
              <h1 
                className={`text-4xl md:text-5xl font-bold tracking-wider transition-colors duration-300 ${
                  scrolled ? 'text-white' : 'text-black'
                }`}
                style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400, letterSpacing: '0.15em' }}
              >
                נר-ליה
              </h1>
            </Link>

            {/* קטגוריות - רק ב-desktop */}
            <nav className="hidden lg:block flex-1 px-16">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-center">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/category/${cat.id}`}
                    className={`text-sm font-medium transition-all duration-300 whitespace-nowrap tracking-wide ${
                      scrolled 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* אייקונים - צד שמאל */}
            <div className="flex gap-4 md:gap-6 items-center flex-shrink-0">
              <button 
                onClick={() => setSearchOpen(true)}
                className={`p-2 md:p-2.5 transition-all duration-300 hover:scale-110 ${
                  scrolled 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-black'
                }`}
                aria-label="חיפוש"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`p-2 md:p-2.5 transition-all duration-300 hover:scale-110 relative ${
                  scrolled 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-black'
                }`}
                aria-label="עגלת קניות"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getItemCount() > 0 && (
                  <span 
                    className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                      scrolled 
                        ? 'bg-white text-black' 
                        : 'bg-black text-white'
                    }`}
                  >
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* תפריט נייד - נפתח מהצד */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* רקע כהה */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        
        {/* תפריט */}
        <div 
          className={`absolute top-0 right-0 h-full w-[240px] bg-white shadow-2xl transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* כותרת תפריט */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 
              className="text-2xl font-bold"
              style={{ fontFamily: "'StamSefarad', serif", fontWeight: 400 }}
            >
              נר-ליה
            </h2>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* רשימת קטגוריות */}
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

      {/* חלון חיפוש */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}