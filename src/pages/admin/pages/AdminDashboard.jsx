import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const AdminDashboard = () => {
  // Mock data - replace with real API calls
  const stats = {
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 342,
    totalRevenue: 45678,
    userGrowth: 12.5,
    orderGrowth: -2.3,
    revenueGrowth: 8.7,
    conversionRate: 3.2
  }

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 299.99, status: 'completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 149.50, status: 'pending', date: '2024-01-15' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 89.99, status: 'processing', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 199.99, status: 'completed', date: '2024-01-14' },
  ]

  const topProducts = [
    { name: 'Premium Headphones', sales: 45, revenue: 13499.55 },
    { name: 'Wireless Mouse', sales: 38, revenue: 7599.62 },
    { name: 'Mechanical Keyboard', sales: 32, revenue: 9599.68 },
    { name: 'Gaming Monitor', sales: 28, revenue: 13999.72 },
  ]

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {change > 0 ? (
              <>
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{change}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                <span className="text-red-600">{change}%</span>
              </>
            )}
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          change={5.2}
          icon={Package}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change={stats.orderGrowth}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium">${order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best selling products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress value={(product.sales / 50) * 100} className="flex-1 mr-2" />
                    <p className="text-sm font-medium">${product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Add Product
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <ShoppingCart className="h-6 w-6 mb-2" />
              View Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Eye className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
