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
import { Package, AlertCircle, CheckCircle } from 'lucide-react';

export const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateData, setUpdateData] = useState({
    itemId: '',
    quantity: 1,
    newStatus: '',
    note: ''
  });

  const statusOptions = [
    { value: 'Ordered', label: 'Ordered', color: 'bg-blue-100 text-blue-800' },
    { value: 'Shipped', label: 'Shipped', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'Return Requested', label: 'Return Requested', color: 'bg-orange-100 text-orange-800' },
    { value: 'Departed For Returning', label: 'Departed For Returning', color: 'bg-purple-100 text-purple-800' },
    { value: 'Returned', label: 'Returned', color: 'bg-purple-100 text-purple-800' },
    { value: 'Return Cancelled', label: 'Return Cancelled', color: 'bg-gray-100 text-gray-800' },
    { value: 'Refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

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
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId) => {
    const item = findItemById(itemId);
    setSelectedItem(item);
    setUpdateData(prev => ({
      ...prev,
      itemId: itemId,
      quantity: item?.quantity || 1,
      newStatus: '',
      note: ''
    }));
  };

  const findItemById = (itemId) => {
    if (!orderDetails?.products) return null;
    
    for (const product of orderDetails.products) {
      if (product.itemsGroupedByStatus) {
        for (const [status, items] of Object.entries(product.itemsGroupedByStatus)) {
          const item = items.find(i => i._id === itemId);
          if (item) {
            return { ...item, productName: product.name, currentStatus: status };
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
      const response = await adminApi.newOrders.updateOrderItemStatus({
        itemId: updateData.itemId,
        quantity: parseInt(updateData.quantity),
        newStatus: updateData.newStatus,
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

  if (!order) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Order Status - {order.orderId}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Customer: {order.user?.name} | Payment: {order.paymentMethod} ({order.paymentStatus})
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails?.products?.map((product, productIndex) => (
                    <div key={productIndex} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{product.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.itemsGroupedByStatus && Object.entries(product.itemsGroupedByStatus).map(([status, items]) => (
                          <div key={status} className="space-y-2">
                            <Badge className={getStatusBadgeColor(status)}>
                              {status}
                            </Badge>
                            {items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                                   onClick={() => handleItemSelect(item._id)}>
                                <input
                                  type="radio"
                                  name="item"
                                  value={item._id}
                                  checked={updateData.itemId === item._id}
                                  onChange={() => handleItemSelect(item._id)}
                                />
                                <div className="flex-1">
                                  <p className="text-sm">Qty: {item.quantity}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Size: {item.size}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Update Form */}
            {selectedItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Update Status for {selectedItem.productName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
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

            {/* Current Status Info */}
            {selectedItem && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Status Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Product:</strong> {selectedItem.productName}</p>
                    <p><strong>Current Status:</strong> 
                      <Badge className={`ml-2 ${getStatusBadgeColor(selectedItem.currentStatus)}`}>
                        {selectedItem.currentStatus}
                      </Badge>
                    </p>
                    <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
                    <p><strong>Size:</strong> {selectedItem.size}</p>
                    {selectedItem.amount && (
                      <p><strong>Amount:</strong> ₹{selectedItem.amount.totalAmount}</p>
                    )}
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
      </DialogContent>
    </Dialog>
  );
};
