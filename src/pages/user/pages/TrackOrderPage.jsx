import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { userApi } from '@/api/api';
import { toast } from 'sonner';
import NavComp from '@/components/origin/NavComp';
import Footer from '@/pages/home/components/Footer';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await userApi.shiprocket.trackOrder(orderId.trim());
      
      if (response.data.success) {
        setTrackingData(response.data.data);
        toast.success('Order tracking data retrieved successfully');
      } else {
        setError(response.data.error || 'Failed to track order');
        toast.error(response.data.error || 'Failed to track order');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      const errorMessage = error.response?.data?.error || 'Failed to track order';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order ID to track the status of your shipment
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="Enter your order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                      <p className="text-lg font-semibold">{trackingData.order_id || orderId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(trackingData.status)}>
                          {getStatusIcon(trackingData.status)}
                          <span className="ml-1">{trackingData.status || 'Unknown'}</span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tracking Number</Label>
                      <p className="text-lg font-semibold">{trackingData.tracking_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Courier</Label>
                      <p className="text-lg font-semibold">{trackingData.courier_name || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              {trackingData.tracking_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Tracking Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trackingData.tracking_data.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            {index < trackingData.tracking_data.length - 1 && (
                              <div className="w-0.5 h-8 bg-border mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(event.status)}>
                                {getStatusIcon(event.status)}
                                <span className="ml-1">{event.status}</span>
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {event.time ? new Date(event.time).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.location || event.remark || 'No additional details'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delivery Address */}
              {trackingData.delivery_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{trackingData.delivery_address.name}</p>
                      <p className="text-muted-foreground">
                        {trackingData.delivery_address.address1}
                        {trackingData.delivery_address.address2 && `, ${trackingData.delivery_address.address2}`}
                      </p>
                      <p className="text-muted-foreground">
                        {trackingData.delivery_address.city}, {trackingData.delivery_address.state} - {trackingData.delivery_address.pincode}
                      </p>
                      <p className="text-muted-foreground">
                        Phone: {trackingData.delivery_address.phone}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Estimated Delivery</Label>
                      <p className="text-lg font-semibold">
                        {trackingData.estimated_delivery_date 
                          ? new Date(trackingData.estimated_delivery_date).toLocaleDateString()
                          : 'Not available'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="text-lg font-semibold">
                        {trackingData.updated_at 
                          ? new Date(trackingData.updated_at).toLocaleString()
                          : 'Not available'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No Results */}
          {!trackingData && !loading && !error && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No tracking data</h3>
                <p className="text-muted-foreground">
                  Enter an order ID above to track your shipment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;