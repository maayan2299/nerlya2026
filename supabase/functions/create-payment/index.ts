import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

    // Build heshDesc (invoice items) format: [0~ItemName~qty~price]
    const heshDesc = items
      .map((item: any) => `[0~${item.name}~${item.quantity}~${item.price}]`)
      .join('')

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // Step 1: Get signed params from HYP
    const signParams = new URLSearchParams({
      action: 'APISign',
      What: 'SIGN',
      KEY,
      PassP: PASSP,
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
      Sign: 'True',
      MoreData: 'True',
      sendemail: 'True',
      SendHesh: 'True',
      heshDesc,
      Tash: '12',
      J5: 'False',
      Postpone: 'False',
    })

    const signUrl = `https://pay.hyp.co.il/p/?${signParams.toString()}`
    console.log('Signing URL:', signUrl)

    const signResponse = await fetch(signUrl)
    const signedParams = await signResponse.text()
    console.log('Signed params:', signedParams)

    if (!signedParams || signedParams.toLowerCase().includes('error')) {
      throw new Error(`HYP signing error: ${signedParams}`)
    }

    // Step 2: Build payment page URL
    const paymentUrl = `https://pay.hyp.co.il/p/?action=pay&${signedParams}`

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
