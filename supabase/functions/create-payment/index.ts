import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
<<<<<<< HEAD
  'Access-Control-Allow-Origin': 'https://nerlya.com,',
=======
  'Access-Control-Allow-Origin': 'https://nerlya.com',
>>>>>>> f8945b6d52cc1b24404eeca808aed2330abebd55
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // ✅ Handle preflight requests
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
      items,
    } = body

    console.log('📦 Received payment request:', { orderId, amount, customerName })

    // ✅ קבל את הקבועים מ-Supabase Secrets
    const MASOF = Deno.env.get('HYP_MASOF')
    const KEY = Deno.env.get('HYP_KEY')
    const PASSP = Deno.env.get('HYP_PASSP')

    if (!MASOF || !KEY || !PASSP) {
      console.error('❌ Missing environment variables')
      throw new Error('Missing payment configuration')
    }

    console.log('✅ Environment variables loaded')

    // ✅ פרז את השם
    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // ✅ בנה את פרמטרי התשלום (ללא KEY/PASSP, זה הסוד!)
    const paymentParams = {
      action: 'pay',
      Masof: MASOF,
      Order: orderId,
      Info: `Order ${orderId}`,
      Amount: String(Math.round(amount * 100)), // ❌ HYP Pay צריך אגורות, לא שקלים!
      UTF8: 'True',
      UTF8out: 'True',
      ClientName: clientName,
      ClientLName: clientLName,
      email: customerEmail,
      cell: customerPhone,
      Coin: '1', // ILS
      PageLang: 'HEB',
      SendHesh: 'False',
      Tash: '1',
      Postpone: 'False',
      J5: 'False',
    }

    console.log('📋 Payment params:', paymentParams)

    // ✅ חתום על הפרמטרים בעזרת HMAC-SHA256
    const signString = Object.keys(paymentParams)
      .sort()
      .map(key => `${key}=${paymentParams[key]}`)
      .join('&') + PASSP

    console.log('🔐 Sign string prepared')

    // ✅ חתום עם HMAC-SHA256
    const encoder = new TextEncoder()
    const data = encoder.encode(signString)
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data)
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const signHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

    console.log('✅ Signature created:', signHex)

    // ✅ הוסף חתימה לפרמטרים
    paymentParams.Sign = signHex

    // ✅ בנה את ה-URL הסופי
    const params = new URLSearchParams(paymentParams)
    const paymentUrl = `https://pay.hyp.co.il/p/?${params.toString()}`

    console.log('🔗 Payment URL created:', paymentUrl.substring(0, 100) + '...')

    // ✅ החזר את ה-URL עם CORS headers תקינים
    return new Response(
      JSON.stringify({ 
        paymentUrl,
        success: true 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        success: false
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    )
  }
})
