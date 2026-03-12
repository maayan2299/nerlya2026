import { useState, useEffect } from 'react'

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    textSize: 100,
    highContrast: false,
    readableFont: false,
    largeCursor: false,
    highlightLinks: false,
    grayscale: false,
  })

  // מיקום הכפתור - ניתן לגרירה!
  const [position, setPosition] = useState({ bottom: 24, right: 16 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // טען הגדרות + מיקום מ-localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    const savedPosition = localStorage.getItem('accessibility-button-position')
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }

    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition))
      } catch (e) {
        console.error('Error loading position:', e)
      }
    }
  }, [])

  // שמור מיקום
  useEffect(() => {
    localStorage.setItem('accessibility-button-position', JSON.stringify(position))
  }, [position])

  // החל הגדרות
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    applySettings()
  }, [settings])

  // נעילת גלילה כשהתפריט פתוח
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  function applySettings() {
    const root = document.documentElement
    const body = document.body

    // גודל טקסט
    root.style.fontSize = `${settings.textSize}%`

    // ניגודיות גבוהה
    if (settings.highContrast) {
      body.style.backgroundColor = '#000'
      body.style.color = '#fff'
    } else {
      body.style.backgroundColor = ''
      body.style.color = ''
    }

    // פונט קריא
    if (settings.readableFont) {
      body.style.fontFamily = 'Arial, sans-serif'
      body.style.letterSpacing = '0.05em'
      body.style.lineHeight = '1.8'
    } else {
      body.style.fontFamily = ''
      body.style.letterSpacing = ''
      body.style.lineHeight = ''
    }

    // סמן גדול
    if (settings.largeCursor) {
      body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Cpath fill=\'black\' stroke=\'white\' stroke-width=\'1\' d=\'M5 5 L5 25 L12 18 L16 27 L19 26 L15 17 L23 17 Z\'/%3E%3C/svg%3E") 0 0, auto'
    } else {
      body.style.cursor = ''
    }

    // הדגשת קישורים
    const style = document.getElementById('accessibility-link-style')
    if (settings.highlightLinks) {
      if (!style) {
        const newStyle = document.createElement('style')
        newStyle.id = 'accessibility-link-style'
        newStyle.textContent = 'a { background-color: yellow !important; color: black !important; text-decoration: underline !important; font-weight: bold !important; }'
        document.head.appendChild(newStyle)
      }
    } else {
      if (style) style.remove()
    }

    // גווני אפור
    if (settings.grayscale) {
      root.style.filter = 'grayscale(100%)'
    } else {
      root.style.filter = ''
    }
  }

  function resetAll() {
    setSettings({
      textSize: 100,
      highContrast: false,
      readableFont: false,
      largeCursor: false,
      highlightLinks: false,
      grayscale: false,
    })
  }

  // גרירה - התחלה
  function handleDragStart(e) {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches ? e.touches[0] : e
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  // גרירה - תזוזה
  function handleDragMove(e) {
    if (!isDragging) return
    e.preventDefault()

    const touch = e.touches ? e.touches[0] : e
    const deltaX = dragStart.x - touch.clientX
    const deltaY = dragStart.y - touch.clientY

    // חישוב מיקום חדש
    const newRight = Math.max(16, Math.min(window.innerWidth - 64, position.right + deltaX))
    const newBottom = Math.max(16, Math.min(window.innerHeight - 64, position.bottom + deltaY))

    setPosition({
      bottom: newBottom,
      right: newRight,
    })

    // עדכן נקודת התחלה לתנועה חלקה
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  // גרירה - סיום
  function handleDragEnd(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleDragMove(e)
      const handleEnd = (e) => handleDragEnd(e)

      window.addEventListener('mousemove', handleMove, { passive: false })
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleEnd)

      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleEnd)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, dragStart, position])

  return (
    <>
      {/* כפתור נגישות - ניתן לגרירה! */}
      <button
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={(e) => {
          e.stopPropagation()
          if (!isDragging) setIsOpen(!isOpen)
        }}
        style={{ 
          bottom: `${position.bottom}px`, 
          right: `${position.right}px`,
          transition: isDragging ? 'none' : 'all 0.3s'
        }}
        className={`fixed z-[101] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg ${
          isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:scale-110'
        }`}
        aria-label="נגישות"
      >
        <span className="text-2xl" style={{ pointerEvents: 'none' }}>♿</span>
      </button>

      {/* תפריט נגישות */}
      {isOpen && (
        <>
          {/* רקע */}
          <div
            className="fixed inset-0 bg-black/30 z-[99]"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* תפריט */}
          <div 
            style={{ bottom: `${position.bottom + 64}px`, right: `${position.right}px` }}
            className="fixed z-[101] bg-white rounded-2xl shadow-2xl w-[280px] border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h3 className="font-bold text-lg text-center">נגישות</h3>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {/* גודל טקסט */}
              <div>
                <label className="text-sm font-medium mb-2 block">גודל טקסט</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSettings(s => ({ ...s, textSize: Math.max(80, s.textSize - 10) }))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    A-
                  </button>
                  <span className="flex-1 text-center text-sm">{settings.textSize}%</span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, textSize: Math.min(150, s.textSize + 10) }))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* ניגודיות */}
              <button
                onClick={() => setSettings(s => ({ ...s, highContrast: !s.highContrast }))}
                className={`w-full p-3 rounded-lg border-2 text-right transition-colors ${
                  settings.highContrast ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ניגודיות גבוהה</span>
                  {settings.highContrast && <span className="text-blue-500">✓</span>}
                </div>
              </button>

              {/* פונט קריא */}
              <button
                onClick={() => setSettings(s => ({ ...s, readableFont: !s.readableFont }))}
                className={`w-full p-3 rounded-lg border-2 text-right transition-colors ${
                  settings.readableFont ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">פונט קריא</span>
                  {settings.readableFont && <span className="text-blue-500">✓</span>}
                </div>
              </button>

              {/* סמן גדול */}
              <button
                onClick={() => setSettings(s => ({ ...s, largeCursor: !s.largeCursor }))}
                className={`w-full p-3 rounded-lg border-2 text-right transition-colors ${
                  settings.largeCursor ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">סמן גדול</span>
                  {settings.largeCursor && <span className="text-blue-500">✓</span>}
                </div>
              </button>

              {/* הדגשת קישורים */}
              <button
                onClick={() => setSettings(s => ({ ...s, highlightLinks: !s.highlightLinks }))}
                className={`w-full p-3 rounded-lg border-2 text-right transition-colors ${
                  settings.highlightLinks ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">הדגש קישורים</span>
                  {settings.highlightLinks && <span className="text-blue-500">✓</span>}
                </div>
              </button>

              {/* גווני אפור */}
              <button
                onClick={() => setSettings(s => ({ ...s, grayscale: !s.grayscale }))}
                className={`w-full p-3 rounded-lg border-2 text-right transition-colors ${
                  settings.grayscale ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">גווני אפור</span>
                  {settings.grayscale && <span className="text-blue-500">✓</span>}
                </div>
              </button>

              {/* איפוס */}
              <button
                onClick={resetAll}
                className="w-full p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                איפוס הכל
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}