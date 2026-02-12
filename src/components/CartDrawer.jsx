import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../lib/products'

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity,
    getSubtotal,
    getShipping,
    getTotal 
  } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* רקע כהה */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* מגירת עגלה */}
      <div className="fixed top-0 left-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-[151] flex flex-col" dir="rtl">
        
        {/* כותרת */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">העגלה שלי ({cart.length})</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* תוכן העגלה */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 mb-4">העגלה שלך ריקה</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                המשך בקניות
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const itemImage = item.main_image_url ? getImageUrl(item.main_image_url) : null
                const itemTotal = (parseFloat(item.price) || 0) * item.quantity

                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                    {/* תמונה */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      {itemImage ? (
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* פרטים */}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">₪{parseFloat(item.price).toLocaleString('he-IL')}</p>
                      
                      {/* כפתורי כמות */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* מחיר כולל + מחיקה */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="font-semibold text-sm">₪{itemTotal.toLocaleString('he-IL')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* סיכום + כפתור תשלום */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים:</span>
                <span className="font-medium">₪{getSubtotal().toLocaleString('he-IL')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח:</span>
                <span className="font-medium">
                  {getShipping() === 0 ? 'חינם' : `₪${getShipping()}`}
                </span>
              </div>
              {getShipping() > 0 && (
                <p className="text-xs text-gray-500">
                  הוסף עוד ₪{(400 - getSubtotal()).toFixed(0)} למשלוח חינם
                </p>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                <span>סה"כ:</span>
                <span>₪{getTotal().toLocaleString('he-IL')}</span>
              </div>
            </div>
            
            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-black text-white text-center py-4 font-medium hover:bg-gray-800 transition-colors mb-2"
            >
              מעבר לתשלום
            </Link>
            <button
              onClick={() => setIsCartOpen(false)}
              className="block w-full border-2 border-black text-black text-center py-4 font-medium hover:bg-gray-50 transition-colors"
            >
              המשך בקניות
            </button>
          </div>
        )}

      </div>
    </>
  )
}
