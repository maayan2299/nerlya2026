// supabase/functions/create-payment/index.ts

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, orderId, successUrl, errorUrl, cancelUrl } = await req.json()

    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const TERMINAL = Deno.env.get('HYP_TERMINAL') ?? ''
    const USERNAME = Deno.env.get('HYP_USERNAME') ?? ''
    const PASSWORD = Deno.env.get('HYP_PASSWORD') ?? ''

    // המרת סכום לאגורות
    const totalInAgorot = Math.round(parseFloat(amount) * 100)

    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<ashrait>
  <request>
    <version>2000</version>
    <language>HEB</language>
    <command>doDeal</command>
    <doDeal>
      <terminalNumber>${TERMINAL}</terminalNumber>
      <cardNo>CGMPI</cardNo>
      <total>${totalInAgorot}</total>
      <transactionType>Debit</transactionType>
      <creditType>RegularCredit</creditType>
      <currency>1</currency>
      <transactionCode>Internet</transactionCode>
      <validation>TxnSetup</validation>
      <uniqueid>${orderId}</uniqueid>
      <mpiValidation>AutoComm</mpiValidation>
      <successUrl>${successUrl}</successUrl>
      <errorUrl>${errorUrl}</errorUrl>
      <cancelUrl>${cancelUrl}</cancelUrl>
    </doDeal>
  </request>
</ashrait>`

    const bodyData = new URLSearchParams({ int_in: xmlPayload }).toString()
    const credentials = btoa(`${USERNAME}:${PASSWORD}`)

    const response = await fetch('https://cguat2.creditguard.co.il/xpo/Relay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: bodyData,
    })

    const responseText = await response.text()
    console.log('HYP Response:', responseText)

    const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/)
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/)
    const messageMatch = responseText.match(/<statusText>(.*?)<\/statusText>/)

    const status = statusMatch ? statusMatch[1].trim() : 'unknown'
    const message = messageMatch ? messageMatch[1].trim() : 'Unknown error'

    if (urlMatch && status === '000') {
      const paymentUrl = urlMatch[1].trim()
      return new Response(
        JSON.stringify({ success: true, paymentUrl, orderId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('HYP error:', status, message)
      return new Response(
        JSON.stringify({ success: false, error: message, status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
