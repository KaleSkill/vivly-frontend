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
  MapPin,
  CheckCircle,
  Clock,
  XCircle
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
        // console.log('Order data:', response.data.data)
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
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
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
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold">Order #{order.orderId}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Status:</span>
                <Badge className={getStatusBadgeColor(order.overallStatus)}>
                  {getStatusIcon(order.overallStatus)}
                  <span className="ml-1">{order.overallStatus}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                  <CreditCard className="h-3 w-3 mr-1" />
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.orderedAt)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking Number:</span>
                  <span className="font-mono text-sm">{order.trackingNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(item.product?.image)}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product?.name || 'Product'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Color: {item.color?.name || item.color} | Size: {item.size}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Model: {item.model}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Quantity: {item.quantity}</span>
                        <span className="font-semibold">₹{item.amount.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">
                    No items found in this order.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.shippingInfo.address}</p>
                <p>{order.shippingInfo.city}, {order.shippingInfo.state}</p>
                <p>{order.shippingInfo.country} - {order.shippingInfo.postalCode}</p>
                <p className="text-sm text-muted-foreground">
                  Phone: {order.shippingInfo.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              {order.paymentProvider && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{order.paymentProvider}</span>
                </div>
              )}
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{order.transactionId}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsPage
