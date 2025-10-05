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
  CreditCard,
  Package,
  ShoppingBag,
  Hash,
  ArrowRight
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-center">
              Looks like you haven't added any items to your cart yet. Start shopping to add some products!
            </p>
            <Button onClick={handleContinueShopping} className="gap-2 rounded-full" size="lg">
              <Package className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Shopping Cart
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Hash className="h-3 w-3 mr-1" />
            {totalCartItems} items
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.map((item) => (
              <Card key={`${item.productId}-${item.selectedVariant.colorId}`} className="border-border/50 hover:border-border transition-colors duration-200">
                <CardContent className="p-4">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
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
                    
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quantity</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity - 1)}
                            disabled={item.selectedVariant.quantity <= 1 || loading}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">{item.selectedVariant.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity + 1)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total</span>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            ₹{parseFloat(item.discountedPrice || item.price || 0).toFixed(2)}
                          </div>
                          {item.price && item.discountedPrice && item.discountedPrice < item.price && (
                            <div className="text-xs text-muted-foreground line-through">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-base line-clamp-2">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity - 1)}
                              disabled={item.selectedVariant.quantity <= 1 || loading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.selectedVariant.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.selectedVariant.colorId, item.selectedVariant.quantity + 1)}
                              disabled={loading}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-base">
                            ₹{parseFloat(item.discountedPrice || item.price || 0).toFixed(2)}
                          </div>
                          {item.price && item.discountedPrice && item.discountedPrice < item.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalCartItems} items)</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full gap-2 rounded-full"
                    size="lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleContinueShopping}
                    className="w-full gap-2 rounded-full"
                  >
                    <Package className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCartPage
