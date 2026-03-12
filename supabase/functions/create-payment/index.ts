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

    const MASOF = Deno.env.get('HYP_MASOF')
    const KEY = Deno.env.get('HYP_KEY')
    const PASSP = Deno.env.get('HYP_PASSP')

    if (!MASOF || !KEY || !PASSP) {
      throw new Error('Missing payment configuration')
    }

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

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
      SendHesh: 'False',
      Tash: '1',
      Postpone: 'False',
      J5: 'False',
    }

    const signString = Object.keys(paymentParams)
      .sort()
      .map(key => `${key}=${paymentParams[key]}`)
      .join('&') + PASSP

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

    paymentParams.Sign = signHex

    const params = new URLSearchParams(paymentParams)
    const paymentUrl = `https://pay.hyp.co.il/p/?${params.toString()}`

    return new Response(
      JSON.stringify({ 
        paymentUrl,
        success: true 
      }),
      {
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        success: false
      }),
      {
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    )
  }
})
