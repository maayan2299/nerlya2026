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
    if (!formData.fullName.trim()) newErrors.fullName = 'שם מלא חובה'
    if (!formData.phone.trim()) newErrors.phone = 'טלפון חובה'
    if (!formData.email.trim()) newErrors.email = 'אימייל חובה'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const finalTotal = getSubtotal() + (formData.shippingMethod === 'express' ? 60 : getShipping())

  const handleCheckout = async (e) => {
    if (e) e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const orderId = `NL-${Date.now()}`
      
      // שמירת נתוני התשלום בזיכרון זמני של הדפדפן
      const paymentParams = {
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
      sessionStorage.setItem('payment_data', JSON.stringify(paymentParams))

      // מעבר לדף הבית - הכתובת תהיה נקייה לגמרי!
      window.location.href = 'https://nerlya.com/'

    } catch (error) {
      setIsSubmitting(false)
      setPaymentError('שגיאה בהעברה לתשלום')
    }
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">תשלום והזמנה</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="bg-white border p-6 rounded shadow-sm">
                <h2 className="text-xl font-bold mb-4">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="שם מלא *" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="border p-3 rounded w-full" />
                  <input type="tel" placeholder="טלפון *" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="border p-3 rounded w-full" />
                  <input type="email" placeholder="אימייל *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border p-3 rounded w-full md:col-span-2" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-4 font-bold rounded">
                {isSubmitting ? 'מעביר...' : '🔒 מעבר לתשלום מאובטח'}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 p-6 rounded border h-fit">
            <h2 className="font-bold mb-4">סה"כ לתשלום: ₪{finalTotal.toLocaleString()}</h2>
          </div>
        </div>
      </main>
    </div>
  )
}
