import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    // ניקוי העגלה
    clearCart()
    // טעינת פרטי ההזמנה מ-sessionStorage
    const saved = sessionStorage.getItem('pendingOrder')
    if (saved) {
      setOrder(JSON.parse(saved))
      sessionStorage.removeItem('pendingOrder')
    }
  }, [])

  const uniqueId = searchParams.get('uniqueID') || order?.orderId || ''
  const cardMask = searchParams.get('cardMask') || ''

  return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="max-w-lg w-full mx-4 text-center">

        {/* אייקון הצלחה */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">התשלום בוצע בהצלחה! 🎉</h1>
        <p className="text-gray-600 mb-6">תודה שקנית בנר-ליה. הזמנתך התקבלה ותישלח בהקדם.</p>

        {/* פרטי הזמנה */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-6 text-right">
          {uniqueId && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">מספר הזמנה:</span>
              <span className="font-medium text-sm">{uniqueId}</span>
            </div>
          )}
          {cardMask && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">כרטיס:</span>
              <span className="font-medium">{cardMask}</span>
            </div>
          )}
          {order?.customerInfo?.name && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">שם:</span>
              <span className="font-medium">{order.customerInfo.name}</span>
            </div>
          )}
          {order?.totals?.total && (
            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
              <span>סה"כ שולם:</span>
              <span>₪{order.totals.total.toLocaleString('he-IL')}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-8">
          אישור ישלח לאימייל שלך. לשאלות ניתן לפנות ב-WhatsApp
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium">
            חזרה לחנות
          </Link>
          <a href="https://wa.me/972542115584" target="_blank" rel="noreferrer"
            className="px-8 py-3 border-2 border-black text-black hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            צור קשר
          </a>
        </div>
      </div>
    </div>
  )
}
