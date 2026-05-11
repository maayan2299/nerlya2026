import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'
import { supabase } from '../lib/supabase'

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

  // ✅ ניהול קופונים
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [checkingCoupon, setCheckingCoupon] = useState(false)

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
  const subtotal = getSubtotal()

  // ✅ חישוב הנחה
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discount_type === 'percent') {
      return Math.round((subtotal * appliedCoupon.discount_value) / 100)
    }
    // sum
    return Math.min(appliedCoupon.discount_value, subtotal)
  }

  const discount = calculateDiscount()
  const finalTotal = Math.max(0, subtotal + shippingCost - discount)

  // ✅ אימות והחלת קופון
  const applyCoupon = async () => {
    setCouponError('')
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('יש להזין קוד קופון')
      return
    }

    setCheckingCoupon(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', code)
        .eq('active', true)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setCouponError('הקוד לא תקין או לא פעיל')
        setAppliedCoupon(null)
        return
      }

      // בדיקת תוקף
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setCouponError('הקוד פג תוקף')
        setAppliedCoupon(null)
        return
      }

      // בדיקת מספר שימושים
      if (data.max_uses && data.uses_count >= data.max_uses) {
        setCouponError('הקוד הזה כבר נוצל במלואו')
        setAppliedCoupon(null)
        return
      }

      // בדיקת מינימום הזמנה
      if (data.min_order_amount > 0 && subtotal < data.min_order_amount) {
        setCouponError(`הקוד דורש הזמנה מינימלית של ₪${data.min_order_amount}`)
        setAppliedCoupon(null)
        return
      }

      // הכל תקין!
      setAppliedCoupon(data)
      setCouponError('')
    } catch (err) {
      console.error('Coupon check failed:', err)
      setCouponError('שגיאה בבדיקת הקוד, נסי שוב')
    } finally {
      setCheckingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

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
      
      // שמירת נתוני ההזמנה ל-SessionStorage לשימוש בדף התודה
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
        totals: { subtotal, shipping: shippingCost, discount, total: finalTotal },
        coupon: appliedCoupon ? {
          id: appliedCoupon.id,
          code: appliedCoupon.code,
          discount_amount: discount
        } : null,
        notes: formData.notes,
        blessing: formData.blessing,
        date: new Date().toISOString()
      }
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

      // ✅ שמירת ההזמנה בטבלת orders ב-Supabase עם status='pending'
      const { error: dbError } = await supabase.from('orders').insert([{
        order_id: orderId,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address: orderData.customerInfo.address,
        items: cart,
        subtotal,
        shipping: shippingCost,
        total: finalTotal,
        shipping_method: formData.shippingMethod,
        notes: formData.notes,
        blessing: formData.blessing,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: discount || null,
        status: 'pending'
      }])

      if (dbError) {
        console.error('Failed to save order to Supabase:', dbError)
      }

      // --- תחילת מנגנון התשלום דרך Edge Function ---
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            orderId,
            amount: finalTotal,
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment')
      }

      const paymentData = await response.json()

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl
      } else {
        throw new Error(paymentData.error || 'Unknown payment error')
      }

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
        <h1 className="text-4xl font-bold mb-8">תשלום</h1>

        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded text-red-700">
            ⚠️ {paymentError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* פרטים אישיים */}
              <div className="bg-white border border-gray-200 p-6 rounded">
                <h2 className="text-2xl font-bold mb-6">פרטים אישיים</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">שם מלא *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="שם פרטי ושם משפחה" 
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
                      className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="050-1234567" 
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">אימייל *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded focus:border-black focus:outline-none transition-colors`}
                      placeholder="email@example.com" 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* שיטת משלוח */}
              <div className="bg-white border border-gray-200 p-6 rounded">
                <h2 className="text-2xl font-bold mb-6">שיטת משלוח</h2>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'משלוח רגיל', desc: '5-7 ימי עסקים — חינם!' },
                    { value: 'express', label: 'משלוח אקספרס', desc: '1-2 ימי עסקים — ₪60' },
                    { value: 'pickup', label: 'איסוף עצמי', desc: 'מבת-ים — חינם!' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded cursor-pointer hover:border-gray-400">
                      <input 
                        type="radio" 
                        name="shippingMethod" 
                        value={opt.value} 
                        checked={formData.shippingMethod === opt.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-black"
                      />
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
                <div className="bg-white border border-gray-200 p-6 rounded">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">רחוב ומספר בית *</label>
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
                      <label className="block text-sm font-medium mb-2">עיר *</label>
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
                      <label className="block text-sm font-medium mb-2">מיקוד *</label>
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

              {/* ברכה */}
              <div className="bg-white border border-gray-200 p-6 rounded">
                <h2 className="text-2xl font-bold mb-6">ברכה אישית</h2>
                <textarea 
                  name="blessing" 
                  value={formData.blessing} 
                  onChange={handleInputChange} 
                  rows="3"
                  className="w-full border-2 border-gray-300 p-3 rounded focus:border-black focus:outline-none transition-colors"
                  placeholder="האם תרצה להוסיף ברכה אישית למוצר? (אופציונלי)" 
                />
              </div>

              {/* הערות */}
              <div className="bg-white border border-gray-200 p-6 rounded">
                <h2 className="text-2xl font-bold mb-6">הערות להזמנה</h2>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  rows="4"
                  className="w-full border-2 border-gray-300 p-3 rounded focus:border-black focus:outline-none transition-colors"
                  placeholder="הוראות מיוחדות למשלוח, זמן מועדף וכו' (אופציונלי)" 
                />
              </div>

              {/* כפתורים */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 px-8 text-lg font-bold rounded hover:bg-[#CFAA52] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
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

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const basePrice = (item.on_sale && item.sale_price)
                    ? parseFloat(item.sale_price)
                    : parseFloat(item.price) || 0
                  const extraPrice = parseFloat(item.extraPrice) || 0

                  const engravingData = item.customizations?.engraving
                  const optionsData = item.customizations?._options || {}
                  const optionEntries = Object.entries(optionsData)

                  return (
                    <div key={item.uniqueId || item.id} className="flex justify-between items-start py-2 text-sm border-b border-gray-200 last:border-0">
                      <div className="flex-1 min-w-0 pl-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-600">כמות: {item.quantity}</div>
                        {optionEntries.map(([optName, optVal]) => {
                          const label = optVal?.label ?? optVal?.name ?? optVal
                          if (!label) return null
                          return (
                            <div key={optName} className="text-xs text-gray-700">
                              {optName}: <span className="font-medium">{label}</span>
                            </div>
                          )
                        })}
                        {engravingData?.text && (
                          <div className="text-xs text-amber-700">
                            ✨ חריטה: {engravingData.text}
                            {engravingData.color && ` (${engravingData.color})`}
                          </div>
                        )}
                      </div>
                      <div className="font-medium whitespace-nowrap">₪{((basePrice + extraPrice) * item.quantity).toLocaleString('he-IL')}</div>
                    </div>
                  )
                })}
              </div>

              {/* ✅ שדה קופון */}
              <div className="border-t border-gray-300 pt-4 mb-4">
                <label className="block text-sm font-medium mb-2">🎟️ קוד קופון</label>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-700 text-sm">
                        ✅ קוד "{appliedCoupon.code}" הוחל
                      </div>
                      <div className="text-xs text-green-600">
                        הנחה: {appliedCoupon.discount_type === 'percent' 
                          ? `${appliedCoupon.discount_value}%` 
                          : `₪${appliedCoupon.discount_value}`}
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      הסירי
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="הקלידי קוד"
                        className="flex-1 border-2 border-gray-300 p-2 rounded text-sm focus:border-black focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={checkingCoupon}
                        className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
                      >
                        {checkingCoupon ? '...' : 'החל'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-600 text-xs mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">סכום ביניים:</span>
                  <span className="font-medium">₪{subtotal.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">משלוח:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? <span className="text-green-600">חינם!</span> : `₪${shippingCost}`}
                  </span>
                </div>
                {/* ✅ הצגת הנחה */}
                {discount > 0 && (
                  <div className="flex justify-between text-base text-green-600">
                    <span>הנחה ({appliedCoupon?.code}):</span>
                    <span className="font-medium">-₪{discount.toLocaleString('he-IL')}</span>
                  </div>
                )}
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
