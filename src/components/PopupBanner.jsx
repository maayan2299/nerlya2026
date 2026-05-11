import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PopupBanner() {
  const [popup, setPopup] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadPopup = async () => {
      try {
        // טוען הגדרות פופ-אפ
        const { data: settings, error: settingsError } = await supabase
          .from('popup_settings')
          .select('*')
          .limit(1)
          .single()

        if (settingsError || !settings) return
        if (!settings.enabled || !settings.image_url) return

        setPopup(settings)

        // טוען את הקופון המקושר (אם יש)
        if (settings.coupon_id) {
          const { data: couponData } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', settings.coupon_id)
            .eq('active', true)
            .single()

          if (couponData) setCoupon(couponData)
        }

        // השהיה קלה לפני הצגה - לחוויה חלקה
        setTimeout(() => setShow(true), 800)
      } catch (err) {
        console.error('Failed to load popup:', err)
      }
    }

    loadPopup()
  }, [])

  const handleCopyCoupon = async () => {
    if (!coupon?.code) return
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleClose = () => {
    setShow(false)
    // אופציונלי: שמירה ב-sessionStorage שכבר הוצג בסשן הזה
    // sessionStorage.setItem('popup_seen', '1')
  }

  if (!show || !popup) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
      dir="rtl"
    >
      <div
        className="relative max-w-md w-full animate-popup-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* כפתור סגירה */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
          aria-label="סגור"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* התמונה */}
        <div className="rounded-lg overflow-hidden shadow-2xl bg-white">
          <img
            src={popup.image_url}
            alt="מבצע"
            className="w-full h-auto block"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />

          {/* כפתור העתקת קוד — מופיע רק אם יש קופון מקושר */}
          {coupon && (
            <div className="p-4 bg-white">
              <button
                onClick={handleCopyCoupon}
                className="w-full py-3 px-4 rounded-md font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: copied ? '#16a34a' : '#000',
                  color: '#fff',
                }}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>הקוד הועתק!</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>העתק קוד: {coupon.code}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* אנימציית כניסה */}
      <style>{`
        @keyframes popup-in {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popup-in {
          animation: popup-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}
