import React, { useState, useEffect } from 'react'
import { adminApi } from '@/api/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'

const ReturnManagement = () => {
  const [returnRequests, setReturnRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)

  // Fetch return requests
  const fetchReturnRequests = async () => {
    try {
      setLoading(true)
      const response = await adminApi.newOrders.getAllOrders(`page=${currentPage}&limit=20`)
      
      if (response.data.success) {
        console.log('Admin Return Management - Raw orders data:', response.data.data)
        
        // Transform data to show return items
        const returnItems = []
        
        response.data.data.forEach(order => {
          console.log('Processing order:', order.orderId, 'Items:', order.items)
          
          // Check if order has any return-related items
          const returnItemsInOrder = order.items?.filter(item => 
            ['Return Requested', 'Returned', 'Refunded', 'Return Cancelled'].includes(item.orderStatus)
          )
          
          console.log('new order return items:', returnItemsInOrder)
          
          if (returnItemsInOrder && returnItemsInOrder.length > 0) {
            returnItemsInOrder.forEach(item => {
              returnItems.push({
                ...item,
                orderId: order.orderId,
                user: order.user,
                orderedAt: order.orderedAt,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingInfo: order.shippingInfo
              })
            })
          }
        })
        
        console.log('Final return items:', returnItems)
        setReturnRequests(returnItems)
        setTotalPages(Math.ceil(returnItems.length / 20))
      }
    } catch (error) {
      console.error('Error fetching return requests:', error)
      toast.error('Failed to fetch return requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturnRequests()
  }, [currentPage, statusFilter])

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedReturn || !newStatus) return

    try {
      const response = await adminApi.newOrders.updateOrderItemStatus({
        itemId: selectedReturn._id,
        quantity: selectedReturn.quantity,
        newStatus: newStatus,
        note: statusNote
      })

      if (response.data.success) {
        toast.success('Status updated successfully')
        setIsStatusDialogOpen(false)
        fetchReturnRequests()
        setNewStatus('')
        setStatusNote('')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Handle refund processing
  const handleRefundProcess = async () => {
    if (!selectedReturn || !refundAmount) return

    try {
      const response = await adminApi.newOrders.processRefund({
        itemId: selectedReturn._id,
        quantity: selectedReturn.quantity,
        refundAmount: parseFloat(refundAmount)
      })

      if (response.data.success) {
        toast.success('Refund processed successfully')
        setIsRefundDialogOpen(false)
        fetchReturnRequests()
        setRefundAmount('')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund')
    }
  }

  // Handle return cancellation
  const handleReturnCancel = async (item) => {
    try {
      const response = await adminApi.newOrders.processReturnCancel({
        itemId: item._id,
        quantity: item.quantity
      })

      if (response.data.success) {
        toast.success('Return request cancelled')
        fetchReturnRequests()
      }
    } catch (error) {
      console.error('Error cancelling return:', error)
      toast.error('Failed to cancel return request')
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Return Requested':
        return 'default'
      case 'Returned':
        return 'secondary'
      case 'Refunded':
        return 'outline'
      case 'Return Cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Filter return requests
  const filteredReturns = returnRequests.filter(item => {
    const matchesSearch = 
      item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.orderStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Return Management</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchReturnRequests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            console.log('Manual refresh triggered')
            fetchReturnRequests()
          }} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Debug Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnRequests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returnRequests.filter(item => item.orderStatus === 'Return Requested').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Returns</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returnRequests.filter(item => item.orderStatus === 'Returned').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returnRequests.filter(item => item.orderStatus === 'Refunded').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID, product name, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Return Requested">Return Requested</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Return Cancelled">Return Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-700">
            <p><strong>Total Orders Fetched:</strong> {returnRequests.length}</p>
            <p><strong>Current Page:</strong> {currentPage}</p>
            <p><strong>Status Filter:</strong> {statusFilter}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <Button 
              onClick={() => {
                console.log('Current return requests state:', returnRequests)
                console.log('API response test...')
                adminApi.newOrders.getAllOrders().then(res => {
                  console.log('Direct API test result:', res.data)
                }).catch(err => {
                  console.error('Direct API test error:', err)
                })
              }}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Test API Directly
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Return Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
          <CardDescription>
            Manage product returns and process refunds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No return requests found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.orderId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{item.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.product?.image?.secure_url || '/placeholder-product.jpg'} 
                              alt={item.product?.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium">{item.product?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.color?.name} • Size {item.size}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.amount?.totalAmount}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.orderStatus)}>
                            {item.orderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.returnRequestedAt || item.orderedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedReturn(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Return Request Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information about the return request
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedReturn && (
                                  <div className="space-y-6">
                                    {/* Order Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Order Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Order ID:</span>
                                            <span>{selectedReturn.orderId}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Order Date:</span>
                                            <span>{new Date(selectedReturn.orderedAt).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Payment:</span>
                                            <span>{selectedReturn.paymentMethod}</span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Customer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Name:</span>
                                            <span>{selectedReturn.user?.name || 'Unknown'}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Phone:</span>
                                            <span>{selectedReturn.shippingInfo?.phone || 'N/A'}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Address:</span>
                                            <span className="text-sm">
                                              {selectedReturn.shippingInfo?.address}, {selectedReturn.shippingInfo?.city}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Product Information */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Product Details</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center space-x-4">
                                          <img 
                                            src={selectedReturn.product?.image?.secure_url || '/placeholder-product.jpg'} 
                                            alt={selectedReturn.product?.name}
                                            className="w-20 h-20 rounded object-cover"
                                          />
                                          <div className="space-y-1">
                                            <div className="font-medium text-lg">{selectedReturn.product?.name}</div>
                                            <div className="text-muted-foreground">
                                              Color: {selectedReturn.color?.name} • Size: {selectedReturn.size}
                                            </div>
                                            <div className="text-muted-foreground">
                                              Quantity: {selectedReturn.quantity}
                                            </div>
                                            <div className="font-medium">
                                              Amount: ₹{selectedReturn.amount?.totalAmount}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Return Information */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Return Information</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">Return ID:</span>
                                          <span>{selectedReturn.returnId || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">Return Reason:</span>
                                          <span>{selectedReturn.returnRequestNote || 'No reason provided'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">Request Date:</span>
                                          <span>{new Date(selectedReturn.returnRequestedAt || selectedReturn.orderedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">Current Status:</span>
                                          <Badge variant={getStatusBadgeVariant(selectedReturn.orderStatus)}>
                                            {selectedReturn.orderStatus}
                                          </Badge>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Status History */}
                                    {selectedReturn.statusHistory && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Status History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            {selectedReturn.statusHistory.map((history, index) => (
                                              <div key={index} className="flex items-center space-x-3 p-2 bg-muted rounded">
                                                <Badge variant="outline">{history.status}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                  {history.note}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                  {new Date(history.changedAt).toLocaleString()}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                )}

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                                    Close
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {item.orderStatus === 'Return Requested' && (
                              <>
                                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedReturn(item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Update Return Status</DialogTitle>
                                      <DialogDescription>
                                        Update the status of this return request
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">New Status</label>
                                        <Select value={newStatus} onValueChange={setNewStatus}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Returned">Returned</SelectItem>
                                            <SelectItem value="Return Cancelled">Return Cancelled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-medium">Note</label>
                                        <Textarea
                                          placeholder="Add a note about this status change..."
                                          value={statusNote}
                                          onChange={(e) => setStatusNote(e.target.value)}
                                        />
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleStatusUpdate}>
                                        Update Status
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedReturn(item)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Process Refund</DialogTitle>
                                      <DialogDescription>
                                        Process refund for this returned item
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Refund Amount</label>
                                        <Input
                                          type="number"
                                          placeholder="Enter refund amount"
                                          value={refundAmount}
                                          onChange={(e) => setRefundAmount(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Original amount: ₹{item.amount?.totalAmount}
                                        </p>
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleRefundProcess}>
                                        Process Refund
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}

                            {item.orderStatus === 'Return Requested' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Return Request</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this return request? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleReturnCancel(item)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Cancel Return
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredReturns.length} of {returnRequests.length} return requests
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReturnManagement