import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  Package, 
  ArrowLeft,
  Eye,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

const MyOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await userApi.newOrders.getUserOrders()
      if (response.data.success) {
        setOrders(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
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
      month: 'short',
      day: 'numeric'
    })
  }

  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-product.jpg'
    if (typeof imageData === 'string') return imageData
    if (imageData.secure_url) return imageData.secure_url
    if (imageData.url) return imageData.url
    return '/placeholder-product.jpg'
  }

  const handleViewOrder = (orderId) => {
    navigate(`/user/orders/${orderId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => navigate('/products')}>
              <Package className="h-4 w-4 mr-2" />
              Start Shopping
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
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Badge variant="secondary" className="ml-auto">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Badge>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Order Image */}
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {order.items && order.items.length > 0 ? (
                    <img
                      src={getImageUrl(order.items[0].product?.image)}
                      alt={order.items[0].product?.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">#{order.orderId}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.orderedAt)}
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusBadgeColor(order.overallStatus)}`}>
                      {getStatusIcon(order.overallStatus)}
                      <span className="ml-1">{order.overallStatus}</span>
                    </Badge>
                  </div>
                  
                  {/* Items Info */}
                  <div className="mb-3">
                    <div className="text-sm font-medium">
                      {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                    </div>
                    {order.items && order.items.length > 1 && (
                      <div className="text-xs text-muted-foreground">
                        +{order.items.length - 1} more items
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom Row: Payment, Total, Actions */}
                  <div className="flex items-center justify-between">
                    {/* Payment Method */}
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{order.paymentMethod}</span>
                    </div>
                    
                    {/* Total and Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-sm">₹{order.totalAmount}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order.orderId)}
                        className="h-7 px-3"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="text-xs">View</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MyOrdersPage
