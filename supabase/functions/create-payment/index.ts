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

    const MASOF = "5603951026"
    const KEY = "7baa4e8aaa128748b3a28bc6ed57bd45c0ad927b"
    const PASSP = "EH6D5B307P"

    const nameParts = customerName.trim().split(' ')
    const clientName = nameParts[0] || customerName
    const clientLName = nameParts.slice(1).join(' ') || ''

    // שלב 1: בקשת חתימה מ-HYP
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
      SendHesh: 'False', // שינוי 1: ביטול זמני של הפקת חשבונית כדי לבודד את התקלה
      Tash: '1', // שינוי 2: הגבלה לתשלום אחד
      J5: 'False',
      Postpone: 'False',
    })

    const signUrl = `https://pay.hyp.co.il/p/?${signParams.toString()}`
    console.log('Signing URL:', signUrl)

    const signResponse = await fetch(signUrl)
    const signedParams = await signResponse.text()
    console.log('Signed params:', signedParams) // זה הלוג הכי קריטי שלנו עכשיו!

    if (!signedParams || signedParams.toLowerCase().includes('error')) {
      throw new Error(`HYP signing error: ${signedParams}`)
    }

    // שלב 2: בניית כתובת התשלום
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
