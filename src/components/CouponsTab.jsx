
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// משתמש באותו חיבור Supabase כמו בדאשבורד
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([])
  const [popupSettings, setPopupSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [uploading, setUploading] = useState(false)

  // טופס קופון חדש/עריכה
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_until: '',
    active: true,
  })

  // ============ טעינת נתונים ============
  const loadData = async () => {
    setLoading(true)
    try {
      const { data: couponsData } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: settingsData } = await supabase
        .from('popup_settings')
        .select('*')
        .limit(1)
        .single()

      setCoupons(couponsData || [])
      setPopupSettings(settingsData || { enabled: false, image_url: null, coupon_id: null })
    } catch (err) {
      console.error('Failed to load:', err)
      alert('שגיאה בטעינת נתונים: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ============ ניהול טופס ============
  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percent',
      discount_value: '',
      min_order_amount: '',
      max_uses: '',
      valid_until: '',
      active: true,
    })
    setEditingCoupon(null)
    setShowForm(false)
  }

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || '',
      max_uses: coupon.max_uses || '',
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : '',
      active: coupon.active,
    })
    setShowForm(true)
  }

  // ============ שמירת קופון ============
  const saveCoupon = async (e) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      alert('יש להזין קוד קופון')
      return
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      alert('יש להזין ערך הנחה תקין')
      return
    }
    if (formData.discount_type === 'percent' && parseFloat(formData.discount_value) > 100) {
      alert('הנחה באחוזים לא יכולה להיות יותר מ-100%')
      return
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_until: formData.valid_until || null,
      active: formData.active,
    }

    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', editingCoupon.id)
        if (error) throw error
        alert('✅ הקופון עודכן בהצלחה')
      } else {
        const { error } = await supabase.from('coupons').insert([payload])
        if (error) throw error
        alert('✅ הקופון נוצר בהצלחה')
      }
      resetForm()
      loadData()
    } catch (err) {
      console.error('Save failed:', err)
      if (err.code === '23505') {
        alert('❌ כבר קיים קופון עם הקוד הזה. בחרי קוד אחר.')
      } else {
        alert('שגיאה בשמירה: ' + err.message)
      }
    }
  }

  // ============ מחיקת קופון ============
  const deleteCoupon = async (id) => {
    if (!confirm('בטוחה שברצונך למחוק קופון זה?')) return
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
      alert('✅ הקופון נמחק')
      loadData()
    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  // ============ העלאת תמונת פופ-אפ ============
  const uploadImage = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      // מוחק תמונה ישנה אם יש
      if (popupSettings?.image_url) {
        const oldPath = popupSettings.image_url.split('/popup-images/')[1]
        if (oldPath) {
          await supabase.storage.from('popup-images').remove([oldPath])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `popup-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('popup-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('popup-images')
        .getPublicUrl(fileName)

      await updatePopupSetting('image_url', publicUrl)
      alert('✅ התמונה הועלתה בהצלחה')
    } catch (err) {
      console.error('Upload failed:', err)
      alert('שגיאה בהעלאה: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // ============ עדכון הגדרת פופ-אפ בודדת ============
  const updatePopupSetting = async (field, value) => {
    try {
      const updates = { [field]: value, updated_at: new Date().toISOString() }
      const { error } = await supabase
        .from('popup_settings')
        .update(updates)
        .eq('id', popupSettings.id)
      if (error) throw error
      setPopupSettings({ ...popupSettings, ...updates })
    } catch (err) {
      alert('שגיאה בעדכון: ' + err.message)
    }
  }

  // ============ מחיקת תמונת פופ-אפ ============
  const removeImage = async () => {
    if (!confirm('למחוק את התמונה הנוכחית?')) return
    try {
      if (popupSettings?.image_url) {
        const oldPath = popupSettings.image_url.split('/popup-images/')[1]
        if (oldPath) {
          await supabase.storage.from('popup-images').remove([oldPath])
        }
      }
      await updatePopupSetting('image_url', null)
    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500" dir="rtl">
        טוען...
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ============ אזור פופ-אפ ============ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🪟 הגדרות פופ-אפ
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          הפופ-אפ יוצג ללקוחות בכניסה לאתר. העלי תמונה שעיצבת (פוסטר/באנר) ובחרי איזה קופון מקושר.
        </p>

        {/* הפעלה/כיבוי */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md mb-4">
          <span className="font-medium">
            {popupSettings?.enabled ? '🟢 פופ-אפ פעיל' : '⚪ פופ-אפ כבוי'}
          </span>
          <button
            onClick={() => updatePopupSetting('enabled', !popupSettings?.enabled)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              popupSettings?.enabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {popupSettings?.enabled ? 'כבי' : 'הפעלי'}
          </button>
        </div>

        {/* תמונה */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">תמונת הפופ-אפ:</label>
          {popupSettings?.image_url ? (
            <div className="space-y-2">
              <img
                src={popupSettings.image_url}
                alt="פופ-אפ"
                className="max-w-xs rounded-md border border-gray-300"
              />
              <button
                onClick={removeImage}
                className="text-sm text-red-600 hover:underline"
              >
                🗑️ הסירי תמונה
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files[0])}
                disabled={uploading}
                className="block mx-auto"
              />
              <p className="text-xs text-gray-500 mt-2">
                {uploading ? 'מעלה...' : 'בחרי תמונה (PNG / JPG)'}
              </p>
            </div>
          )}
        </div>

        {/* בחירת קופון מקושר */}
        <div>
          <label className="block text-sm font-medium mb-2">קופון מקושר (אופציונלי):</label>
          <select
            value={popupSettings?.coupon_id || ''}
            onChange={(e) => updatePopupSetting('coupon_id', e.target.value || null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">ללא קופון (תמונה בלבד)</option>
            {coupons.filter(c => c.active).map(c => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.discount_value}₪`} הנחה)
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            אם תבחרי קופון, יופיע כפתור "העתק קוד" מתחת לתמונה
          </p>
        </div>
      </div>

      {/* ============ רשימת קופונים ============ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎟️ קופונים ({coupons.length})
          </h2>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800"
          >
            + קופון חדש
          </button>
        </div>

        {coupons.length === 0 ? (
          <p className="text-center text-gray-500 py-8">אין קופונים עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-right">קוד</th>
                  <th className="px-3 py-2 text-right">הנחה</th>
                  <th className="px-3 py-2 text-right">מינ' הזמנה</th>
                  <th className="px-3 py-2 text-right">שימושים</th>
                  <th className="px-3 py-2 text-right">תוקף</th>
                  <th className="px-3 py-2 text-right">סטטוס</th>
                  <th className="px-3 py-2 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-mono font-bold">{c.code}</td>
                    <td className="px-3 py-2">
                      {c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.discount_value}₪`}
                    </td>
                    <td className="px-3 py-2">{c.min_order_amount > 0 ? `${c.min_order_amount}₪` : '—'}</td>
                    <td className="px-3 py-2">
                      {c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''}
                    </td>
                    <td className="px-3 py-2">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString('he-IL') : 'ללא הגבלה'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={c.active ? 'text-green-600' : 'text-gray-400'}>
                        {c.active ? '🟢 פעיל' : '⚪ כבוי'}
                      </span>
                    </td>
                    <td className="px-3 py-2 space-x-1 space-x-reverse">
                      <button
                        onClick={() => openEditForm(c)}
                        className="text-blue-600 hover:underline"
                      >
                        ערוך
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="text-red-600 hover:underline"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ טופס יצירה/עריכה ============ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" dir="rtl">
            <h3 className="text-xl font-bold mb-4">
              {editingCoupon ? 'עריכת קופון' : 'קופון חדש'}
            </h3>
            <form onSubmit={saveCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">קוד קופון *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="WELCOME10"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סוג הנחה *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="percent">אחוז (%)</option>
                  <option value="amount">סכום קבוע (₪)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ערך ההנחה * {formData.discount_type === 'percent' ? '(%)' : '(₪)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percent' ? '10' : '50'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">מינימום הזמנה (₪)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="ריק = ללא מינימום"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">מספר שימושים מקסימלי</label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="ריק = ללא הגבלה"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תוקף עד</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">ריק = ללא הגבלת זמן</p>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">קופון פעיל</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800"
                >
                  {editingCoupon ? 'עדכן' : 'צור קופון'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 py-2 rounded-md font-medium hover:bg-gray-50"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
