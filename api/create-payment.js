import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, successUrl, errorUrl } = req.body;

  // אלו המשתנים שהגדרת ב-Vercel
  const TERMINAL = process.env.HYP_TERMINAL;
  const USERNAME = process.env.HYP_USERNAME;
  const PASSWORD = process.env.HYP_PASSWORD; // ה-PassP (02G38L8Y5E)

  // 1. בניית גוף הבקשה לפי ה-API שהם שלחו (Step 1)
  const postData = new URLSearchParams({
    action: 'APISign',
    what: 'SIGN',
    Masof: TERMINAL,
    PassP: PASSWORD,
    Amount: amount,
    Order: orderId,
    UTF8: 'True',
    // דפי חזרה
    Success: successUrl || `https://nerlya.com/success`,
    Error: errorUrl || `https://nerlya.com/error`,
    // שדות אופציונליים שיכולים לעזור
    Info: 'Purchase from Nerlya',
    ClientName: 'Customer',
  }).toString();

  try {
    const responseText = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'icom.yaad.net',
        port: 443,
        path: '/p/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          // כאן אנחנו "מתחפשים" לדפדפן כדי לעקוף את שגיאת ה-Referer שהם מתעקשים עליה
          'Referer': 'https://nerlya.com/',
          'Origin': 'https://nerlya.com'
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => resolve(data));
      });

      request.on('error', reject);
      request.write(postData);
      request.end();
    });

    console.log('HYP Response:', responseText);

    // 2. ניתוח התשובה (הם מחזירים מחרוזת של פרמטרים)
    const urlParams = new URLSearchParams(responseText);
    
    // אם הכל תקין, הם מחזירים URL שמתחיל ב-https
    if (responseText.startsWith('https')) {
        return res.status(200).json({ 
            success: true, 
            paymentUrl: responseText.trim() // ב-Pay Protocol התשובה היא פשוט ה-URL עצמו
        });
    } else {
        // אם חזרה שגיאה (כמו שגיאת אימות)
        return res.status(400).json({ 
            success: false, 
            error: 'שגיאת אימות מול חברת הסליקה', 
            details: responseText 
        });
    }

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
