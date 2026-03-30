import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Terminal Details
    const MASOF = '4502249638'
    const KEY = 'd566dce13cebefa2c17e16faf2d602be94b4e50d'
    const PASSP = '02G38L8Y5E'

    if (!MASOF || !KEY || !PASSP) {
      throw new Error('Missing payment configuration')
    }

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // ==========================================
    // STEP 1 - APISign (Payment Page Request)
    // ==========================================
    
    const apiSignParams = {
      action: 'APISign',
      What: 'SIGN',
      KEY: KEY,
      PassP: PASSP,
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount)),
      UTF8: 'True',
      UTF8out: 'True',
      UserId: '203269535',
      ClientName: clientName,
      ClientLName: clientLName,
      street: 'levanon 3',
      city: 'netanya',
      zip: '42361',
      phone: '098610338',
      cell: customerPhone,
      email: customerEmail,
      Tash: '1',
      FixTash: 'False',
      ShowEngTashText: 'False',
      Coin: '1',
      Postpone: 'False',
      J5: 'False',
      Sign: 'True',
      MoreData: 'True',
      sendemail: 'True',
      SendHesh: 'False',
      PageLang: 'HEB',
      tmp: '1'
    }

    console.log('Step 1: Building APISign URL...')

    // Build APISign URL
    const apiSignUrl = new URL('https://icom.yaad.net/p/')
    Object.entries(apiSignParams).forEach(([key, value]) => {
      apiSignUrl.searchParams.append(key, value)
    })

    console.log('Step 1: Sending APISign request to HYP Pay...')

    // Send APISign request WITH Referer header
    const apiSignResponse = await fetch(apiSignUrl.toString(), {
      method: 'GET',
      headers: {
        'Referer': 'https://nerlya.com'  // שלח רק את הדומיין, לא את ה-path
      }
    })

    if (!apiSignResponse.ok) {
      throw new Error(`HYP APISign failed: ${apiSignResponse.status}`)
    }

    const apiSignText = await apiSignResponse.text()
    console.log('Step 1: Got APISign response')

    // ==========================================
    // Parse APISign Response
    // ==========================================
    
    const apiSignParams2 = new URLSearchParams(apiSignText)
    const signature = apiSignParams2.get('signature')
    
    if (!signature) {
      console.error('No signature in response:', apiSignText.substring(0, 200))
      throw new Error('Failed to get signature from HYP APISign')
    }

    console.log('Step 1: Successfully got signature from HYP Pay')

    // ==========================================
    // STEP 2 - Generating the Payment Page Link
    // ==========================================
    
    console.log('Step 2: Building payment page link...')

    const paymentParams = {
      action: 'pay',
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount)),
      UTF8: 'True',
      UTF8out: 'True',
      UserId: '203269535',
      ClientName: clientName,
      ClientLName: clientLName,
      street: 'levanon 3',
      city: 'netanya',
      zip: '42361',
      phone: '098610338',
      cell: customerPhone,
      email: customerEmail,
      Tash: '1',
      FixTash: 'False',
      ShowEngTashText: 'False',
      Coin: '1',
      Postpone: 'False',
      J5: 'False',
      Sign: 'True',
      MoreData: 'True',
      sendemail: 'True',
      SendHesh: 'False',
      PageLang: 'HEB',
      tmp: '1',
      signature: signature,
    }

    const params = new URLSearchParams(paymentParams)
    const paymentUrl = `https://icom.yaad.net/p/?${params.toString()}`

    console.log('Step 2: Payment URL created successfully')

    return new Response(
      JSON.stringify({
        paymentUrl,
        success: true,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
