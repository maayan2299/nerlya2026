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

  // הוסף מוצר לעגלה (עם תמיכה בחריטה, צבעים וטוספות!)
  const addToCart = (product, quantity = 1, customizations = {}, extraPrice = 0) => {
    setCart(prevCart => {
      // צור מזהה ייחודי למוצר
      const customizationKey = JSON.stringify(customizations || {})
      const uniqueId = `${product.id}-${customizationKey}`
      
      // בדוק אם המוצר (עם אותן התאמות) כבר קיים בעגלה
      const existingItem = prevCart.find(item => item.uniqueId === uniqueId)
      
      if (existingItem) {
        // אם קיים - עדכן כמות
        return prevCart.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // אם לא קיים - הוסף חדש
        const newItem = { 
          ...product, 
          quantity,
          uniqueId,
          customizations: customizations || {},
          extraPrice: extraPrice || 0,
        }
        return [...prevCart, newItem]
      }
    })
    
    // פתח את מגירת העגלה
    setIsCartOpen(true)
  }

  // הסר מוצר מהעגלה
  const removeFromCart = (uniqueId) => {
    setCart(prevCart => prevCart.filter(item => item.uniqueId !== uniqueId))
  }

  // עדכן כמות מוצר
  const updateQuantity = (uniqueId, quantity) => {
    if (quantity < 1) {
      removeFromCart(uniqueId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.uniqueId === uniqueId
          ? { ...item, quantity }
          : item
      )
    )
  }

  // רוקן עגלה
  const clearCart = () => {
    setCart([])
  }

  // חשב סכום ביניים (כולל התאמות!)
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = (item.on_sale && item.sale_price)
        ? parseFloat(item.sale_price)
        : parseFloat(item.price) || 0
      const itemTotal = (basePrice + (item.extraPrice || 0)) * item.quantity
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
