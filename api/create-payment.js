import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, successUrl, errorUrl, cancelUrl } = req.body;

  const TERMINAL = process.env.HYP_TERMINAL;
  const USERNAME = process.env.HYP_USERNAME;
  const PASSWORD = process.env.HYP_PASSWORD; // כאן צריך להיות ה-PassP (02G38L8Y5E)

  const totalInAgorot = Math.round(parseFloat(amount) * 100);

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
</ashrait>`;

  const bodyData = new URLSearchParams({ int_in: xmlPayload }).toString();
  const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  try {
    const responseText = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'icom.yaad.net',
        port: 443,
        path: '/p/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
          'Content-Length': Buffer.byteLength(bodyData),
          // שינוי קריטי: שליחת ה-Referer בדיוק כפי שהם מצפים לו
          'Referer': 'https://nerlya.com/', 
          'Origin': 'https://nerlya.com',
          'User-Agent': 'Mozilla/5.0 (Vercel Serverless)' 
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => resolve(data));
      });

      request.on('error', reject);
      request.write(bodyData);
      request.end();
    });

    // בדיקה מה חזר מהשרת של Hyp
    if (responseText.includes('<mpiHostedPageUrl>')) {
      const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/);
      return res.status(200).json({ success: true, paymentUrl: urlMatch[1].trim() });
    } else {
      // אם זה נכשל, נשלח את התשובה המלאה כדי שנוכל לקרוא אותה בלוגים
      console.error('Hyp Error Response:', responseText);
      return res.status(400).json({ success: false, raw: responseText });
    }

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
