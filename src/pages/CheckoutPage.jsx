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
      
      // 1. שמירת פרטי ההזמנה ב-Session (כדי שנוכל לשלוח למייל אחרי התשלום)
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

      // 2. בניית הקישור הישיר ל-Hyp (עוקף את Supabase)
      const baseUrl = "https://pay.hyp.co.il/p/";
      const params = new URLSearchParams({
        action: "pay",
        Masof: "4502249638",
        Amount: finalTotal.toString(),
        UTF8: "True",
        UTF8out: "True",
        Coin: "1",
        ClientName: formData.fullName,
        email: formData.email,
        cell: formData.phone,
        Info: `הזמנה ${orderId} - נרליה`,
        PageLang: "HEB",
        success_url: "https://nerlya.com/success",
        error_url: "https://nerlya.com/cart"
      });

      // 3. מעבר מיידי
      const finalUrl = `${baseUrl}?${params.toString()}`;
      window.location.href = finalUrl;

    } catch (error) {
      console.error('❌ שגיאת תשלום:', error)
      setPaymentError(`לא הצלחנו לחבר אותך לתשלום: ${error.message}`)
      setIsSubmitting(false)
    }
  }
