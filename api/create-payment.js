// api/create-payment.js
import https from 'https'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, orderId, successUrl, errorUrl, cancelUrl } = req.body

  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const TERMINAL = process.env.HYP_TERMINAL
  const USERNAME = process.env.HYP_USERNAME
  const PASSWORD = process.env.HYP_PASSWORD

  if (!TERMINAL || !USERNAME || !PASSWORD) {
    console.error('Missing HYP environment variables')
    return res.status(500).json({ success: false, error: 'Missing payment configuration' })
  }

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

  const bodyData = new URLSearchParams({ int_in: xmlPayload }).toString()
  const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')

  try {
    const responseText = await new Promise((resolve, reject) => {
     const options = {
      hostname: '194.90.113.16', // כתובת ה-IP הישירה של CreditGuard
      port: 443,
      path: '/xpo/Relay',
      method: 'POST',
      servername: 'secure5.creditguard.co.il', // חשוב מאוד כדי שה-SSL יעבוד
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Content-Length': Buffer.byteLength(bodyData),
        'Host': 'secure5.creditguard.co.il' // מכריח את השרת להבין לאן הגענו
    }
  }
      const request = https.request(options, (response) => {
        let data = ''
        response.on('data', chunk => data += chunk)
        response.on('end', () => resolve(data))
      })

      request.on('error', reject)
      request.write(bodyData)
      request.end()
    })

    console.log('HYP Response:', responseText)

    const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/)
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/)
    const messageMatch = responseText.match(/<statusText>(.*?)<\/statusText>/)

    const status = statusMatch ? statusMatch[1].trim() : 'unknown'
    const message = messageMatch ? messageMatch[1].trim() : 'Unknown error'

    if (urlMatch && status === '000') {
      const paymentUrl = urlMatch[1].trim()
      return res.status(200).json({ success: true, paymentUrl, orderId })
    } else {
      console.error('HYP error:', status, message)
      return res.status(400).json({ success: false, error: message, status, rawResponse: responseText })
    }

  } catch (error) {
    console.error('Payment API error FULL:', error)
    console.error(error.stack)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
