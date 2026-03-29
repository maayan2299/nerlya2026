import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, successUrl, errorUrl, cancelUrl } = req.body;

  // בדיקה שכל השדות הגיעו מהפרונט-אנד
  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const TERMINAL = process.env.HYP_TERMINAL;
  const USERNAME = process.env.HYP_USERNAME;
  const PASSWORD = process.env.HYP_PASSWORD;

  if (!TERMINAL || !USERNAME || !PASSWORD) {
    console.error('Missing HYP environment variables');
    return res.status(500).json({ success: false, error: 'Missing payment configuration in Vercel settings' });
  }

  // המרת סכום לאגורות (Hyp דורשים מספר שלם)
  const totalInAgorot = Math.round(parseFloat(amount) * 100);

  // בניית ה-XML לפי הפרוטוקול של YaadPay/Hyp
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
        // הכתובת הרשמית של שרת ה-API של YaadPay/Hyp
        hostname: 'icom.yaad.net', 
        port: 443,
        path: '/p/', // הנתיב המדויק לשליחת XML
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
          'Content-Length': Buffer.byteLength(bodyData),
          // קריטי: הגדרת הדומיין שלך כדי למנוע שגיאת REFERER
          'Referer': 'https://nerlya.com'
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      });

      request.on('error', (err) => {
        console.error('Request Error:', err);
        reject(err);
      });
      
      request.write(bodyData);
      request.end();
    });

    console.log('HYP Response Raw:', responseText);

    // חילוץ ה-URL של דף הסליקה והסטטוס מהתשובה של Hyp
    const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/);
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/);
    
    const status = statusMatch ? statusMatch[1].trim() : 'unknown';

    if (urlMatch && (status === '000' || status === '0')) {
      const paymentUrl = urlMatch[1].trim();
      return res.status(200).json({ success: true, paymentUrl, orderId });
    } else {
      console.error('HYP returned error status:', status);
      return res.status(400).json({ 
        success: false, 
        error: 'חלה שגיאה בתקשורת מול חברת הסליקה', 
        rawResponse: responseText 
      });
    }

  } catch (error) {
    console.error('Payment API Exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: ' + error.message
    });
  }
}
