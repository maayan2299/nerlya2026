import { useState, useEffect } from 'react'
import { supabaseUrl } from '../lib/supabase'

export default function Hero() {
  const [groupIndex, setGroupIndex] = useState(0)

  const allBanners = [
    'banner1.jpg', 'banner2.png', 'banner3.png',
    'banner4.png', 'banner5.png', 'banner6.png',
    'banner7.png', 'banner8.png', 'banner9.png'
  ]

  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const storageUrl = `${baseUrl}/storage/v1/object/public/banners`

  const totalGroups = Math.ceil(allBanners.length / 3)

  useEffect(() => {
    const timer = setInterval(() => {
      setGroupIndex((prev) => (prev + 1) % totalGroups)
    }, 5000)

    return () => clearInterval(timer)
  }, [totalGroups])

  const currentImages = allBanners.slice(groupIndex * 3, (groupIndex * 3) + 3)

  return (
    // הגדלתי מעט את הגובה בנייד ל-60vh כדי לתת לתמונות אוויר
    <div className="w-full h-[60vh] md:h-[70vh] bg-white overflow-hidden relative">
      
      {/* הגדרת הגריד (Grid):
         בנייד: grid-cols-2 grid-rows-2 (מחלק ל-4 ריבועים דמיוניים)
         במחשב: md:grid-cols-3 md:grid-rows-1 (מחלק ל-3 פסים לאורך כמו קודם)
      */}
      <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-3 md:grid-rows-1 h-full w-full">
        
        {currentImages.map((fileName, index) => (
          <div 
            key={`${fileName}-${groupIndex}`}
            className={`
              relative w-full h-full overflow-hidden animate-fade-in
              /* לוגיקה לסידור בנייד: */
              ${index === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'} 
              /* לוגיקה לסידור במחשב (תמיד עמודה אחת לכל תמונה): */
              md:col-span-1 md:row-span-1
            `}
            style={{ 
              animationDelay: `${index * 150}ms` 
            }}
          >
            <img
              src={`${storageUrl}/${fileName}`}
              alt="אווירה"
              className="w-full h-full object-cover transition-transform duration-[5000ms] hover:scale-110"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-700"></div>
          </div>
        ))}

      </div>

      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeInScale 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}
