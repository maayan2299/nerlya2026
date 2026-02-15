import { useState, useEffect } from 'react'
import { supabaseUrl } from '../lib/supabase'

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // רשימת התמונות המדויקת לפי הצילום מסך שלך
  const banners = [
    'banner1.jpg', // שמי לב שזה JPG
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

  // פונקציה למעבר אוטומטי
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000) // כל 5 שניות

    return () => clearInterval(timer)
  }, [banners.length])

  // חישוב אלו 3 תמונות להציג כרגע
  // הלוגיקה הזו דואגת שגם אם הגענו לסוף הרשימה, זה יתחיל מההתחלה בצורה חלקה
  const getVisibleBanners = () => {
    const b1 = banners[currentIndex % banners.length]
    const b2 = banners[(currentIndex + 1) % banners.length]
    const b3 = banners[(currentIndex + 2) % banners.length]
    return [b1, b2, b3]
  }

  const visibleBanners = getVisibleBanners()

  return (
    <div className="relative w-full bg-gray-50 py-8 overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-4">
        
        {/* קונטיינר לתמונות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 transition-all duration-700 ease-in-out">
          {visibleBanners.map((fileName, index) => (
            <div 
              key={`${fileName}-${index}`} // מפתח ייחודי לאנימציה חלקה
              className="relative aspect-[4/3] md:aspect-[3/4] lg:aspect-[16/9] overflow-hidden rounded-2xl shadow-lg group animate-fade-in"
            >
              <img
                src={`${storageUrl}/${fileName}`}
                alt="באנר אווירה"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none' // הסתרת תמונה אם הקישור שבור
                }}
              />
              {/* שכבת כהות עדינה למראה יוקרתי */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ))}
        </div>

        {/* נקודות אינדיקציה למטה (Dots) */}
        <div className="flex justify-center mt-6 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-black w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`עבור לתמונה ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
