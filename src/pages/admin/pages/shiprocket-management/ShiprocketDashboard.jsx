import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Truck, 
  Package, 
  TrendingUp, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import { shiprocketApi } from '@/api/api'

const ShiprocketDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('shiprocket_token') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    shipments: [],
    analytics: {
      totalOrders: 0,
      shippedOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    },
    channels: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for demonstration - replace with actual API calls
  const mockOrders = [
    {
      id: 'SR123456',
      orderId: 'ORD001',
      status: 'shipped',
      channel: 'Website',
      customer: 'John Doe',
      amount: 1299,
      date: '2024-01-15',
      trackingId: 'TRK789012'
    },
    {
      id: 'SR123457',
      orderId: 'ORD002',
      status: 'pending',
      channel: 'Mobile App',
      customer: 'Jane Smith',
      amount: 899,
      date: '2024-01-14',
      trackingId: null
    },
    {
      id: 'SR123458',
      orderId: 'ORD003',
      status: 'delivered',
      channel: 'Website',
      customer: 'Bob Johnson',
      amount: 1599,
      date: '2024-01-13',
      trackingId: 'TRK789013'
    }
  ]

  const mockAnalytics = {
    totalOrders: 156,
    shippedOrders: 89,
    pendingOrders: 23,
    deliveredOrders: 44,
    totalRevenue: 125000,
    avgOrderValue: 801
  }

  useEffect(() => {
    if (token) {
      loadDashboardData()
    }
  }, [token])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate API calls - replace with actual Shiprocket API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDashboardData({
        orders: mockOrders,
        shipments: mockOrders.filter(order => order.trackingId),
        analytics: mockAnalytics,
        channels: ['Website', 'Mobile App', 'API']
      })
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredOrders = dashboardData.orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shiprocket Dashboard</h1>
            <p className="text-muted-foreground">Connect to Shiprocket to view your shipping dashboard</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Truck className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Not Connected to Shiprocket</h3>
              <p className="text-muted-foreground">Please connect to Shiprocket first to view the dashboard</p>
              <Button onClick={() => window.location.href = '/admin/shiprocket'}>
                Go to Shiprocket Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shiprocket Dashboard</h1>
            <p className="text-muted-foreground">Manage your shipments and track orders</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.analytics.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.analytics.shippedOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.analytics.totalOrders > 0 ? Math.round(((dashboardData.analytics.shippedOrders || 0) / dashboardData.analytics.totalOrders) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.analytics.deliveredOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.analytics.totalOrders > 0 ? Math.round(((dashboardData.analytics.deliveredOrders || 0) / dashboardData.analytics.totalOrders) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(dashboardData.analytics.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ₹{dashboardData.analytics.avgOrderValue || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Manage and track your orders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading orders...</span>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">₹{order.amount}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.trackingId && (
                            <Button variant="outline" size="sm">
                              Track
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>Track your shipments in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.shipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{shipment.trackingId}</p>
                        <p className="text-sm text-muted-foreground">Order: {shipment.orderId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Track Package
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Delivered</span>
                    <span>{dashboardData.analytics.deliveredOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipped</span>
                    <span>{dashboardData.analytics.shippedOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span>{dashboardData.analytics.pendingOrders || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(dashboardData.channels || []).map((channel) => (
                    <div key={channel} className="flex justify-between">
                      <span>{channel}</span>
                      <span>{Math.floor(Math.random() * 50) + 10} orders</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Channels</CardTitle>
              <CardDescription>Manage your Shiprocket integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {(dashboardData.channels || []).map((channel) => (
                  <div key={channel} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{channel}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connected and active
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShiprocketDashboard
