import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';
import { Package, AlertCircle, CheckCircle, Truck, X, Settings } from 'lucide-react';
import { ShippingModal } from './ShippingModal';

export const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    itemId: '',
    quantity: 1,
    newStatus: '',
    note: ''
  });
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [loadingTransitions, setLoadingTransitions] = useState(false);

  // Status progression logic based on backend OrderStatus model
  const statusProgression = {
    'Ordered': { 
      next: ['Cancelled', 'Shipped'], 
      color: 'bg-blue-100 text-blue-800',
      icon: '📦'
    },
    'Shipped': { 
      next: ['Delivered'], 
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🚚'
    },
    'Delivered': { 
      next: ['Return Requested'], 
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    'Cancelled': { 
      next: ['Refunded'], 
      color: 'bg-red-100 text-red-800',
      icon: '❌'
    },
    'Return Requested': { 
      next: ['Departed For Returning', 'Return Cancelled'], 
      color: 'bg-orange-100 text-orange-800',
      icon: '🔄'
    },
    'Departed For Returning': { 
      next: ['Returned', 'Return Cancelled'], 
      color: 'bg-purple-100 text-purple-800',
      icon: '🚛'
    },
    'Returned': { 
      next: ['Refunded'], 
      color: 'bg-purple-100 text-purple-800',
      icon: '📦'
    },
    'Return Cancelled': { 
      next: [], 
      color: 'bg-gray-100 text-gray-800',
      icon: '🚫'
    },
    'Refunded': { 
      next: [], 
      color: 'bg-gray-100 text-gray-800',
      icon: '💰'
    }
  };

  const statusOptions = Object.entries(statusProgression).map(([value, config]) => ({
    value,
    label: value,
    color: config.color,
    icon: config.icon,
    next: config.next
  }));

  useEffect(() => {
    if (order) {
      fetchOrderDetails();
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.newOrders.getOrderItemsByOrderId(order.orderId);
      
      if (response.data.success) {
        console.log('Order details fetched:', response.data.data);
        console.log('Products structure:', response.data.data.products);
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = async (itemId) => {
    console.log('Item selected:', itemId);
    const item = findItemById(itemId);
    console.log('Found item:', item);
    
    if (!item) {
      toast.error('Item not found. Please try again.');
      return;
    }
    
    setSelectedItem(item);
    setUpdateData(prev => ({
      ...prev,
      itemId: itemId,
      quantity: item?.quantity || 1,
      newStatus: '',
      note: ''
    }));

    // Fetch available transitions for this item
    await fetchAvailableTransitions(itemId);
  };

  const fetchAvailableTransitions = async (itemId) => {
    try {
      setLoadingTransitions(true);
      console.log('Fetching transitions for item:', itemId);
      const response = await adminApi.newOrders.getAvailableStatusTransitions(itemId);
      console.log('Transitions response:', response.data);
      
      if (response.data.success) {
        setAvailableTransitions(response.data.data.availableTransitions);
        console.log('Available transitions set:', response.data.data.availableTransitions);
      }
    } catch (error) {
      console.error('Error fetching available transitions:', error);
      toast.error('Failed to fetch available status transitions');
      setAvailableTransitions([]);
    } finally {
      setLoadingTransitions(false);
    }
  };

  const findItemById = (itemId) => {
    if (!orderDetails?.products) return null;
    
    for (const product of orderDetails.products) {
      if (product.itemsGroupedByStatus) {
        for (const [status, items] of Object.entries(product.itemsGroupedByStatus)) {
          const item = items.find(i => i._id === itemId);
          if (item) {
            return { 
              ...item, 
              productName: product.name,
              productImage: product.image,
              productColor: product.color,
              productSize: product.size,
              currentStatus: status 
            };
          }
        }
      }
    }
    return null;
  };

  const handleStatusUpdate = async () => {
    if (!updateData.itemId || !updateData.newStatus || !updateData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setUpdating(true);
      const response = await adminApi.newOrders.updateOrderItemStatus(updateData.itemId, {
        status: updateData.newStatus,
        quantity: parseInt(updateData.quantity),
        note: updateData.note
      });

      if (response.data.success) {
        toast.success('Order status updated successfully');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!updateData.itemId || !updateData.quantity) {
      toast.error('Please select item and quantity for refund');
      return;
    }

    try {
      setUpdating(true);
      const refundAmount = selectedItem?.amount?.totalAmount || 0;
      
      const response = await adminApi.newOrders.processRefund({
        itemId: updateData.itemId,
        quantity: parseInt(updateData.quantity),
        refundAmount: refundAmount
      });

      if (response.data.success) {
        toast.success('Refund processed successfully');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  const handleReturnCancel = async () => {
    if (!updateData.itemId || !updateData.quantity) {
      toast.error('Please select item and quantity to cancel return');
      return;
    }

    try {
      setUpdating(true);
      const response = await adminApi.newOrders.processReturnCancel({
        itemId: updateData.itemId,
        quantity: parseInt(updateData.quantity)
      });

      if (response.data.success) {
        toast.success('Return request cancelled successfully');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error cancelling return:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel return');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getValidNextStatuses = (currentStatus) => {
    const currentStatusConfig = statusProgression[currentStatus];
    if (!currentStatusConfig) return [];
    return currentStatusConfig.next;
  };

  const isStatusValid = (currentStatus, targetStatus) => {
    const validNextStatuses = getValidNextStatuses(currentStatus);
    return validNextStatuses.includes(targetStatus);
  };

  const getStatusIcon = (status) => {
    const config = statusProgression[status];
    return config?.icon || '📦';
  };

  const formatPrice = (amount) => {
    if (typeof amount === 'number') return amount.toFixed(2);
    if (amount?.totalAmount) return amount.totalAmount.toFixed(2);
    if (amount?.price) return amount.price.toFixed(2);
    return '0.00';
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-product.jpg';
    if (typeof imageData === 'string') return imageData;
    if (imageData.secure_url) return imageData.secure_url;
    if (imageData.url) return imageData.url;
    return '/placeholder-product.jpg';
  };

  const hasOrderedItems = () => {
    if (!orderDetails?.products) return false;
    
    for (const product of orderDetails.products) {
      if (product.itemsGroupedByStatus && product.itemsGroupedByStatus['Ordered']) {
        return true;
      }
    }
    return false;
  };

  const handleShippingUpdate = () => {
    setShowShippingModal(false);
    onUpdate(); // Refresh order details
  };

  if (!order) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manual Status Update - {order.orderId}
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                Customer: {order.user?.name} | Payment: {order.paymentMethod} ({order.paymentStatus})
              </div>
              <div className="text-xs text-blue-600 mt-1">
                💡 Use this tool to manually update order item statuses with proper validation
              </div>
            </div>
            <div className="flex gap-2">
              {hasOrderedItems() && (
                <Button
                  onClick={() => setShowShippingModal(true)}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Truck className="h-4 w-4" />
                  Ship via Shiprocket
                </Button>
              )}
              <Button
                className="flex items-center gap-2"
                variant="default"
              >
                <Settings className="h-4 w-4" />
                Manual Update
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading order details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Items Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Item to Update</CardTitle>
                <p className="text-sm text-muted-foreground">Click on any item below to update its status</p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>Debug Info:</strong> Selected Item ID: {updateData.itemId || 'None'} | 
                  Products Count: {orderDetails?.products?.length || 0}
                  <br />
                  <button 
                    onClick={() => {
                      console.log('Test button clicked');
                      console.log('Order details:', orderDetails);
                      if (orderDetails?.products?.[0]?.itemsGroupedByStatus) {
                        const firstStatus = Object.keys(orderDetails.products[0].itemsGroupedByStatus)[0];
                        const firstItem = orderDetails.products[0].itemsGroupedByStatus[firstStatus]?.[0];
                        if (firstItem) {
                          console.log('Testing with first item:', firstItem);
                          handleItemSelect(firstItem._id);
                        }
                      }
                    }}
                    className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Test Select First Item
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails?.products?.map((product, productIndex) => (
                    <div key={productIndex} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Color: {product.color?.name || 'N/A'} | Size: {product.size || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {product.itemsGroupedByStatus && Object.entries(product.itemsGroupedByStatus).map(([status, items]) => (
                          <div key={status} className="space-y-2">
                            <Badge className={getStatusBadgeColor(status)}>
                              {getStatusIcon(status)} {status}
                            </Badge>
                            <div className="space-y-2">
                              {items.map((item, itemIndex) => {
                                console.log('Rendering item:', item);
                                return (
                                <div 
                                  key={itemIndex} 
                                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/50 ${
                                    updateData.itemId === item._id ? 'border-primary bg-primary/5' : 'border-border'
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Item clicked:', item);
                                    console.log('Item ID:', item._id);
                                    console.log('Item keys:', Object.keys(item));
                                    handleItemSelect(item._id);
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="item"
                                    value={item._id}
                                    checked={updateData.itemId === item._id}
                                    onChange={() => handleItemSelect(item._id)}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium">Qty: {item.quantity}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ₹{formatPrice(item.amount)}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Size: {item.size} | Color: {item.color?.name || 'N/A'}
                                    </p>
                                    {item.statusHistory && item.statusHistory.length > 0 && (
                                      <p className="text-xs text-blue-600">
                                        Last updated: {new Date(item.statusHistory[item.statusHistory.length - 1]?.changedAt || item.statusHistory[item.statusHistory.length - 1]?.timestamp).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {(!orderDetails?.products || orderDetails.products.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* No Item Selected Message */}
            {!selectedItem && (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Item Selected</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Click on any item above to select it and update its status. 
                    You can see the product image, size, color, quantity, and current status for each item.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status Update Form */}
            {selectedItem && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Update Status for Selected Item
                  </CardTitle>
                  <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                    <img
                      src={getImageUrl(selectedItem.productImage)}
                      alt={selectedItem.productName}
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedItem.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Color: {selectedItem.productColor?.name || selectedItem.color?.name || 'N/A'} | 
                        Size: {selectedItem.productSize || selectedItem.size || 'N/A'} | 
                        Qty: {selectedItem.quantity}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ₹{formatPrice(selectedItem.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current Status:</p>
                      <Badge className={getStatusBadgeColor(selectedItem.currentStatus)}>
                        {getStatusIcon(selectedItem.currentStatus)} {selectedItem.currentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Progression Visual */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Available Next Statuses:</h4>
                    {loadingTransitions ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Loading available transitions...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableTransitions.map((transition) => {
                          const config = statusProgression[transition.value];
                          return (
                            <Button
                              key={transition.value}
                              variant="outline"
                              size="sm"
                              onClick={() => setUpdateData(prev => ({ ...prev, newStatus: transition.value }))}
                              className={`${config?.color || 'bg-gray-100 text-gray-800'} hover:opacity-80`}
                              title={transition.description}
                            >
                              <span className="mr-1">{config?.icon || '📦'}</span>
                              {transition.label}
                            </Button>
                          );
                        })}
                        {availableTransitions.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">
                            No further status changes available (Final status reached)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedItem.quantity}
                        value={updateData.quantity}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newStatus">New Status</Label>
                      <Select value={updateData.newStatus} onValueChange={(value) => setUpdateData(prev => ({ ...prev, newStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTransitions.map((transition) => {
                            const config = statusProgression[transition.value];
                            return (
                              <SelectItem key={transition.value} value={transition.value}>
                                <div className="flex items-center gap-2">
                                  <span>{config?.icon || '📦'}</span>
                                  <span>{transition.label}</span>
                                  {transition.description && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      - {transition.description}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                          {availableTransitions.length === 0 && (
                            <SelectItem value="" disabled>
                              <div className="text-muted-foreground italic">
                                No further status changes available
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Add a note for this status change..."
                      value={updateData.note}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, note: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updating || !updateData.newStatus}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Update Status
                    </Button>
                    
                    {updateData.newStatus === 'Refunded' && (
                      <Button
                        variant="outline"
                        onClick={handleRefund}
                        disabled={updating}
                      >
                        Process Refund
                      </Button>
                    )}
                    
                    {selectedItem.currentStatus === 'Return Requested' && (
                      <Button
                        variant="outline"
                        onClick={handleReturnCancel}
                        disabled={updating}
                      >
                        Cancel Return
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Progression Timeline */}
            {selectedItem && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Progression Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Current Status:</span>
                      <Badge className={getStatusBadgeColor(selectedItem.currentStatus)}>
                        {getStatusIcon(selectedItem.currentStatus)} {selectedItem.currentStatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Possible Next Steps:</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableTransitions.map((transition, index) => {
                          const config = statusProgression[transition.value];
                          return (
                            <div key={transition.value} className="flex items-center gap-2">
                              {index > 0 && <span className="text-muted-foreground">→</span>}
                              <Badge variant="outline" className={config?.color || 'bg-gray-100 text-gray-800'}>
                                {config?.icon || '📦'} {transition.label}
                              </Badge>
                            </div>
                          );
                        })}
                        {availableTransitions.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">
                            Final status reached - no further changes possible
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Product:</strong> {selectedItem.productName}</p>
                          <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
                          <p><strong>Size:</strong> {selectedItem.size}</p>
                        </div>
                        <div>
                          {selectedItem.amount && (
                            <p><strong>Amount:</strong> ₹{selectedItem.amount.totalAmount}</p>
                          )}
                          <p><strong>Color:</strong> {selectedItem.color?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Cancel
          </Button>
        </div>

        {/* Shipping Modal */}
        {showShippingModal && (
          <ShippingModal
            order={order}
            onClose={() => setShowShippingModal(false)}
            onUpdate={handleShippingUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
