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
      throw new Error('Missing HYP credentials')
    }

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // ==========================================
    // STEP 1: APISign Request (לפי המדריך)
    // ==========================================
    
    const apiSignParams = {
      action: 'APISign',
      What: 'SIGN',
      KEY: KEY,
      PassP: PASSP,
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount * 100)), // סכום בסנטים
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
      sendemail: 'True',
      SendHesh: 'False',
    }

    console.log('Sending APISign request to HYP...')

    // בנה את ה-URL של APISign
    const apiSignUrl = new URL('https://pay.hyp.co.il/p/')
    Object.entries(apiSignParams).forEach(([key, value]) => {
      apiSignUrl.searchParams.append(key, value)
    })

    // שלח את ה-APISign request
    const apiSignResponse = await fetch(apiSignUrl.toString(), {
      method: 'GET',
    })

    if (!apiSignResponse.ok) {
      throw new Error(`HYP APISign failed: ${apiSignResponse.status}`)
    }

    const apiSignText = await apiSignResponse.text()
    console.log('APISign response received')

    // ==========================================
    // STEP 2: פרסר את ה-Response
    // ==========================================
    
    // התשובה בפורמט query string
    const apiSignParams2 = new URLSearchParams(apiSignText)
    
    // קבל את ה-signature מהתשובה
    const signature = apiSignParams2.get('signature')
    
    if (!signature) {
      console.error('No signature in response:', apiSignText.substring(0, 200))
      throw new Error('Failed to get signature from HYP APISign')
    }

    console.log('Got signature from HYP')

    // ==========================================
    // STEP 3: בנה את Payment URL עם action=pay
    // ==========================================
    
    // בנה את הפרמטרים של ה-Payment URL
    // השתמש בפרמטרים שקיבלנו מ-APISign + signature
    const paymentParams = {
      action: 'pay',
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount * 100)),
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
      sendemail: 'True',
      SendHesh: 'False',
      signature: signature, // הוסף את ה-signature שקיבלנו
    }

    const params = new URLSearchParams(paymentParams)
    const paymentUrl = `https://pay.hyp.co.il/p/?${params.toString()}`

    console.log('Payment URL created successfully')

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
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Payment error:', error.message)

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
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
