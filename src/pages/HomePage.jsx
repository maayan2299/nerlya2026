import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseUrl } from '../lib/supabase'
import AccessibilityMenu from '../components/AccessibilityMenu'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FeaturedProducts from '../components/FeaturedProducts'
import Hero from '../components/Hero' // <--- חשוב מאוד: הייבוא של ה-Hero

export default function HomePage() {
  const [selectedInstagramImage, setSelectedInstagramImage] = useState('post4.jpg')
  
  // הגדרת בסיס לכתובות תמונות
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      
      <AccessibilityMenu />
      <CartDrawer />
      <Header />

      {/* כאן מופיע הבאנר עם 3 התמונות המתחלפות */}
      <Hero />

      {/* שאר האתר */}
      <FeaturedProducts />

      {/* סליידר קטגוריות */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 relative">
        <h2 className="text-center text-2xl md:text-4xl font-normal mb-6 md:mb-14 text-black tracking-wide font-serif">
          הקטגוריות שלנו
        </h2>
        {/* ... כאן ממשיך שאר הקוד של הקטגוריות והאינסטגרם כרגיל ... */}
        {/* (אני מקצר כאן כדי לא לבלבל, אבל תשאירי את שאר הקוד שהיה לך למטה) */}
        
        <div className="relative">
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
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                  <div className="absolute bottom-2 md:bottom-5 right-2 md:right-5 left-2 md:left-5 flex justify-between items-end z-20">
                    <h3 className="text-white text-sm md:text-xl font-medium drop-shadow-lg tracking-wide">
                      {cat.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* כאן אמור לבוא קוד האינסטגרם שלך... */}
      
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
        }
      `}} />
    </div>
  )
}
