import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Badge } from '@/components/ui/badge'

const CartSheet = ({ children, autoOpen = false }) => {
  const navigate = useNavigate()
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    openCart,
    closeCart,
    updateQuantity,
    removeFromCart,
    fetchCartItems,
    formatPrice
  } = useCartStore()

  // Auto-open cart when autoOpen prop changes
  useEffect(() => {
    if (autoOpen) {
      openCart()
    }
  }, [autoOpen, openCart])

  // Fetch cart items when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchCartItems()
    }
  }, [isOpen, fetchCartItems])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-6">
        <SheetHeader className="flex-shrink-0 px-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-0">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.colorId}-${item.size}`} className="flex gap-4 group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-full text-xs">
                        {item.colorName}
                      </span>
                      <span>•</span>
                      <span>Size {item.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                      {item.isOnSale && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateQuantity(item.productId, item.colorId, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateQuantity(item.productId, item.colorId, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => removeFromCart(item.productId, item.colorId, item.size)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-medium mb-2 text-lg">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add some products to get started
              </p>
              <Button onClick={closeCart} variant="outline">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator className="flex-shrink-0" />
            <SheetFooter className="flex-shrink-0 flex-col gap-4 pt-4 px-0">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm">
                  <span className="font-medium">Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                </div>
                <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors rounded-full" 
                size="lg" 
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export { CartSheet }
