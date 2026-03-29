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

      // --- התיקון הקריטי: חסימת Referrer ברמת הדף ---
      const meta = document.createElement('meta');
      meta.name = "referrer";
      meta.content = "no-referrer";
      document.getElementsByTagName('head')[0].appendChild(meta);

      const baseUrl = 'https://icom.yaad.net/p/';
      const params = new URLSearchParams({
        action: 'pay',
        Masof: '4502249638',
        PassP: '02G38L8Y5E',
        Amount: finalTotal.toString(),
        Order: orderId,
        UTF8: 'True',
        Info: `הזמנה מנרליה - ${formData.fullName}`,
        Email: formData.email,
        Success: 'https://nerlya.com/success',
        Error: 'https://nerlya.com/error'
      });

      // המעבר הישיר
      window.location.href = `${baseUrl}?${params.toString()}`;

    } catch (error) {
      console.error('❌ שגיאת תשלום:', error)
      setPaymentError(`לא הצלחנו לחבר אותך לתשלום: ${error.message}`)
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">שגיאה בתשלום</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{paymentError}</p>
              <button
                onClick={() => setPaymentError('')}
                className="w-full bg-black text-white py-3 font-medium rounded hover:bg-gray-800 transition-colors"
              >
                חזור ונסה שוב
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">
              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">שם מלא *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="שם פרטי ומשפחה" 
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">טלפון *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="050-1234567" 
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">אימייל *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="example@email.com" 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">אופציית משלוח</h2>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'משלוח רגיל', desc: `5-7 ימי עסקים • ${getShipping() === 0 ? 'חינם!' : `₪${getShipping()}`}` },
                    { value: 'express', label: 'משלוח מהיר', desc: '1-2 ימי עסקים • ₪60' },
                    { value: 'pickup', label: 'איסוף עצמי מבת-ים', desc: 'ללא עלות' }
                  ].map(opt => (
                    <label 
                      key={opt.value} 
                      className={`flex items-center p-4 border-2 rounded cursor-pointer transition-colors ${formData.shippingMethod === opt.value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <input 
                        type="radio" 
                        name="shippingMethod" 
                        value={opt.value}
                        checked={formData.shippingMethod === opt.value} 
                        onChange={handleInputChange} 
                        className="ml-3" 
                      />
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-sm text-gray-600">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.shippingMethod !== 'pickup' && (
                <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700">רחוב ומספר בית *</label>
                      <input 
                        type="text" 
                        name="street" 
                        value={formData.street} 
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.street ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                        placeholder="רחוב הרצל 123" 
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">עיר *</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                        placeholder="תל אביב" 
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">מיקוד *</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleInputChange}
                        className={`w-full border-2 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                        placeholder="1234567" 
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 px-8 text-lg font-bold rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'מעביר לתשלום...' : '🔒 מעבר לתשלום מאובטח'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/cart')}
                  className="flex-1 border-2 border-black text-black py-4 px-8 text-lg font-bold rounded hover:bg-gray-50 transition-colors"
                >
                  ← חזרה לעגלה
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6 font-bold text-xl flex justify-between">
                <span>סה"כ לתשלום:</span>
                <span>₪{finalTotal.toLocaleString('he-IL')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
