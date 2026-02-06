import { Link } from 'react-router-dom'
import { getImageUrl } from '../lib/products'

export default function ProductCard({ product }) {
  // וידוא שהתמונה נמשכת בצורה תקינה עם סיומת JPG אם חסר
  const rawUrl = product.main_image_url;
  const formattedUrl = rawUrl && !rawUrl.includes('.') ? `${rawUrl}.JPG` : rawUrl;
  const imageUrl = getImageUrl(formattedUrl);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-transparent transition-all duration-500"
      dir="rtl"
    >
      {/* Container התמונה - נקי ללא מסגרת חיצונית כבדה */}
      <div className="aspect-[3/4] overflow-hidden bg-[#F9F9F7] relative mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name || 'מוצר נר-ליה'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* אפקט מעבר עדין ב-Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>

      {/* פרטי המוצר - טיפוגרפיה נקייה */}
      <div className="text-center px-2">
        <h3 className="font-serif text-lg md:text-xl text-gray-900 mb-1 group-hover:text-[#D4AF37] transition-colors duration-300 tracking-tight font-medium">
          {product.name || 'מוצר יוקרה'}
        </h3>
        
        {product.price && (
          <p className="font-light text-gray-600 text-base md:text-lg">
            ₪{parseFloat(product.price).toLocaleString('he-IL')}
          </p>
        )}
      </div>
    </Link>
  )
}