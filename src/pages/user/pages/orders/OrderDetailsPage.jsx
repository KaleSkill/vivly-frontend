import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

const OrderDetailsPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await userApi.newOrders.getOrderByOrderId(orderId)
      if (response.data.success) {
        setOrder(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-product.jpg'
    if (typeof imageData === 'string') return imageData
    if (imageData.secure_url) return imageData.secure_url
    if (imageData.url) return imageData.url
    return '/placeholder-product.jpg'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/user/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Badge className={`ml-auto ${getStatusBadgeColor(order.overallStatus)}`}>
          {getStatusIcon(order.overallStatus)}
          <span className="ml-1">{order.overallStatus}</span>
        </Badge>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.orderId}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Order Information</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ordered on {formatDate(order.orderedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                  {order.transactionId && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Txn: {order.transactionId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Order Total</h4>
              <div className="text-2xl font-bold">₹{order.totalAmount}</div>
              {order.paymentAmount && (
                <div className="text-sm text-muted-foreground">
                  Payment: ₹{order.paymentAmount}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{order.shippingAddress.fullName}</div>
              <div className="text-muted-foreground">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </div>
              <div className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </div>
              <div className="text-muted-foreground">
                {order.shippingAddress.country}
              </div>
              {order.shippingAddress.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {order.shippingAddress.phone}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Method:</span>
              <span className="text-sm">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
              </span>
            </div>
            {order.paymentProvider && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Provider:</span>
                <span className="text-sm capitalize">{order.paymentProvider}</span>
              </div>
            )}
            {order.transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction ID:</span>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {order.transactionId}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Status:</span>
              <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-lg">{item.product?.name || 'Product'}</h4>
                  <div className="text-sm text-muted-foreground mb-2">
                    Color: {item.color?.name || 'N/A'} • Size: {item.size || 'N/A'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Qty: {item.quantity}</span>
                      <span className="text-sm text-muted-foreground">
                        ₹{item.amount?.price || item.price} each
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ₹{(item.amount?.totalAmount || (item.price * item.quantity)).toFixed(2)}
                      </div>
                      {item.amount?.shippingCharges > 0 && (
                        <div className="text-xs text-muted-foreground">
                          + ₹{item.amount.shippingCharges} shipping
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Order Placed</div>
                <div className="text-sm text-muted-foreground">{formatDate(order.orderedAt)}</div>
              </div>
            </div>
            
            {order.overallStatus === 'PROCESSING' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium">Processing</div>
                  <div className="text-sm text-muted-foreground">Your order is being prepared</div>
                </div>
              </div>
            )}
            
            {order.overallStatus === 'SHIPPED' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Shipped</div>
                  <div className="text-sm text-muted-foreground">Your order is on the way</div>
                </div>
              </div>
            )}
            
            {order.overallStatus === 'DELIVERED' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Delivered</div>
                  <div className="text-sm text-muted-foreground">Your order has been delivered</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetailsPage
