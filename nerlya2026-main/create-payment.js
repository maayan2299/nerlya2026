// api/create-payment.js
// Vercel Serverless Function — שמרי בתיקיית /api בשורש הפרויקט

export default async function handler(req, res) {
  // אפשר רק POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, orderId, customerName, customerEmail, successUrl, errorUrl, cancelUrl } = req.body

  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // פרטי HYP — אלו יגיעו מ-Environment Variables ב-Vercel
  const TERMINAL = process.env.HYP_TERMINAL || '4502249638'
  const USERNAME = process.env.HYP_USERNAME || 'chplh'
  const PASSWORD = process.env.HYP_PASSWORD || 'aaa123456789'
  const HYP_URL = 'https://cg.creditguard.co.il/xpo/Relay'

  // המרת סכום לאגורות (כפל ב-100)
  const totalInAgorot = Math.round(parseFloat(amount) * 100)

  // בניית ה-XML לפי דוקומנטציה של HYP
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
      <currency>ILS</currency>
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

  try {
    // שליחה ל-HYP עם Basic Auth
    const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')

    const hypResponse = await fetch(HYP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({ int_in: xmlPayload }).toString()
    })

    const responseText = await hypResponse.text()
    console.log('HYP Response:', responseText)

    // חיפוש ה-URL בתוך ה-XML שחזר
    const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/)
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/)
    const messageMatch = responseText.match(/<statusText>(.*?)<\/statusText>/)

    const status = statusMatch ? statusMatch[1].trim() : 'unknown'
    const message = messageMatch ? messageMatch[1].trim() : 'Unknown error'

    if (urlMatch && status === '000') {
      const paymentUrl = urlMatch[1].trim()
      return res.status(200).json({ 
        success: true, 
        paymentUrl,
        orderId 
      })
    } else {
      console.error('HYP error:', status, message)
      return res.status(400).json({ 
        success: false, 
        error: message,
        status,
        rawResponse: responseText
      })
    }

  } catch (error) {
    console.error('Payment API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'שגיאה בחיבור לשירות התשלומים' 
    })
  }
}
