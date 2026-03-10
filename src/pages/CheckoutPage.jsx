import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'

const SUPABASE_URL = 'https://ormbbartqrpgtsmoqxhm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybWJiYXJ0cXJwZ3RzbW9xeGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTQwMzMsImV4cCI6MjA4MzUzMDAzM30.vcddF1aQahJTZfv7GNK7_onPR2dt-l_dmDCzEt-EnAg'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { 
    cart, 
    getSubtotal,
    getShipping,
    clearCart
  } = useCart()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    zipCode: '',
    shippingMethod: 'standard',
    notes: '',
    blessing: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: 'עגלת קניות', link: '/cart' },
    { label: 'תשלום', link: null }
  ]

  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'שם מלא הוא שדה חובה'
    if (!formData.phone.trim()) {
      newErrors.phone = 'מספר טלפון הוא שדה חובה'
    } else if (!/^05\d{8}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'מספר טלפון לא תקין'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה'
    }
    if (formData.shippingMethod !== 'pickup') {
      if (!formData.street.trim()) newErrors.street = 'רחוב הוא שדה חובה'
      if (!formData.city.trim()) newErrors.city = 'עיר היא שדה חובה'
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'מיקוד הוא שדה חובה'
      } else if (!/^\d{5,7}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'מיקוד לא תקין'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getShippingCost = () => {
    if (formData.shippingMethod === 'pickup') return 0
    if (formData.shippingMethod === 'express') return 60
    return getShipping()
  }

  const shippingCost = getShippingCost()
  const finalTotal = getSubtotal() + shippingCost

  const handleCheckout = async (e) => {
    e.preventDefault()
    setPaymentError('')

    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      const orderId = `NL-${Date.now()}`
      const orderData = {
        orderId,
        items: cart,
        customerInfo: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.shippingMethod === 'pickup'
            ? 'איסוף עצמי מבת-ים'
            : `${formData.street}, ${formData.city}, ${formData.zipCode}`
        },
        shipping: { method: formData.shippingMethod, cost: shippingCost },
        totals: { subtotal: getSubtotal(), shipping: shippingCost, total: finalTotal },
        notes: formData.notes,
        blessing: formData.blessing,
        date: new Date().toISOString()
      }
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

      const baseUrl = window.location.origin

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: finalTotal,
          orderId,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.sale_price || item.price) || 0
          }))
        })
      })

      const data = await response.json()

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setPaymentError(data.error || 'שגיאה ביצירת דף התשלום. אנא נסה שוב.')
        setIsSubmitting(false)
      }

    } catch (error) {
      console.error('Checkout error:', error)
      setPaymentError('שגיאה בחיבור לשירות התשלומים. אנא נסה שוב.')
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">תשלום והזמנה</h1>

        {paymentError && (
          <div className="mb-6 bg-red-50 border-2 border-red-400 p-4 text-red-700 font-medium">
            ⚠️ {paymentError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">

              {/* פרטי לקוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">שם מלא *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="שם פרטי ומשפחה" />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">טלפון *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="050-1234567" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">אימייל *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="example@email.com" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* אופציית משלוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'משלוח רגיל', desc: `5-7 ימי עסקים • ${getShipping() === 0 ? 'חינם!' : `₪${getShipping()}`}` },
                    { value: 'express', label: 'משלוח מהיר', desc: '1-2 ימי עסקים • ₪60' },
                    { value: 'pickup', label: 'איסוף עצמי מבת-ים', desc: 'ללא עלות' }
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.shippingMethod === opt.value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="shippingMethod" value={opt.value}
                        checked={formData.shippingMethod === opt.value} onChange={handleInputChange} className="ml-3" />
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-sm text-gray-600">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* כתובת משלוח */}
              {formData.shippingMethod !== 'pickup' && (
                <div className="bg-white border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">רחוב ומספר בית *</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.street ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="רחוב הרצל 123" />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">עיר *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="תל אביב" />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">מיקוד *</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="1234567" />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ברכה */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">ברכה אישית</h2>
                <textarea name="blessing" value={formData.blessing} onChange={handleInputChange} rows="3"
                  className="w-full border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                  placeholder="האם תרצה להוסיף ברכה אישית למוצר? (אופציונלי)" />
              </div>

              {/* הערות */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">הערות להזמנה</h2>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="4"
                  className="w-full border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                  placeholder="הוראות מיוחדות למשלוח, זמן מועדף וכו' (אופציונלי)" />
              </div>

              {/* כפתורים */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 px-8 text-lg font-bold hover:bg-[#CFAA52] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      מעביר לתשלום...
                    </>
                  ) : (
                    '🔒 מעבר לתשלום מאובטח'
                  )}
                </button>
                <button type="button" onClick={() => navigate('/cart')}
                  className="flex-1 border-2 border-black text-black py-4 px-8 text-lg font-bold hover:bg-gray-50 transition-colors">
                  ← חזרה לעגלה
                </button>
              </div>

              <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                תשלום מאובטח דרך HYP CreditGuard — מוצפן SSL
              </div>
            </form>
          </div>

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const basePrice = parseFloat(item.sale_price || item.price) || 0
                  const engravingPrice = parseFloat(item.engravingPrice) || 0
                  return (
                    <div key={item.uniqueId || item.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-600">כמות: {item.quantity}</div>
                        {item.engravingText && (
                          <div className="text-xs text-amber-700">✨ חריטה: {item.engravingText}</div>
                        )}
                      </div>
                      <div className="font-medium">₪{((basePrice + engravingPrice) * item.quantity).toLocaleString('he-IL')}</div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">סכום ביניים:</span>
                  <span className="font-medium">₪{getSubtotal().toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">משלוח:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? <span className="text-green-600">חינם!</span> : `₪${shippingCost}`}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{finalTotal.toLocaleString('he-IL')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  תשלום מאובטח 100%
                </div>
                המידע שלך מוצפן ומאובטח
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
