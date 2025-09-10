import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { CartSheet } from './cart-sheet-new'

const CartButton = ({ product, colorId, size, quantity = 1, variant = "default", className = "" }) => {
  const { 
    addToCart, 
    isProductInCart, 
    getCartItem, 
    openCart,
    totalItems 
  } = useCartStore()
  
  const [isAdding, setIsAdding] = useState(false)

  const isInCart = isProductInCart(product._id, colorId, size)
  const cartItem = getCartItem(product._id, colorId, size)

  const handleAddToCart = async () => {
    if (!colorId || !size) {
      // If no color/size selected, open cart to show existing items
      openCart()
      return
    }

    setIsAdding(true)
    try {
      await addToCart(product, colorId, size, quantity)
    } finally {
      setIsAdding(false)
    }
  }

  const handleGoToCart = () => {
    openCart()
  }

  if (isInCart && cartItem) {
    return (
      <Button 
        onClick={handleGoToCart}
        variant="outline"
        className={`w-full ${className}`}
        disabled={isAdding}
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Go to Cart ({cartItem.quantity})
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleAddToCart}
      variant={variant}
      className={`w-full ${className}`}
      disabled={isAdding || !colorId || !size}
    >
      <ShoppingBag className="w-4 h-4 mr-2" />
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}

// Cart Icon with Badge Component
export const CartIcon = () => {
  const { totalItems, openCart } = useCartStore()

  return (
    <CartSheet>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={openCart}
      >
        <ShoppingBag className="h-4 w-4" />
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
        <span className="sr-only">Shopping Cart</span>
      </Button>
    </CartSheet>
  )
}

export { CartButton }
