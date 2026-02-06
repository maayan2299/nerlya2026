import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('privacy')

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* כותרת */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">מדיניות פרטיות ותקנון</h1>
          <div className="h-[2px] w-16 bg-black mx-auto"></div>
        </div>

        {/* טאבים */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-4 px-6 font-medium transition-all ${
              activeTab === 'privacy'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            מדיניות פרטיות
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-4 px-6 font-medium transition-all ${
              activeTab === 'terms'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            תקנון האתר
          </button>
        </div>

        {/* תוכן */}
        <div className="prose prose-lg max-w-none">
          {activeTab === 'privacy' ? <PrivacyContent /> : <TermsContent />}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-black">מדיניות פרטיות</h2>
        <p className="mb-4">
          ברוכים הבאים לאתר "נר-ליה" לתשמישי קדושה. אנו מתחייבים להגן על פרטיותכם ולשמור על המידע האישי שלכם בצורה אחראית ובטוחה.
        </p>
        <p className="text-sm text-gray-600">
          עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">1. איסוף מידע</h3>
        <p className="mb-3">אנו אוספים מידע בדרכים הבאות:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li><strong>מידע שאתם מספקים:</strong> שם, כתובת, מספר טלפון, כתובת דוא"ל בעת ביצוע הזמנה</li>
          <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, ומידע אודות השימוש באתר</li>
          <li><strong>עוגיות (Cookies):</strong> לשיפור חוויית הגלישה ושמירת העדפות</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">2. שימוש במידע</h3>
        <p className="mb-3">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>עיבוד ומשלוח הזמנות</li>
          <li>שירות לקוחות ותמיכה</li>
          <li>שליחת עדכונים על הזמנות ומבצעים (בהסכמה)</li>
          <li>שיפור השירות והאתר</li>
          <li>עמידה בדרישות חוק</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">3. שיתוף מידע</h3>
        <p className="mb-3">
          אנו לא נמכור או נשכיר את המידע האישי שלכם לצדדים שלישיים. אנו עשויים לשתף מידע רק עם:
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>חברות משלוחים לצורך אספקת המוצרים</li>
          <li>מעבדי תשלומים מאובטחים</li>
          <li>רשויות חוק במידת הצורך</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">4. אבטחת מידע</h3>
        <p>
          אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם, כולל הצפנת SSL, אחסון מאובטח, וגישה מוגבלת למידע רגיש.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">5. זכויותיכם</h3>
        <p className="mb-3">לכם הזכויות הבאות:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>לעיין במידע השמור אצלנו</li>
          <li>לתקן מידע שגוי</li>
          <li>למחוק את המידע שלכם</li>
          <li>להסיר את ההסכמה לקבלת דיוור</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">6. יצירת קשר</h3>
        <p>
          לשאלות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו:
        </p>
        <ul className="list-none space-y-2 mt-3">
          <li>📧 דוא"ל: info@nerlya.com</li>
          <li>📞 טלפון: 053-472-6022</li>
        </ul>
      </section>
    </div>
  )
}

function TermsContent() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-black">תקנון האתר</h2>
        <p className="mb-4">
          תקנון זה מסדיר את תנאי השימוש באתר "נר-ליה" ואת היחסים בין החנות ללקוחותיה. השימוש באתר מהווה הסכמה לתנאים אלו.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">1. כללי</h3>
        <ul className="list-disc pr-6 space-y-2">
          <li>האתר מיועד למכירת תשמישי קדושה ומוצרי יודאיקה</li>
          <li>המחירים באתר הם בשקלים חדשים וכוללים מע"מ</li>
          <li>החנות שומרת לעצמה את הזכות לעדכן מחירים ומלאי ללא הודעה מוקדמת</li>
          <li>התמונות באתר הן להמחשה בלבד - עשויים להיות הבדלים קלים במוצר בפועל</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">2. ביצוע הזמנה</h3>
        <ul className="list-disc pr-6 space-y-2">
          <li>ההזמנה מתבצעת באמצעות מילוי פרטים בטופס ההזמנה באתר</li>
          <li>לאחר ביצוע ההזמנה תישלח הודעת אישור למייל</li>
          <li>החנות שומרת את הזכות לבטל הזמנה במקרה של טעות במחיר או אי זמינות מוצר</li>
          <li>במקרה של ביטול הזמנה על ידי החנות, יוחזר מלוא התשלום</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">3. תשלום</h3>
        <ul className="list-disc pr-6 space-y-2">
          <li>התשלום מתבצע באמצעות אשראי, העברה בנקאית או PayPal</li>
          <li>התשלום מאובטח בתקן PCI DSS</li>
          <li>בביצוע ההזמנה הלקוח מאשר את נכונות פרטי התשלום</li>
          <li>החיוב יתבצע רק לאחר אישור ההזמנה</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">4. משלוחים</h3>
        <ul className="list-disc pr-6 space-y-2">
          <li>המשלוח מתבצע לכל רחבי הארץ באמצעות דואר שליחים עד הבית</li>
          <li>זמן אספקה: 4-6 ימי עסקים</li>
          <li><strong>משלוח חינם עד הבית</strong> להזמנות מעל ₪400</li>
          <li>ניתן לאסוף באיסוף עצמי ממשרדי החנות בתיאום מראש</li>
          <li>החנות אינה אחראית לעיכובים הנגרמים על ידי חברת השילוח</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">5. ביטול עסקה והחזרות</h3>
        <p className="mb-3">בהתאם לחוק הגנת הצרכן:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>ניתן לבטל עסקה תוך 14 ימים מיום קבלת המוצר</li>
          <li>המוצר חייב להיות במצב חדש, באריזה מקורית ללא פגיעה</li>
          <li>יש ליצור קשר עם שירות הלקוחות לקבלת אישור החזרה</li>
          <li>החזר כספי יתבצע תוך 14 ימים מקבלת המוצר בחזרה</li>
          <li>דמי משלוח לא יוחזרו (אלא אם המוצר פגום)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">6. פגמים ואחריות</h3>
        <ul className="list-disc pr-6 space-y-2">
          <li>במקרה של מוצר פגום, יש ליצור קשר תוך 7 ימים</li>
          <li>נבצע החלפה או החזר כספי מלא (כולל משלוח)</li>
          <li>המוצרים מגיעים עם אחריות היצרן (אם קיימת)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">7. קניין רוחני</h3>
        <p>
          כל התכנים באתר, לרבות טקסטים, תמונות ולוגו, הם רכושה הבלעדי של "נר-ליה" ומוגנים בזכויות יוצרים. אין להעתיק, לשכפל או להפיץ ללא אישור בכתב.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">8. סמכות שיפוט</h3>
        <p>
          סמכות השיפוט הבלעדית בכל עניין הנוגע לשימוש באתר תהיה לבתי המשפט במחוז המרכז, ישראל. הדין החל הוא הדין הישראלי.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-3 text-black">9. יצירת קשר</h3>
        <p className="mb-3">
          לשאלות או בקשות בנוגע לתקנון:
        </p>
        <ul className="list-none space-y-2">
          <li>📧 info@nerlya.com</li>
          <li>📞 053-472-6022</li>
          <li>📍 כתובת: פתח תקווה</li>
          <li>⏰ שעות פעילות: א'-ה' 8:30-17:00</li>
        </ul>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg mt-8">
        <p className="text-sm text-gray-600">
          <strong>הערה:</strong> החנות שומרת לעצמה את הזכות לעדכן את התקנון מעת לעת. שינויים יכנסו לתוקף מיד עם פרסומם באתר.
        </p>
      </section>
    </div>
  )
}