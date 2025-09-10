import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Search,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Printer
} from 'lucide-react';
import { userApi } from '@/api/api';
import { toast } from 'sonner';

const ShipRocketDelivery = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [searchType, setSearchType] = useState('orderId'); // 'orderId' or 'awbCode'
  const [searchValue, setSearchValue] = useState('');
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await userApi.shiprocket.getAllShipments(1, 100);
      if (response.data.success) {
        setShipments(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setLoading(true);
    setTrackingData(null);

    try {
      let response;
      if (searchType === 'orderId') {
        response = await userApi.shiprocket.trackOrder(searchValue.trim());
      } else {
        response = await userApi.shiprocket.trackOrderByAWB(searchValue.trim());
      }

      if (response.data.success) {
        setTrackingData(response.data.data);
        toast.success('Tracking data retrieved successfully');
      } else {
        toast.error(response.data.error || 'Failed to track order');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const handleViewShipmentDetails = async (shipmentId) => {
    setLoading(true);
    try {
      const response = await userApi.shiprocket.getShipmentDetails(shipmentId);
      if (response.data.success) {
        setSelectedShipment(response.data.data);
        toast.success('Shipment details retrieved successfully');
      } else {
        toast.error(response.data.error || 'Failed to get shipment details');
      }
    } catch (error) {
      console.error('Error getting shipment details:', error);
      toast.error('Failed to get shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLabel = async (shipmentId) => {
    try {
      setLoading(true);
      const response = await userApi.shiprocket.generateLabel(shipmentId);
      if (response.data.success) {
        toast.success('Label generated successfully');
        if (response.data.data.label_url) {
          window.open(response.data.data.label_url, '_blank');
        }
      } else {
        toast.error(response.data.error || 'Failed to generate label');
      }
    } catch (error) {
      console.error('Error generating label:', error);
      toast.error('Failed to generate label');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      setLoading(true);
      const response = await userApi.shiprocket.printInvoice(orderId);
      if (response.data.success) {
        toast.success('Invoice generated successfully');
        if (response.data.data.invoice_url) {
          window.open(response.data.data.invoice_url, '_blank');
        }
      } else {
        toast.error(response.data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ShipRocket Delivery</h1>
          <p className="text-muted-foreground">Track and manage deliveries</p>
        </div>
        <Button onClick={fetchShipments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
          <TabsTrigger value="shipments">All Shipments</TabsTrigger>
          <TabsTrigger value="reports">Delivery Reports</TabsTrigger>
        </TabsList>

        {/* Order Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Track Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="searchType">Search Type</Label>
                    <select
                      id="searchType"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="orderId">Order ID</option>
                      <option value="awbCode">AWB Code</option>
                    </select>
                  </div>
                  <div className="flex-2">
                    <Label htmlFor="searchValue">Search Value</Label>
                    <Input
                      id="searchValue"
                      type="text"
                      placeholder={`Enter ${searchType === 'orderId' ? 'Order ID' : 'AWB Code'}`}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Track
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tracking Results */}
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                      <p className="text-lg font-semibold">{trackingData.order_id || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">AWB Code</Label>
                      <p className="text-lg font-semibold">{trackingData.awb_code || 'N/A'}</p>
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

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    {trackingData.shipment_id && (
                      <Button
                        onClick={() => handleGenerateLabel(trackingData.shipment_id)}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Label
                      </Button>
                    )}
                    {trackingData.order_id && (
                      <Button
                        onClick={() => handlePrintInvoice(trackingData.order_id)}
                        disabled={loading}
                        variant="outline"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Invoice
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* All Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>AWB Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.order_id}</TableCell>
                      <TableCell>{shipment.awb_code || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1">{shipment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.courier_name || 'N/A'}</TableCell>
                      <TableCell>₹{shipment.total_amount || 0}</TableCell>
                      <TableCell>
                        {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewShipmentDetails(shipment.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateLabel(shipment.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Delivery reports and analytics will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <pre className="bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(selectedShipment, null, 2)}
                </pre>
                <Button onClick={() => setSelectedShipment(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShipRocketDelivery;
