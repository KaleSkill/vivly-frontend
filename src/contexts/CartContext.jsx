import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [shouldOpenCart, setShouldOpenCart] = useState(false)

  const triggerCartOpen = () => {
    setShouldOpenCart(true)
    // Reset after a short delay to allow the cart to open
    setTimeout(() => setShouldOpenCart(false), 100)
  }

  return (
    <CartContext.Provider value={{ shouldOpenCart, triggerCartOpen }}>
      {children}
    </CartContext.Provider>
  )
}
