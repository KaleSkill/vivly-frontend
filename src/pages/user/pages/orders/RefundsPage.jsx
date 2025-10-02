import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  RefreshCw,
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  Truck,
  User,
  MapPin,
  Phone
} from 'lucide-react'

const RefundsPage = () => {
  const navigate = useNavigate()
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [returnRequests, setReturnRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [returnReason, setReturnReason] = useState('')
  const [returnNote, setReturnNote] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch user orders
      const ordersResponse = await userApi.newOrders.getUserOrders()
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data
        
        // Filter delivered orders
        const delivered = orders.filter(order => 
          order.overallStatus === 'Delivered' || 
          order.items.some(item => item.orderStatus === 'Delivered')
        )
        
        // Get return requests
        const returns = orders.filter(order => 
          order.items.some(item => 
            ['Return Requested', 'Returned', 'Refunded'].includes(item.orderStatus)
          )
        )
        
        setDeliveredOrders(delivered)
        setReturnRequests(returns)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRefund = (order) => {
    setSelectedOrder(order)
    setSelectedItems([])
    setReturnReason('')
    setReturnNote('')
    setIsRefundDialogOpen(true)
  }

  const handleItemSelection = (item, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, item])
    } else {
      setSelectedItems(prev => prev.filter(i => i._id !== item._id))
    }
  }

  const submitRefundRequest = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return')
      return
    }

    if (!returnReason) {
      toast.error('Please select a reason for return')
      return
    }

    try {
      const requests = selectedItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        note: `${returnReason}: ${returnNote}`
      }))

      // Submit return requests
      for (const request of requests) {
        await userApi.newOrders.returnOrderItem(
          request.itemId,
          request.quantity,
          request.note
        )
      }

      toast.success('Return request submitted successfully')
      setIsRefundDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error submitting return request:', error)
      toast.error('Failed to submit return request')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Return Requested':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'Returned':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case 'Refunded':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'Return Cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Return Requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Returned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Refunded':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Return Cancelled':
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

  const canRequestReturn = (order) => {
    const deliveredItems = order.items.filter(item => item.orderStatus === 'Delivered')
    return deliveredItems.length > 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Refunds & Returns</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold">Refunds & Returns</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Available for return</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returnRequests.filter(order => 
                order.items.some(item => item.orderStatus === 'Return Requested')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returnRequests.filter(order => 
                order.items.some(item => item.orderStatus === 'Refunded')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivered Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Delivered Orders - Request Return
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select items from delivered orders to request a return
          </p>
        </CardHeader>
        <CardContent>
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No delivered orders</h3>
              <p className="text-muted-foreground">
                You don't have any delivered orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveredOrders.map((order) => (
                <Card key={order._id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.orderId}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Delivered on {formatDate(order.orderedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {order.paymentMethod}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Delivered
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.filter(item => item.orderStatus === 'Delivered').map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <img 
                            src={item.product?.image?.secure_url || '/placeholder-product.jpg'} 
                            alt={item.product?.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {item.color?.name} • Size {item.size} • Qty {item.quantity}
                            </div>
                            <div className="text-sm font-medium">
                              ₹{item.amount?.totalAmount}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestRefund(order)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Request Return
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-600" />
            My Return Requests
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track the status of your return requests
          </p>
        </CardHeader>
        <CardContent>
          {returnRequests.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No return requests</h3>
              <p className="text-muted-foreground">
                You haven't requested any returns yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {returnRequests.map((order) => (
                <Card key={order._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.orderId}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ordered on {formatDate(order.orderedAt)}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(order.overallStatus)}>
                        {getStatusIcon(order.overallStatus)}
                        <span className="ml-1">{order.overallStatus}</span>
                      </Badge>
                    </div>

                    {/* Return Items */}
                    <div className="space-y-3">
                      {order.items.filter(item => 
                        ['Return Requested', 'Returned', 'Refunded', 'Return Cancelled'].includes(item.orderStatus)
                      ).map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <img 
                            src={item.product?.image?.secure_url || '/placeholder-product.jpg'} 
                            alt={item.product?.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {item.color?.name} • Size {item.size} • Qty {item.quantity}
                            </div>
                            <div className="text-sm font-medium">
                              ₹{item.amount?.totalAmount}
                            </div>
                            {item.returnRequestNote && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Reason: {item.returnRequestNote}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadgeColor(item.orderStatus)}>
                              {getStatusIcon(item.orderStatus)}
                              <span className="ml-1">{item.orderStatus}</span>
                            </Badge>
                            {item.returnId && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Return ID: {item.returnId}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Request Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Select items to return and provide a reason
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order #{selectedOrder.orderId}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Delivered: {formatDate(selectedOrder.orderedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Payment: {selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Select Items */}
              <div>
                <h4 className="font-medium mb-3">Select items to return:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.filter(item => item.orderStatus === 'Delivered').map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(i => i._id === item._id)}
                        onChange={(e) => handleItemSelection(item, e.target.checked)}
                        className="rounded"
                      />
                      <img 
                        src={item.product?.image?.secure_url || '/placeholder-product.jpg'} 
                        alt={item.product?.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.color?.name} • Size {item.size} • Qty {item.quantity}
                        </div>
                        <div className="text-sm font-medium">
                          ₹{item.amount?.totalAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="text-sm font-medium mb-2 block">Return Reason</label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Defective Product">Defective Product</SelectItem>
                    <SelectItem value="Wrong Size">Wrong Size</SelectItem>
                    <SelectItem value="Not as Described">Not as Described</SelectItem>
                    <SelectItem value="Changed Mind">Changed Mind</SelectItem>
                    <SelectItem value="Quality Issues">Quality Issues</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Note */}
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Note (Optional)</label>
                <Textarea
                  placeholder="Provide additional details about your return request..."
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRefundRequest} disabled={selectedItems.length === 0 || !returnReason}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RefundsPage