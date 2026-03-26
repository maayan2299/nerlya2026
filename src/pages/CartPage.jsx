import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity,
    getSubtotal,
    getShipping,
    getTotal,
    clearCart
  } = useCart()

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: 'עגלת קניות', link: null }
  ]

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <svg className="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-3xl font-bold mb-4">העגלה שלך ריקה</h1>
          <p className="text-gray-600 mb-8">נראה שעדיין לא הוספת מוצרים לעגלה</p>
          <Link to="/" className="inline-block px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors font-medium">
            התחל לקנות
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">עגלת קניות</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* רשימת מוצרים */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 divide-y divide-gray-200">
              {cart.map((item) => {
                // ✅ תמונה מ-images[] array
                const itemImage = item.main_image_url || item.images?.[0]?.image_url || (typeof item.images?.[0] === 'string' ? item.images[0] : null) || null;
                const basePrice = parseFloat(item.sale_price || item.price) || 0
                const engravingPrice = parseFloat(item.engravingPrice) || 0
                const itemTotal = (basePrice + engravingPrice) * item.quantity

                return (
                  <div key={item.uniqueId || item.id} className="p-4 md:p-6 flex gap-4 md:gap-6">
                    {/* תמונה */}
                    <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
                      {itemImage ? (
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* פרטים */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/product/${item.id}`} className="hover:underline">
                          <h3 className="font-medium text-base md:text-lg">{item.name}</h3>
                        </Link>
                        <button onClick={() => removeFromCart(item.uniqueId || item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1" title="הסר מהעגלה">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* מחיר */}
                      <div className="mb-1">
                        {item.sale_price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-medium">₪{parseFloat(item.sale_price).toLocaleString('he-IL')}</span>
                            <span className="text-gray-400 line-through text-sm">₪{parseFloat(item.price).toLocaleString('he-IL')}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600">₪{basePrice.toLocaleString('he-IL')}</span>
                        )}
                      </div>

                      {/* חריטה */}
                      {item.engravingText && (
                        <div className="mb-2 text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                          <span className="text-amber-700">✨ חריטת שם: </span>
                          <span className="font-medium text-amber-900">{item.engravingText}</span>
                          <span className="text-amber-600"> (+₪{engravingPrice})</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* כפתורי כמות */}
                        <div className="flex items-center border-2 border-gray-300">
                          <button onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">-</button>
                          <span className="w-12 h-10 flex items-center justify-center border-x-2 border-gray-300 font-medium">
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">+</button>
                        </div>
                        <p className="font-bold text-lg">₪{itemTotal.toLocaleString('he-IL')}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={clearCart} className="mt-4 text-sm text-red-500 hover:text-red-700 transition-colors">
              רוקן עגלה
            </button>
          </div>

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">סכום ביניים:</span>
                  <span className="font-medium">₪{getSubtotal().toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">משלוח:</span>
                  <span className="font-medium">
                    {getShipping() === 0 ? <span className="text-green-600">חינם!</span> : `₪${getShipping()}`}
                  </span>
                </div>
                {getShipping() > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    💡 הוסף עוד ₪{(400 - getSubtotal()).toFixed(0)} למשלוח חינם!
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{getTotal().toLocaleString('he-IL')}</span>
                </div>
              </div>

              <Link to="/checkout"
                className="block w-full text-center bg-black text-white py-4 font-medium hover:bg-[#CFAA52] transition-colors mb-3">
                מעבר לתשלום 🔒
              </Link>
              <Link to="/"
                className="block w-full text-center border-2 border-black text-black py-4 font-medium hover:bg-gray-50 transition-colors">
                המשך בקניות
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-300 flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                תשלום מאובטח
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
