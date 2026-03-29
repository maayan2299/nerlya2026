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

      // --- ה"תרגיל" שינצח את יעד: מעבר דרך דף הבית ---
      // אנחנו שולחים את המשתמש ל-https://nerlya.com/ עם כל הפרמטרים
      const baseUrl = 'https://nerlya.com/'; 
      const params = new URLSearchParams({
        to_pay: 'true', // הסימן שדף הבית יחפש
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

      // המעבר לדף הבית
      window.location.href = `${baseUrl}?${params.toString()}`;

    } catch (error) {
      console.error('❌ שגיאת העברה:', error)
      setPaymentError(`שגיאה בהעברה לתשלום: ${error.message}`)
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">תשלום והזמנה</h1>

        {paymentError && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">שגיאה</h3>
              <p className="text-gray-600 mb-6">{paymentError}</p>
              <button onClick={() => setPaymentError('')} className="w-full bg-black text-white py-3 rounded">חזור</button>
            </div>
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
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 rounded`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">טלפון *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 rounded`} />
                  </div>
                </div>
              </div>

              {/* משלוח */}
              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-3">
                  {['standard', 'express', 'pickup'].map(val => (
                    <label key={val} className="flex items-center p-4 border-2 rounded cursor-pointer">
                      <input type="radio" name="shippingMethod" value={val} checked={formData.shippingMethod === val} onChange={handleInputChange} className="ml-3" />
                      <span className="font-medium uppercase">{val === 'pickup' ? 'איסוף עצמי' : val}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-4 text-lg font-bold rounded hover:bg-gray-800 transition-colors">
                {isSubmitting ? 'מעביר...' : '🔒 מעבר לתשלום מאובטח'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
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
