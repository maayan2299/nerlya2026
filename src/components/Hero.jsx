import { useState, useEffect } from 'react'
import { supabaseUrl } from '../lib/supabase'

export default function Hero() {
  const [groupIndex, setGroupIndex] = useState(0)

  // רשימת התמונות שלך
  const allBanners = [
    'banner1.jpg', 'banner2.png', 'banner3.png',
    'banner4.png', 'banner5.png', 'banner6.png',
    'banner7.png', 'banner8.png', 'banner9.png'
  ]

  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const storageUrl = `${baseUrl}/storage/v1/object/public/banners`

  // מחלקים את התמונות לקבוצות של 3
  // קבוצה 0: תמונות 1,2,3
  // קבוצה 1: תמונות 4,5,6
  // קבוצה 2: תמונות 7,8,9
  const totalGroups = Math.ceil(allBanners.length / 3)

  useEffect(() => {
    const timer = setInterval(() => {
      setGroupIndex((prev) => (prev + 1) % totalGroups)
    }, 5000) // כל 5 שניות החלפה

    return () => clearInterval(timer)
  }, [totalGroups])

  // חישוב אלו 3 תמונות להציג עכשיו לפי הקבוצה הנוכחית
  const currentImages = allBanners.slice(groupIndex * 3, (groupIndex * 3) + 3)

  return (
    <div className="w-full h-[50vh] md:h-[70vh] bg-white overflow-hidden relative">
      
      {/* קונטיינר לתמונות - שימוש ב-Grid כדי לחלק ל-3 חלקים שווים */}
      <div className="grid grid-cols-1 md:grid-cols-3 h-full w-full">
        
        {currentImages.map((fileName, index) => (
          <div 
            key={`${fileName}-${groupIndex}`} // המפתח הזה גורם לאנימציה לקרות כל פעם שהתמונה מתחלפת
            className="relative w-full h-full overflow-hidden animate-fade-in"
            style={{ 
              // דירוג קטן באנימציה כדי שזה יראה "מפתיע" ולא רובוטי
              animationDelay: `${index * 150}ms` 
            }}
          >
            <img
              src={`${storageUrl}/${fileName}`}
              alt="אווירה"
              className="w-full h-full object-cover transition-transform duration-[5000ms] hover:scale-110"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            
            {/* אפקט כהות עדין שנעלם במעבר עכבר */}
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-700"></div>
          </div>
        ))}

      </div>

      {/* אנימציית הופעה רכה (Fade In + Zoom Out קטן) */}
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
