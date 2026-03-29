import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, referer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
    } = body

    // קרא את כל ה-credentials מ-Secrets
    const MASOF = Deno.env.get('HYP_MASOF')
    const KEY = Deno.env.get('HYP_KEY')
    const PASSP = Deno.env.get('HYP_PASSP')

    if (!MASOF || !KEY || !PASSP) {
      console.error('Missing HYP credentials:', {
        MASOF: !!MASOF,
        KEY: !!KEY,
        PASSP: !!PASSP,
      })
      throw new Error('Missing payment configuration')
    }

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // בנה את הפרמטרים לפי HYP Pay API docs - Pay Protocol
    const paymentParams = {
      action: 'APISign',
      What: 'SIGN',
      Masof: MASOF,
      KEY: KEY,
      PassP: PASSP,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount * 100)), // סכום בסנטים
      UTF8: 'True',
      UTF8out: 'True',
      ClientName: clientName,
      ClientLName: clientLName,
      email: customerEmail,
      cell: customerPhone,
      Coin: '1', // 1 = שקל
      PageLang: 'HEB',
      Tash: '1',
      FixTash: 'False',
      Postpone: 'False',
      J5: 'False',
      Sign: 'True',
      MoreData: 'True',
    }

    console.log('Calling HYP APISign with params:', {
      Masof: MASOF,
      Order: orderId,
      Amount: paymentParams.Amount,
    })

    // שלב 1: קרא ל-APISign לקבלת signature
    const apiSignUrl = new URL('https://pay.hyp.co.il/p/')
    Object.entries(paymentParams).forEach(([key, value]) => {
      apiSignUrl.searchParams.append(key, value)
    })

    console.log('APISign URL (first 100 chars):', apiSignUrl.toString().substring(0, 100))

    const apiSignResponse = await fetch(apiSignUrl.toString(), {
      method: 'GET',
    })

    const apiSignText = await apiSignResponse.text()
    console.log('APISign response:', apiSignText.substring(0, 200))

    // פרסר את התשובה (היא בפורמט query string)
    const apiSignParams = new URLSearchParams(apiSignText)
    const signature = apiSignParams.get('signature')

    if (!signature) {
      console.error('No signature in APISign response:', apiSignText)
      throw new Error('Failed to get signature from HYP Pay APISign')
    }

    console.log('Got signature:', signature.substring(0, 20) + '...')

    // שלב 2: בנה את ה-payment URL עם action=pay
    const paymentUrlParams = {
      action: 'pay',
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: paymentParams.Amount,
      UTF8: 'True',
      UTF8out: 'True',
      ClientName: clientName,
      ClientLName: clientLName,
      email: customerEmail,
      cell: customerPhone,
      Coin: '1',
      PageLang: 'HEB',
      Tash: '1',
      FixTash: 'False',
      Postpone: 'False',
      J5: 'False',
      Sign: 'True',
      MoreData: 'True',
      signature: signature, // הוסף את ה-signature שקיבלנו
    }

    const params = new URLSearchParams(paymentUrlParams)
    const paymentUrl = `https://pay.hyp.co.il/p/?${params.toString()}`

    console.log('Payment URL created successfully for order:', orderId)

    return new Response(
      JSON.stringify({
        paymentUrl,
        success: true,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, referer',
          'Access-Control-Expose-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Payment function error:', error.message, error.stack)

    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error',
        success: false,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, referer',
          'Access-Control-Expose-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
