import { useState, useEffect } from 'react'
import { supabaseUrl } from '../lib/supabase'

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // רשימת התמונות שלך
  const banners = [
    'banner1.jpg',
    'banner2.png',
    'banner3.png',
    'banner4.png',
    'banner5.png',
    'banner6.png',
    'banner7.png',
    'banner8.png',
    'banner9.png'
  ]

  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const storageUrl = `${baseUrl}/storage/v1/object/public/banners`

  useEffect(() => {
    const timer = setInterval(() => {
      // מקדם את האינדקס באחד, וחוזר להתחלה כשמגיע לסוף
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  // פונקציה שמחשבת אלו 3 תמונות להציג עכשיו (לולאה אינסופית)
  const getVisibleBanners = () => {
    return [
      banners[currentIndex % banners.length],
      banners[(currentIndex + 1) % banners.length],
      banners[(currentIndex + 2) % banners.length]
    ]
  }

  const visibleSlides = getVisibleBanners()

  return (
    // קונטיינר ראשי - ללא רווחים, תופס את כל הרוחב
    <div className="w-full h-[500px] md:h-[650px] overflow-hidden relative bg-gray-900">
      
      {/* אזור התמונות - מסודר כ-FLEX צמוד */}
      <div className="flex w-full h-full">
        {visibleSlides.map((fileName, index) => (
          <div 
            key={`${fileName}-${index}`} // מפתח ייחודי לרענון
            className="relative w-full md:w-1/3 h-full flex-shrink-0 animate-fade-slide" 
          >
            <img
              src={`${storageUrl}/${fileName}`}
              alt="אווירה"
              className="w-full h-full object-cover" // object-cover דואג שלא יהיו שוליים לבנים
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            
            {/* שכבת כהות עדינה מאוד שתעלם במעבר עכבר - נותן תחושת עומק */}
            <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors duration-500"></div>
          </div>
        ))}
      </div>

      {/* אנימציית CSS מותאמת אישית למעבר חלק */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0.8; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-slide {
          animation: fadeSlide 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
