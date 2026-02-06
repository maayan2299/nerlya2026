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

  // הוסף מוצר לעגלה
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // בדוק אם המוצר כבר קיים בעגלה
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        // אם קיים - עדכן כמות
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // אם לא קיים - הוסף חדש
        return [...prevCart, { ...product, quantity }]
      }
    })
    
    // פתח את מגירת העגלה
    setIsCartOpen(true)
  }

  // הסר מוצר מהעגלה
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  // עדכן כמות מוצר
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  // רוקן עגלה
  const clearCart = () => {
    setCart([])
  }

  // חשב סכום ביניים
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0
      return total + (price * item.quantity)
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