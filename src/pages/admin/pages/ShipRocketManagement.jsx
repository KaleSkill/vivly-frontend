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
  Plus,
  FileText,
  Printer,
  Eye
} from 'lucide-react';
import { userApi } from '@/api/api';
import { toast } from 'sonner';

const ShipRocketManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipments, setSelectedShipments] = useState([]);

  // Overview stats
  const [stats, setStats] = useState({
    totalShipments: 0,
    pendingPickups: 0,
    inTransit: 0,
    delivered: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch shipments
      const shipmentsResponse = await userApi.shiprocket.getAllShipments(1, 50);
      if (shipmentsResponse.data.success) {
        setShipments(shipmentsResponse.data.data.data || []);
        calculateStats(shipmentsResponse.data.data.data || []);
      }

      // You can add more API calls here for orders, couriers, etc.
    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast.error('Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (shipmentsData) => {
    const stats = {
      totalShipments: shipmentsData.length,
      pendingPickups: shipmentsData.filter(s => s.status === 'pending').length,
      inTransit: shipmentsData.filter(s => s.status === 'in_transit').length,
      delivered: shipmentsData.filter(s => s.status === 'delivered').length,
      totalRevenue: shipmentsData.reduce((sum, s) => sum + (s.total_amount || 0), 0)
    };
    setStats(stats);
  };

  const handleCreateOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await userApi.shiprocket.createAdhocOrder(orderData);
      if (response.data.success) {
        toast.success('Order created successfully');
        fetchOverviewData();
      } else {
        toast.error(response.data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAWB = async (shipmentId, courierId) => {
    try {
      setLoading(true);
      const response = await userApi.shiprocket.assignAWB(shipmentId, courierId);
      if (response.data.success) {
        toast.success('AWB assigned successfully');
        fetchOverviewData();
      } else {
        toast.error(response.data.error || 'Failed to assign AWB');
      }
    } catch (error) {
      console.error('Error assigning AWB:', error);
      toast.error('Failed to assign AWB');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePickup = async (shipmentId) => {
    try {
      setLoading(true);
      const response = await userApi.shiprocket.generatePickup(shipmentId);
      if (response.data.success) {
        toast.success('Pickup generated successfully');
        fetchOverviewData();
      } else {
        toast.error(response.data.error || 'Failed to generate pickup');
      }
    } catch (error) {
      console.error('Error generating pickup:', error);
      toast.error('Failed to generate pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateManifest = async () => {
    if (selectedShipments.length === 0) {
      toast.error('Please select shipments to generate manifest');
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.shiprocket.generateManifest(selectedShipments);
      if (response.data.success) {
        toast.success('Manifest generated successfully');
        setSelectedShipments([]);
        fetchOverviewData();
      } else {
        toast.error(response.data.error || 'Failed to generate manifest');
      }
    } catch (error) {
      console.error('Error generating manifest:', error);
      toast.error('Failed to generate manifest');
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
        // Open label PDF in new tab
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
        // Open invoice PDF in new tab
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

  const filteredShipments = shipments.filter(shipment =>
    shipment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.awb_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ShipRocket Management</h1>
          <p className="text-muted-foreground">Manage deliveries, shipments, and logistics</p>
        </div>
        <Button onClick={fetchOverviewData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                <p className="text-2xl font-bold">{stats.totalShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Pickups</p>
                <p className="text-2xl font-bold">{stats.pendingPickups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="couriers">Couriers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Shipments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredShipments.slice(0, 5).map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{shipment.order_id}</p>
                          <p className="text-sm text-muted-foreground">{shipment.awb_code}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('orders')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Order
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleGenerateManifest}
                  disabled={selectedShipments.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Manifest ({selectedShipments.length})
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('shipments')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Shipments
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button onClick={handleGenerateManifest} disabled={selectedShipments.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Manifest ({selectedShipments.length})
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedShipments.length === filteredShipments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedShipments(filteredShipments.map(s => s.id));
                          } else {
                            setSelectedShipments([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>AWB Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedShipments.includes(shipment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShipments([...selectedShipments, shipment.id]);
                            } else {
                              setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{shipment.order_id}</TableCell>
                      <TableCell>{shipment.awb_code || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.courier_name || 'N/A'}</TableCell>
                      <TableCell>₹{shipment.total_amount || 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateLabel(shipment.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGeneratePickup(shipment.id)}
                          >
                            <Truck className="h-4 w-4" />
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

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Couriers Tab */}
        <TabsContent value="couriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courier Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Courier management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports and analytics features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShipRocketManagement;
