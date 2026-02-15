import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // כאן את מכניסה את הקישורים ל-3 התמונות שלך
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1490915785914-0af2806c22b6?q=80&w=2070&auto=format&fit=crop", // תמונה 1
      title: "קולקציית פמוטים חדשה",
      subtitle: "הוסיפי אור של קדושה לשבת"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=2070&auto=format&fit=crop", // תמונה 2
      title: "כיסויי טלית ותפילין",
      subtitle: "ריקמה אישית ועיצוב יוקרתי"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1606744884163-49298e82d8c3?q=80&w=2077&auto=format&fit=crop", // תמונה 3
      title: "מתנות לחגים",
      subtitle: "מארזים מיוחדים לאנשים שאוהבים"
    }
  ]

  // הפונקציה שאחראית על החלפת התמונות כל 5 שניות
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000) // 5000 מילישניות = 5 שניות

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-100">
      
      {/* לולאה שמציגה את התמונות */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* התמונה עצמה */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          
          {/* שכבת כהות עדינה כדי שהטקסט יהיה קריא */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ))}

      {/* הטקסט שיושב על התמונה (משתנה בהתאם לתמונה) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-10">
        <h2 
          className="text-4xl md:text-6xl font-bold mb-4 tracking-wide drop-shadow-lg transition-all duration-700 transform translate-y-0"
          style={{ fontFamily: "'StamSefarad', serif" }}
        >
          {slides[currentSlide].title}
        </h2>
        <p className="text-lg md:text-2xl mb-8 font-light drop-shadow-md">
          {slides[currentSlide].subtitle}
        </p>
        <Link 
          to="/category/11" // לאן הכפתור מוביל
          className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-all hover:scale-105"
        >
          לקטלוג המלא
        </Link>
      </div>

      {/* הנקודות הקטנות למטה (Dots) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`עבור לתמונה ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
