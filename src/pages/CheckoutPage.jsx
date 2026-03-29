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

  const shippingCost = formData.shippingMethod === 'express' ? 60 : (formData.shippingMethod === 'pickup' ? 0 : getShipping())
  const finalTotal = getSubtotal() + shippingCost

  const handleCheckout = async (e) => {
    if (e) e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const orderId = `NL-${Date.now()}`
      
      const paymentParams = {
        action: 'pay', Masof: '4502249638', PassP: '02G38L8Y5E',
        Amount: finalTotal.toString(), Order: orderId, UTF8: 'True',
        Info: `הזמנה מנרליה - ${formData.fullName}`, Email: formData.email,
        Success: 'https://nerlya.com/payment-success', Error: 'https://nerlya.com/payment-error'
      }

      sessionStorage.setItem('trigger_payment', 'true')
      sessionStorage.setItem('payment_params', JSON.stringify(paymentParams))

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
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleCheckout} className="space-y-8">
              <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">שם מלא *</label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-200 p-4 rounded-md outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">טלפון *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 p-4 rounded-md outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">אימייל *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 p-4 rounded-md outline-none focus:ring-1 focus:ring-black" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-4">
                  {['STANDARD', 'EXPRESS', 'איסוף עצמי'].map((label, idx) => {
                    const val = idx === 0 ? 'standard' : idx === 1 ? 'express' : 'pickup';
                    return (
                      <label key={val} className="flex items-center justify-between p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="font-medium">{label}</span>
                        <input type="radio" name="shippingMethod" value={val} checked={formData.shippingMethod === val} onChange={(e) => setFormData({...formData, shippingMethod: e.target.value})} className="w-5 h-5 accent-black" />
                      </label>
                    )
                  })}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 text-xl font-bold rounded-md hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? 'מעביר...' : <>🔒 מעבר לתשלום מאובטח</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">סיכום הזמנה</h2>
              <div className="flex justify-between items-center text-2xl font-bold">
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
