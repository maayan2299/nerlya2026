import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // טען עגלה מ-localStorage בטעינה ראשונה
  useEffect(() => {
    const savedCart = localStorage.getItem('nerlya-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // שמור עגלה ל-localStorage כשהיא משתנה
  useEffect(() => {
    localStorage.setItem('nerlya-cart', JSON.stringify(cart))
  }, [cart])

  // הוסף מוצר לעגלה (עם תמיכה בחריטה!)
  const addToCart = (product, quantity = 1, engravingText = null) => {
    setCart(prevCart => {
      // צור מזהה ייחודי למוצר (כולל חריטה אם יש)
      const uniqueId = engravingText 
        ? `${product.id}-engraved-${engravingText}` 
        : product.id
      
      // בדוק אם המוצר (עם אותה חריטה) כבר קיים בעגלה
      const existingItem = prevCart.find(item => {
        if (engravingText) {
          return item.uniqueId === uniqueId
        }
        return item.id === product.id && !item.engravingText
      })
      
      if (existingItem) {
        // אם קיים - עדכן כמות
        return prevCart.map(item =>
          (item.uniqueId || item.id) === uniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // אם לא קיים - הוסף חדש
        const newItem = { 
          ...product, 
          quantity,
          uniqueId,
          engravingText,
          engravingPrice: engravingText ? (product.engraving_price || 10) : 0
        }
        return [...prevCart, newItem]
      }
    })
    
    // פתח את מגירת העגלה
    setIsCartOpen(true)
  }

  // הסר מוצר מהעגלה
  const removeFromCart = (uniqueId) => {
    setCart(prevCart => prevCart.filter(item => (item.uniqueId || item.id) !== uniqueId))
  }

  // עדכן כמות מוצר
  const updateQuantity = (uniqueId, quantity) => {
    if (quantity < 1) {
      removeFromCart(uniqueId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        (item.uniqueId || item.id) === uniqueId
          ? { ...item, quantity }
          : item
      )
    )
  }

  // רוקן עגלה
  const clearCart = () => {
    setCart([])
  }

  // חשב סכום ביניים (כולל חריטה!)
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = parseFloat(item.price) || 0
      const engravingPrice = parseFloat(item.engravingPrice) || 0
      const itemTotal = (basePrice + engravingPrice) * item.quantity
      return total + itemTotal
    }, 0)
  }

  // חשב משלוח
  const getShipping = () => {
    const subtotal = getSubtotal()
    return subtotal >= 400 ? 0 : 35
  }

  // חשב סה"כ
  const getTotal = () => {
    return getSubtotal() + getShipping()
  }

  // כמות פריטים בעגלה
  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getShipping,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
