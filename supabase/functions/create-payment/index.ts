import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      items,
    } = body

    const MASOF = Deno.env.get('HYP_MASOF')!
    const KEY = Deno.env.get('HYP_KEY')!
    const PASSP = Deno.env.get('HYP_PASSP')!

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // ✅ בנה את פרמטרי התשלום (בלי KEY/PASSP)
    const paymentParams = {
      action: 'pay',
      Masof: MASOF,
      Order: orderId,
      Info: `הזמנה ${orderId}`,
      Amount: String(amount),
      UTF8: 'True',
      UTF8out: 'True',
      ClientName: clientName,
      ClientLName: clientLName,
      email: customerEmail,
      cell: customerPhone,
      Coin: '1',
      PageLang: 'HEB',
      SendHesh: 'False',
      Tash: '1',
      Postpone: 'False',
    }

    // ✅ חתום עם HMAC-SHA256
    const signString = Object.keys(paymentParams)
      .sort()
      .map(key => `${key}=${paymentParams[key]}`)
      .join('&') + PASSP

    const encoder = new TextEncoder()
    const data = encoder.encode(signString)
    const hashBuffer = await crypto.subtle.sign('HMAC', 
      await crypto.subtle.importKey('raw', encoder.encode(KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      data
    )
    
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    paymentParams.Sign = hashHex

    // ✅ בנה את כתובת התשלום
    const params = new URLSearchParams(paymentParams)
    const paymentUrl = `https://pay.hyp.co.il/p/?${params.toString()}`

    console.log('Payment URL:', paymentUrl)

    return new Response(
      JSON.stringify({ paymentUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
