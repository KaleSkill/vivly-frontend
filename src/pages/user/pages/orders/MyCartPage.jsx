import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react'

const MyCartPage = () => {
  const navigate = useNavigate()
  const { updateQuantity, removeItem, clearCart, calculateTotals, totalItems, totalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [cartData, setCartData] = useState([])

  // Calculate totals from cartData
  const totalAmount = cartData.reduce((total, item) => {
    const price = parseFloat(item.discountedPrice || item.price || 0)
    return total + (price * item.selectedVariant.quantity)
  }, 0)

  const totalCartItems = cartData.reduce((total, item) => total + item.selectedVariant.quantity, 0)

  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      setLoading(true)
      const response = await userApi.cart.getCartItems()
      
      if (response.data.success) {
        setCartData(response.data.data)
      } else {
        setCartData([])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart items')
      setCartData([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, colorId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, colorId)
      return
    }

    try {
      setLoading(true)
      
      // Find the cart item to get the size
      const cartItem = cartData.find(item => 
        item.productId === productId && item.selectedVariant.colorId === colorId
      )
      
      if (!cartItem) {
        toast.error('Item not found in cart')
        return
      }
      
      // Update local state first for immediate feedback
      setCartData(prevData => 
        prevData.map(item => 
          item.productId === productId && item.selectedVariant.colorId === colorId
            ? { ...item, selectedVariant: { ...item.selectedVariant, quantity: newQuantity } }
            : item
        )
      )
      
      // Call the API to update the backend
      await userApi.cart.updateQuantity(
        productId, 
        colorId, 
        cartItem.selectedVariant.size, 
        newQuantity
      )
      
      toast.success('Cart updated successfully')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
      // Revert on error
      await fetchCartData()
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId, colorId) => {
    try {
      setLoading(true)
      
      // Find the cart item to get the size
      const cartItem = cartData.find(item => 
        item.productId === productId && item.selectedVariant.colorId === colorId
      )
      
      if (!cartItem) {
        toast.error('Item not found in cart')
        return
      }
      
      // Remove from local state first for immediate feedback
      setCartData(prevData => 
        prevData.filter(item => 
          !(item.productId === productId && item.selectedVariant.colorId === colorId)
        )
      )
      
      // Call the API to remove from backend
      await userApi.cart.removeFromCart(
        productId, 
        colorId, 
        cartItem.selectedVariant.size
      )
      
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
      // Revert on error
      await fetchCartData()
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = () => {
    if (cartData.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    navigate('/products')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (cartData.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to add some products!
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleContinueShopping} className="gap-2">
            <Package className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/products')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartData.map((item) => (
          <Card key={`${item.productId}-${item.selectedVariant.colorId}`} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Mobile Layout - Horizontal Card */}
              <div className="flex gap-4 p-4">
                {/* Product Image */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.image?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top Row: Name and Remove Button */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm line-clamp-2 leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-muted rounded-full">
                          {item.selectedVariant.colorName}
                        </span>
                        <span>•</span>
                        <span>Size {item.selectedVariant.size}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId, item.selectedVariant.colorId)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Bottom Row: Quantity, Price, Actions */}
                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity - 1)}
                        disabled={item.selectedVariant.quantity <= 1 || loading}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium text-sm">{item.selectedVariant.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity + 1)}
                        disabled={loading}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Price and Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          ₹{parseFloat(item.discountedPrice || item.price || 0).toLocaleString()}
                        </div>
                        {item.price && item.discountedPrice && item.discountedPrice < item.price && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{parseFloat(item.price).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({totalCartItems} items)</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹0</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleCheckout} 
              className="w-full gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              onClick={handleContinueShopping}
              className="w-full gap-2"
            >
              <Package className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MyCartPage
