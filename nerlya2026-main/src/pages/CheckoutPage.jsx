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
    if (e) e.preventDefault()
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

      // --- התיקון ששולח לדף הבית כדי לעקוף את חסימת יעד ---
      const baseUrl = 'https://nerlya.com/'; 
      const params = new URLSearchParams({
        to_pay: 'true',
        action: 'pay',
        Masof: '4502249638',
        PassP: '02G38L8Y5E',
        Amount: finalTotal.toString(),
        Order: orderId,
        UTF8: 'True',
        Info: `הזמנה מנרליה - ${formData.fullName}`,
        Email: formData.email,
        Success: 'https://nerlya.com/payment-success',
        Error: 'https://nerlya.com/payment-error'
      });

      window.location.href = `${baseUrl}?${params.toString()}`;

    } catch (error) {
      console.error('❌ שגיאת תשלום:', error)
      setPaymentError('חלה שגיאה בחיבור למערכת התשלומים')
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
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 text-red-700">
            {paymentError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* פרטי לקוח */}
              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">שם מלא *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">טלפון *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">אימייל *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* אופציית משלוח */}
              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'משלוח רגיל', desc: `5-7 ימי עסקים • ${getShipping() === 0 ? 'חינם!' : `₪${getShipping()}`}` },
                    { value: 'express', label: 'משלוח מהיר', desc: '1-2 ימי עסקים • ₪60' },
                    { value: 'pickup', label: 'איסוף עצמי מבת-ים', desc: 'ללא עלות' }
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center p-4 border-2 rounded cursor-pointer transition-colors ${formData.shippingMethod === opt.value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="shippingMethod" value={opt.value} checked={formData.shippingMethod === opt.value} onChange={handleInputChange} className="ml-3" />
                      <div>
                        <div className="font-medium uppercase">{opt.label}</div>
                        <div className="text-sm text-gray-600">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* כתובת משלוח */}
              {formData.shippingMethod !== 'pickup' && (
                <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700">רחוב ומספר בית *</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange} className={`w-full border-2 ${errors.street ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">עיר *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={`w-full border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">מיקוד *</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className={`w-full border-2 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black outline-none`} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-4 px-8 text-lg font-bold rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                {isSubmitting ? 'מעביר לתשלום...' : '🔒 מעבר לתשלום מאובטח'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>₪{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 pt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span>סכום ביניים:</span>
                  <span>₪{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>משלוח:</span>
                  <span>{shippingCost === 0 ? 'חינם' : `₪${shippingCost}`}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span>סה"כ:</span>
                  <span>₪{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
