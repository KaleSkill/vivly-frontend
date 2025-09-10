import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';
import { Package, CreditCard, MapPin, Calendar, User, Phone, Mail, Settings, ArrowLeft } from 'lucide-react';
import { StatusUpdateModal } from '../components/StatusUpdateModal';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.newOrders.getOrderItemsByOrderId(orderId);
      
      if (response.data.success) {
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
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

  const handleUpdateStatus = () => {
    setShowStatusModal(true);
  };

  const handleStatusUpdate = () => {
    fetchOrderDetails(); // Refresh order details after status update
    setShowStatusModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-muted-foreground">Order not found</h2>
        <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/admin/orders')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Order Details - {orderDetails.orderId}
            </h1>
            <p className="text-muted-foreground">
              Customer: {orderDetails.products?.[0]?.user?.name || 'Unknown'} | 
              Status: <Badge className={getStatusBadgeColor(orderDetails.overallStatus)}>
                {orderDetails.overallStatus}
              </Badge>
            </p>
          </div>
        </div>
        <Button onClick={handleUpdateStatus} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manage Status
        </Button>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(orderDetails.orderedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="text-sm">
                  {orderDetails.products?.reduce((sum, product) => sum + product.quantity, 0)} items
                </span>
              </div>
              <Badge className={getStatusBadgeColor(orderDetails.overallStatus)}>
                {orderDetails.overallStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">{orderDetails.paymentMethod}</span>
              </div>
              <Badge className={getPaymentStatusBadgeColor(orderDetails.paymentStatus)}>
                {orderDetails.paymentStatus}
              </Badge>
              {orderDetails.transactionId && (
                <div className="text-xs text-muted-foreground">
                  TXN: {orderDetails.transactionId}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{orderDetails.products?.[0]?.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{orderDetails.products?.[0]?.user?.email || 'Unknown'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{orderDetails.shippingInfo.address}</p>
              <p className="text-sm text-muted-foreground">
                {orderDetails.shippingInfo.city}, {orderDetails.shippingInfo.state} - {orderDetails.shippingInfo.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{orderDetails.shippingInfo.country}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{orderDetails.shippingInfo.phone}</span>
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
            {orderDetails.products?.map((product, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={product.image?.secure_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Color: {product.color?.name} | Size: {product.size}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {product.quantity} | Price: ₹{product.amount?.price}
                    </p>
                    <p className="font-medium">
                      Total: ₹{product.amount?.totalAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadgeColor(product.itemsGroupedByStatus ? 
                      Object.keys(product.itemsGroupedByStatus)[0] : 'Ordered')}>
                      {product.itemsGroupedByStatus ? 
                        Object.keys(product.itemsGroupedByStatus)[0] : 'Ordered'}
                    </Badge>
                  </div>
                </div>

                {/* Item Status Details */}
                {product.itemsGroupedByStatus && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Status Details:</h4>
                    <div className="space-y-2">
                      {Object.entries(product.itemsGroupedByStatus).map(([status, items]) => (
                        <div key={status} className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(status)}>
                            {status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {items.length} item(s)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {orderDetails.products && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderDetails.products.map((product, productIndex) => (
                <div key={productIndex} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{product.name}</h4>
                  {product.itemsGroupedByStatus && Object.entries(product.itemsGroupedByStatus).map(([status, items]) => (
                    <div key={status} className="mb-3">
                      <Badge className={getStatusBadgeColor(status)}>
                        {status}
                      </Badge>
                      {items.map((item, itemIndex) => (
                        <div key={itemIndex} className="ml-4 mt-2">
                          {item.statusHistory?.map((history, historyIndex) => (
                            <div key={historyIndex} className="text-sm text-muted-foreground">
                              <span className="font-medium">{history.status}</span> - {history.note}
                              <span className="ml-2">
                                ({new Date(history.changedAt).toLocaleString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          order={orderDetails}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};
