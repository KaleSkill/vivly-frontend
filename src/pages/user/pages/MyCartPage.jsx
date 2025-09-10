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
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Cart</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (cartData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Cart</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={handleContinueShopping}>
              <Package className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">My Cart</h1>
        <Badge variant="secondary" className="ml-auto">
          {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartData.map((item) => (
            <Card key={`${item.productId}-${item.selectedVariant.colorId}`} className="border-0 shadow-none">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image?.secure_url || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    
                    {/* Color and Size */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: item.selectedVariant.hexCode }}
                        />
                        <span className="text-xs">{item.selectedVariant.colorName}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.selectedVariant.size}
                      </Badge>
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
                          <div className="font-semibold text-sm">
                            ₹{(parseFloat(item.discountedPrice || item.price || 0) * item.selectedVariant.quantity).toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{parseFloat(item.discountedPrice || item.price || 0).toFixed(0)} each
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId, item.selectedVariant.colorId)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalCartItems} items)</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleContinueShopping}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MyCartPage
