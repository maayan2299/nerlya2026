import { Link } from 'react-router-dom'
import { supabaseUrl } from '../lib/supabase'
import AccessibilityMenu from '../components/AccessibilityMenu'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FeaturedProducts from '../components/FeaturedProducts' // ⭐ הוסף כאן!
import { useState, useEffect } from 'react'

export default function HomePage() {

  const categories = [
    { id: 18, title: 'תפילות וברכונים', fileName: 'prayers.png' },
{ id: 4, title: 'כיסוי טלית ותפילין', fileName: 'tallit-covers.png' },
{ id: 5, title: 'נטלות', fileName: 'natlot.png' },
{ id: 6, title: 'פמוטים', fileName: 'candlesticks.png' },
{ id: 7, title: 'כוסות יין', fileName: 'wine-cups.png' },
{ id: 8, title: 'מלחיות', fileName: 'salt-shakers.png' },
{ id: 9, title: 'סט הבדלה', fileName: 'havdalah.png' },
{ id: 17, title: 'מוצרי גבס', fileName: 'plaster.png' },
{ id: 11, title: 'מוצרים נוספים', fileName: 'other.png' }
  ]

  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const mainBannerUrl = `${baseUrl}/storage/v1/object/public/banners/banner.png`

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      
      {/* תפריט נגישות */}
      <AccessibilityMenu />
      
      {/* עגלת קניות */}
      <CartDrawer />
      
      {/* Header */}
      <Header />

      {/* באנר ראשי */}
      <section className="w-full">
        <img 
          src={mainBannerUrl} 
          alt="נר-ליה" 
          className="w-full h-auto object-contain" 
          style={{ maxHeight: '70vh' }} 
        />
      </section>

      {/* ⭐ המומלצים שלנו - הוסף כאן! */}
      <FeaturedProducts />

      {/* סליידר קטגוריות */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 relative">
        <h2 
          className="text-center text-2xl md:text-4xl font-normal mb-6 md:mb-14 text-black tracking-wide font-serif"
        >
          הקטגוריות שלנו
        </h2>
        
        <div className="relative">
  {/* חץ שמאלי */}
  <button
    onClick={() => {
      const container = document.getElementById('categories-scroll');
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }}
    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-all"
  >
    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* חץ ימני */}
  <button
    onClick={() => {
      const container = document.getElementById('categories-scroll');
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }}
    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-all"
  >
    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <div id="categories-scroll" className="flex gap-3 md:gap-6 overflow-x-auto pb-4 md:pb-8 no-scrollbar px-12 md:px-14">
    {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`} 
              className="min-w-[140px] md:min-w-[220px] lg:min-w-[260px] relative group cursor-pointer"
            >
              <div className="aspect-[4/5] rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-xl relative bg-gray-50">
                <img 
                  src={`${baseUrl}/storage/v1/object/public/categories/${cat.fileName}`} 
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.querySelector('.placeholder').style.display = 'flex'
                  }}
                />
                {/* Placeholder אם תמונה לא קיימת */}
                <div className="placeholder hidden absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center">
                  <svg className="w-16 h-16 md:w-24 md:h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                
                <div className="absolute bottom-2 md:bottom-5 right-2 md:right-5 left-2 md:left-5 flex justify-between items-end z-20">
                  <h3 
                    className="text-white text-sm md:text-xl font-medium drop-shadow-lg tracking-wide"
                  >
                    {cat.title}
                  </h3>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-black transform rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  </section>

      {/* פיד אינסטגרם */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white overflow-hidden">
        
        {/* כותרת - מעל בנייד, בצד ב-desktop */}
        <div className="text-center md:absolute md:top-8 md:right-8 z-10 mb-6 md:mb-0">
          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-normal text-black tracking-wider font-serif"
          >
            עקבו אחרינו
          </h2>
        </div>

        {/* תמונות + מוקאפ טלפון - תמיד מוצג */}
        <div className="flex items-center justify-center gap-2 md:gap-6">
          
          {/* תמונה שמאלית 1 */}
          <div className="w-[90px] md:w-[180px] lg:w-[200px] aspect-square bg-gray-100 rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 shadow-md md:shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img 
              src={`${baseUrl}/storage/v1/object/public/instagram/post1.jpg`}
              alt="Instagram 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* תמונה שמאלית 2 - מוסתרת בנייד קטן */}
          <div className="hidden sm:block w-[90px] md:w-[180px] lg:w-[200px] aspect-square bg-gray-100 rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 shadow-md md:shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img 
              src={`${baseUrl}/storage/v1/object/public/instagram/post2.jpg`}
              alt="Instagram 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* מוקאפ טלפון - תמיד מוצג! */}
          <div className="flex justify-center items-center flex-shrink-0 relative z-20">
            <div className="relative">
              <div className="w-[160px] h-[320px] md:w-[240px] md:h-[480px] lg:w-[280px] lg:h-[560px] bg-black rounded-[25px] md:rounded-[40px] lg:rounded-[45px] p-2 md:p-3 lg:p-3.5 shadow-xl md:shadow-2xl">
                <div className="w-full h-full bg-white rounded-[20px] md:rounded-[33px] lg:rounded-[38px] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-4 md:w-28 md:h-5 lg:w-36 lg:h-6 bg-black rounded-b-2xl md:rounded-b-3xl z-30"></div>
                  
                  <div className="w-full h-full bg-white pt-6 md:pt-10 lg:pt-12 px-2 md:px-4 lg:px-5">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                      <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px] md:p-[2px]">
                          <div className="w-full h-full rounded-full bg-white"></div>
                        </div>
                        <span className="text-[10px] md:text-xs lg:text-sm font-medium tracking-wide">nerlya_judaica</span>
                      </div>
                      <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </div>

                    <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 md:mb-3 lg:mb-4 overflow-hidden">
                      <img 
                        src={`${baseUrl}/storage/v1/object/public/instagram/post4.jpg`}
                        alt="Instagram post"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between mb-1 md:mb-1.5 lg:mb-2">
                      <div className="flex gap-2 md:gap-3 lg:gap-4">
                        <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                        <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                        </svg>
                        <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      </div>
                      <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </div>

                    <div className="text-[8px] md:text-[10px] lg:text-xs">
                      <p className="font-normal mb-0.5 md:mb-1 tracking-wide">174 likes</p>
                      <p className="text-gray-600 leading-relaxed font-normal">
                        <span className="font-semibold text-black">nerlya_judaica</span> תשמישי קדושה מהממים ✨
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* תמונה ימנית 1 - מוסתרת בנייד קטן */}
          <div className="hidden sm:block w-[90px] md:w-[180px] lg:w-[200px] aspect-square bg-gray-100 rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 shadow-md md:shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img 
              src={`${baseUrl}/storage/v1/object/public/instagram/post5.jpg`}
              alt="Instagram 5"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* תמונה ימנית 2 */}
          <div className="w-[90px] md:w-[180px] lg:w-[200px] aspect-square bg-gray-100 rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 shadow-md md:shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img 
              src={`${baseUrl}/storage/v1/object/public/instagram/post6.jpg`}
              alt="Instagram 6"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>

        {/* שם המשתמש - למטה */}
        <div className="text-center mt-6 md:mt-8">
          <a 
            href="https://instagram.com/nerlya_judaica" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl md:text-2xl lg:text-3xl font-normal text-black hover:text-gray-600 transition-colors tracking-wide inline-block"
          >
            @nerlya_judaica
          </a>
        </div>

      </section>

      {/* יתרונות שירות */}
      <section className="bg-white border-y border-gray-200 py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 md:mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-black" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2 tracking-wide text-black">איכות גבוהה</h3>
              <p className="text-[10px] md:text-xs text-gray-600 max-w-[140px] md:max-w-[160px] leading-relaxed font-normal">תשמישי קדושה איכותיים לכל בית</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 md:mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-black" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2 tracking-wide text-black">שירות לקוחות</h3>
              <p className="text-[10px] md:text-xs text-gray-600 max-w-[140px] md:max-w-[160px] leading-relaxed font-normal">זמינים כאן לכל שאלה</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 md:mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-black" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2 tracking-wide text-black">תשלום מאובטח</h3>
              <p className="text-[10px] md:text-xs text-gray-600 max-w-[140px] md:max-w-[160px] leading-relaxed font-normal">בכל דרך שנוחה לך</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 md:mb-4 text-xl md:text-2xl font-light text-black">₪</div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2 tracking-wide text-black">משלוח חינם</h3>
              <p className="text-[10px] md:text-xs text-gray-600 max-w-[140px] md:max-w-[160px] leading-relaxed font-normal">מעל 400 ₪</p>
            </div>
          </div>
        </div>
      </section>

      {/* כפתור WhatsApp */}
      <a 
        href="https://wa.me/972534726022" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 bg-[#25D366] text-white rounded-full p-3 md:p-4 shadow-2xl hover:scale-110 transition-transform duration-300"
      >
        <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Footer */}
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
