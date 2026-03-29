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
      
      // 1. שמירת נתוני ההזמנה ב-SessionStorage (כדי שתוכלי למשוך אותם בדף התודה)
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

      // 2. יצירת טופס שליחה ישיר ל-Hyp (YaadPay)
      // זה עוקף את כל בעיות ה-Referer כי זה נשלח ישירות מהדפדפן של הלקוח
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://icom.yaad.net/p/';

      const fields = {
        action: 'pay',
        Masof: '4502249638',
        PassP: '02G38L8Y5E', // ה-PassP המאובטח שמצאנו
        Amount: finalTotal,
        Order: orderId,
        UTF8: 'True',
        Info: `הזמנה מאתר נרליה - ${formData.fullName}`,
        Email: formData.email,
        Tash: '1', // מספר תשלומים מקסימלי (אופציונלי)
        // כתובות חזרה (ודאי שהדפים האלו קיימים אצלך באתר)
        Success: 'https://nerlya.com/success', 
        Error: 'https://nerlya.com/error'
      };

      // הוספת השדות לטופס
      Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      // 3. שליחה פיזית של הטופס
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error('❌ שגיאת תשלום:', error)
      setPaymentError(`לא הצלחנו לחבר אותך לתשלום: ${error.message}`)
      setIsSubmitting(false)
    }
  }
