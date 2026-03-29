import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, getSubtotal, getShipping } = useCart()

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', street: '', city: '', zipCode: '',
    shippingMethod: 'standard', notes: '', blessing: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: 'עגלת קניות', link: '/cart' },
    { label: 'תשלום', link: null }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'שם מלא הוא שדה חובה'
    if (!formData.phone.trim()) newErrors.phone = 'מספר טלפון הוא שדה חובה'
    if (!formData.email.trim()) newErrors.email = 'אימייל הוא שדה חובה'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const shippingCost = formData.shippingMethod === 'express' ? 60 : (formData.shippingMethod === 'pickup' ? 0 : getShipping())
  const finalTotal = getSubtotal() + shippingCost

  const handleCheckout = async (e) => {
    if (e) e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const orderId = `NL-${Date.now()}`
      
      const paymentData = {
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
      }

      sessionStorage.setItem('trigger_payment', 'true')
      sessionStorage.setItem('payment_params', JSON.stringify(paymentData))

      // מעבר לדף הבית - הכתובת תהיה https://nerlya.com/ (בלי checkout!)
      window.location.href = 'https://nerlya.com/'

    } catch (error) {
      setIsSubmitting(false)
      setPaymentError('שגיאה בהעברה לתשלום')
    }
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">תשלום והזמנה</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">
              <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="שם מלא *" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded outline-none focus:border-black" />
                  <input type="tel" placeholder="טלפון *" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded outline-none focus:border-black" />
                  <input type="email" placeholder="אימייל *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded outline-none focus:border-black md:col-span-2" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-4 px-8 text-lg font-bold rounded hover:bg-gray-800 transition-colors">
                {isSubmitting ? 'מעביר לתשלום...' : '🔒 מעבר לתשלום מאובטח'}
              </button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                <span>סה"כ לתשלום:</span>
                <span>₪{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
