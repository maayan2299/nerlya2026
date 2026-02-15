import { useEffect, useState } from 'react'
import { supabaseUrl } from '../lib/supabase'

export default function Hero() {
  // רשימת התמונות המקורית שלך
  const originalBanners = [
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

  // אנחנו משכפלים את הרשימה כדי ליצור לולאה אינסופית מושלמת
  // התוצאה תהיה מערך כפול: [1,2,3...1,2,3...]
  const banners = [...originalBanners, ...originalBanners]

  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const storageUrl = `${baseUrl}/storage/v1/object/public/banners`

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* הגדרת גובה הפס:
        במובייל: 50% גובה מסך (h-[50vh])
        במחשב: 75% גובה מסך (md:h-[75vh])
      */}
      <div className="relative w-full h-[50vh] md:h-[75vh] flex">
        
        {/* המסלול שזז - אנימציה אינסופית */}
        <div className="flex animate-marquee min-w-full">
          {banners.map((fileName, index) => (
            <div 
              key={`${fileName}-${index}`} 
              // רוחב התמונות:
              // במובייל: כל תמונה תופסת 80% מהרוחב (כדי שיראו ברור)
              // במחשב: כל תמונה תופסת 33.3% (שליש) מהרוחב
              className="relative flex-shrink-0 w-[80vw] md:w-[33.33vw] h-full"
            >
              <img
                src={`${storageUrl}/${fileName}`}
                alt="אווירה"
                className="w-full h-full object-cover" // מוודא שאין רווחים לבנים והתמונה נמתחת
                loading="eager" // טוען את התמונות מיד
              />
              {/* שכבת כהות עדינה מאוד שתיתן מראה אחיד */}
              <div className="absolute inset-0 bg-black/5"></div>
            </div>
          ))}
        </div>
      </div>

      {/* הסטייל של האנימציה */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
          /* זזים בדיוק 50% כי שכפלנו את המערך, ואז זה חוזר להתחלה בצורה חלקה */
        }
        .animate-marquee {
          animation: marquee 40s linear infinite; 
          /* 40 שניות = מהירות הגלילה. רוצה לאט יותר? תשני ל-60s */
        }
        
        /* אופציונלי: עצירה כשעומדים עם העכבר */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
