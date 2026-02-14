import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { 
    cart, 
    getSubtotal,
    getShipping,
    getTotal,
    clearCart
  } = useCart()

  // State for checkout form
  const [formData, setFormData] = useState({
    // פרטי לקוח
    fullName: '',
    phone: '',
    email: '',
    // כתובת משלוח
    street: '',
    city: '',
    zipCode: '',
    // אופציות
    shippingMethod: 'standard', // standard, express, or pickup
    paymentMethod: 'credit', // credit or paypal
    // הערות וברכה
    notes: '',
    blessing: '' // שדה ברכה חדש
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: 'עגלת קניות', link: '/cart' },
    { label: 'תשלום', link: null }
  ]

  // Redirect if cart is empty
  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  // Validation
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
    
    // ולידציה של כתובת רק אם לא בחר איסוף עצמי
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

  // Handle form submission
  const handleCheckout = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    // Simulate order submission
    try {
      // Here you would normally send the order to your backend/Supabase
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Calculate shipping cost
      let shippingCost = 0
      if (formData.shippingMethod === 'express') {
        shippingCost = 60
      } else if (formData.shippingMethod === 'standard') {
        shippingCost = getShipping()
      }
      // pickup = 0
      
      // Create order object
      const order = {
        orderNumber: `NL-${Date.now()}`,
        items: cart,
        customerInfo: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.shippingMethod === 'pickup' 
            ? 'איסוף עצמי מבת-ים' 
            : `${formData.street}, ${formData.city}, ${formData.zipCode}`
        },
        shipping: {
          method: formData.shippingMethod,
          cost: shippingCost
        },
        payment: {
          method: formData.paymentMethod
        },
        totals: {
          subtotal: getSubtotal(),
          shipping: shippingCost,
          total: getSubtotal() + shippingCost
        },
        notes: formData.notes,
        blessing: formData.blessing,
        date: new Date().toISOString()
      }

      console.log('Order submitted:', order)
      
      // Clear cart
      clearCart()
      
      // Show success message
      let successMessage = `הזמנה בוצעה בהצלחה! 🎉\n\nמספר הזמנה: ${order.orderNumber}\n\n`
      if (formData.shippingMethod === 'pickup') {
        successMessage += 'ההזמנה תהיה מוכנה לאיסוף עצמי מבת-ים בעוד 5-7 ימי עסקים.\n\n'
      }
      successMessage += 'נציג יצור איתך קשר בהקדם.\n\nתודה שבחרת בנר-ליה!'
      
      alert(successMessage)
      
      // Redirect to home
      navigate('/')
      
    } catch (error) {
      console.error('Order submission error:', error)
      alert('אירעה שגיאה בביצוע ההזמנה. אנא נסה שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // חישוב עלות משלוח
  const getShippingCost = () => {
    if (formData.shippingMethod === 'pickup') return 0
    if (formData.shippingMethod === 'express') return 60
    return getShipping()
  }

  const shippingCost = getShippingCost()
  const finalTotal = getSubtotal() + shippingCost

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">תשלום והזמנה</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* טופס תשלום */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">
              
              {/* פרטי לקוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">שם מלא *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="שם פרטי ומשפחה"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">טלפון *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="050-1234567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">אימייל *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="example@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* אופציית משלוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.shippingMethod === 'standard' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">משלוח רגיל</div>
                      <div className="text-sm text-gray-600">בין 5-7 ימי עסקים • {getShipping() === 0 ? 'חינם!' : `₪${getShipping()}`}</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.shippingMethod === 'express' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">משלוח מהיר</div>
                      <div className="text-sm text-gray-600">1-2 ימי עסקים • ₪60</div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.shippingMethod === 'pickup' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="pickup"
                      checked={formData.shippingMethod === 'pickup'}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">איסוף עצמי מבת-ים</div>
                      <div className="text-sm text-gray-600">ללא עלות </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* כתובת משלוח - מוצג רק אם לא בחר איסוף עצמי */}
              {formData.shippingMethod !== 'pickup' && (
                <div className="bg-white border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">רחוב ומספר בית *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.street ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="רחוב הרצל 123"
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">עיר *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="תל אביב"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">מיקוד *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="1234567"
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* אופציית תשלום - הוסרה אופציית תשלום במזומן */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">אופציית תשלום</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'credit' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === 'credit'}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">כרטיס אשראי</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'paypal' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-600">תשלום מאובטח דרך PayPal</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* שדה ברכה - חדש */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">ברכה אישית</h2>
                <textarea
                  name="blessing"
                  value={formData.blessing}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                  placeholder="האם תרצה להוסיף ברכה אישית למוצר? (אופציונלי)"
                />
              </div>

              {/* הערות */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">הערות להזמנה</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                  placeholder="הוראות מיוחדות למשלוח, זמן מועדף וכו' (אופציונלי)"
                />
              </div>

              {/* כפתורי פעולה */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 px-8 text-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'מבצע הזמנה...' : '✓ אישור וביצוע הזמנה'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 border-2 border-black text-black py-4 px-8 text-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  ← חזרה לעגלה
                </button>
              </div>
            </form>
          </div>

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              
              {/* מוצרים */}
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-600">כמות: {item.quantity}</div>
                    </div>
                    <div className="font-medium">₪{(item.price * item.quantity).toLocaleString('he-IL')}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">סכום ביניים:</span>
                  <span className="font-medium">₪{getSubtotal().toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">משלוח:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">חינם!</span>
                    ) : (
                      `₪${shippingCost}`
                    )}
                  </span>
                </div>
                
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{finalTotal.toLocaleString('he-IL')}</span>
                </div>
              </div>

              {/* אייקוני אבטחה */}
              <div className="pt-6 border-t border-gray-300">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>תשלום מאובטח 100%</span>
                </div>
                <div className="text-xs text-center text-gray-500">
                  המידע שלך מוצפן ומאובטח
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
