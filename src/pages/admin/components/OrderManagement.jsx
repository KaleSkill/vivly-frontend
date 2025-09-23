import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminApi, authApi } from '@/api/api';
import { toast } from 'sonner';
import { Search, Eye, Filter, RefreshCw, Package, CreditCard, Truck, MoreHorizontal, Settings } from 'lucide-react';
import { StatusUpdateModal } from './StatusUpdateModal';

export const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusSummary, setStatusSummary] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus })
      });

      const response = await adminApi.newOrders.getAllOrders(params.toString());
      console.log("order seeeee", response.data.data)
      
      if (response.data.success) {
        setOrders(response.data.data);
        setTotalPages(response.data.totalPages);
        setStatusSummary(response.data.statusSummary);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Get user details by ID
  const getUserDetails = async (id) => {
    try {
      const response = await authApi.getUserDetails(id);
      console.log("user details", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }
   

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  // Fetch user details when orders are loaded
  useEffect(() => {
    const fetchUserDetailsForOrders = async () => {
      if (orders.length > 0) {
        setLoadingUserDetails(true);
        const userDetailsMap = {};
        for (const order of orders) {
          if (order.user?._id && !userDetailsMap[order.user._id]) {
            const userData = await getUserDetails(order.user._id);
            if (userData) {
              userDetailsMap[order.user._id] = userData;
            }
          }
        }
        setUserDetails(userDetailsMap);
        setLoadingUserDetails(false);
      }
    };

    fetchUserDetailsForOrders();
  }, [orders]);






  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPage(1);
  };

  const handlePaymentStatusFilter = (paymentStatus) => {
    setFilters(prev => ({ ...prev, paymentStatus }));
    setPage(1);
  };

  const handleSearch = (search) => {
    setFilters(prev => ({ ...prev, search }));
    setPage(1);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'Ordered': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Return Requested': 'bg-orange-100 text-orange-800',
      'Returned': 'bg-purple-100 text-purple-800',
      'Refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadgeColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method) => {
    return method === 'COD' ? <Package className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />;
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/orders/${order.orderId}`);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage all customer orders and their status</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(statusSummary).map(([status, count]) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{status}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by order ID or customer name..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filters.status || "all"} onValueChange={(value) => handleStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Return Requested">Return Requested</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.paymentStatus || "all"} onValueChange={(value) => handlePaymentStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ordered At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {loadingUserDetails ? (
                              <span className="text-muted-foreground">Loading...</span>
                            ) : userDetails[order.user?._id]?.firstname 
                              ? `${userDetails[order.user._id].firstname}`
                              : userDetails[order.user?._id]?.firstname || 'Unknown Customer'
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {userDetails[order.user?._id]?.email || order.user?.email || 'No email'}
                          </p>
                          {order.shippingInfo?.phone && (
                            <p className="text-xs text-muted-foreground">📞 {order.shippingInfo.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{order.totalItems} items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <div>
                            <p className="text-sm font-medium">{order.paymentMethod}</p>
                            <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                            {order.transactionId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                TXN: {order.transactionId}
                              </p>
                            )}
                            {order.paymentProvider && (
                              <p className="text-xs text-muted-foreground">
                                Via: {order.paymentProvider}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Object.entries(order.overallStatus).map(([status, count]) => (
                            <Badge key={status} className={getStatusBadgeColor(status)}>
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Order Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showStatusModal && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setShowStatusModal(false)}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  );
};
