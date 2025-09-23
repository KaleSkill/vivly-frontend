import React, { useState, useEffect } from 'react'
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
  ArrowDownRight,
  RefreshCw,
  Percent,
  IndianRupee
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/api/api'
import { DefaultMultipleBarChart } from '@/components/ui/default-multiple-bar-chart'
import { RoundedPieChart } from '@/components/ui/rounded-pie-chart'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, regular: 0, recent: 0 },
    products: { total: 0, active: 0, inactive: 0, recent: 0 },
    sales: { total: 0, active: 0, scheduled: 0, totalProducts: 0 },
    orders: { total: 0, pending: 0, completed: 0, processing: 0 },
    payments: { total: 0, success: 0, failed: 0, pending: 0 }
  })
  const [chartData, setChartData] = useState({
    userGrowth: [],
    productStats: [],
    salesData: [],
    orderStats: []
  })

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch overview stats and detailed chart data in parallel
      const [overviewStats, userStats, productStats, salesStats, orderStats] = await Promise.all([
        adminApi.stats.getOverviewStats(),
        adminApi.stats.getUserStats(),
        adminApi.stats.getProductStats(),
        adminApi.stats.getSalesStats(),
        adminApi.stats.getOrderStats()
      ])

      const statsData = overviewStats.data.data

      // Set all stats from the overview API
      setStats({
        users: statsData.users,
        products: statsData.products,
        sales: statsData.sales,
        orders: statsData.orders,
        payments: statsData.payments,
        revenue: statsData.revenue
      })

      // Generate chart data with real API data
      generateChartData(statsData, {
        userStats: userStats.data.data,
        productStats: productStats.data.data,
        salesStats: salesStats.data.data,
        orderStats: orderStats.data.data
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Generate chart data
  const generateChartData = (statsData, detailedStats) => {
    // User growth chart data from real API data
    let userGrowthData = []
    if (detailedStats.userStats?.monthlyData && detailedStats.userStats.monthlyData.length > 0) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      userGrowthData = detailedStats.userStats.monthlyData.map((item, index) => ({
        month: monthNames[item._id.month - 1] || `Month ${item._id.month}`,
        users: item.count,
        growth: index > 0 ? ((item.count - detailedStats.userStats.monthlyData[index - 1].count) / detailedStats.userStats.monthlyData[index - 1].count * 100).toFixed(1) : 0
      }))
    } else {
      // Fallback to mock data if no real data available
      userGrowthData = [
        { month: "Jan", users: Math.floor(statsData.users.total * 0.8), growth: 5.2 },
        { month: "Feb", users: Math.floor(statsData.users.total * 0.85), growth: 8.1 },
        { month: "Mar", users: Math.floor(statsData.users.total * 0.9), growth: 12.3 },
        { month: "Apr", users: Math.floor(statsData.users.total * 0.95), growth: 15.7 },
        { month: "May", users: statsData.users.total, growth: 18.2 },
        { month: "Jun", users: Math.floor(statsData.users.total * 1.05), growth: 22.1 }
      ]
    }

    // Product category distribution from real API data
    let productCategoryData = []
    if (detailedStats.productStats?.categoryStats && detailedStats.productStats.categoryStats.length > 0) {
      const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00", "#ff00ff", "#00ffff"]
      productCategoryData = detailedStats.productStats.categoryStats.map((cat, index) => ({
        category: cat._id,
        count: cat.count,
        fill: colors[index % colors.length]
      }))
    } else {
      // Fallback to mock data if no real data available
      productCategoryData = [
        { category: "Electronics", count: Math.floor(statsData.products.total * 0.4), fill: "#8884d8" },
        { category: "Clothing", count: Math.floor(statsData.products.total * 0.3), fill: "#82ca9d" },
        { category: "Accessories", count: Math.floor(statsData.products.total * 0.2), fill: "#ffc658" },
        { category: "Home", count: Math.floor(statsData.products.total * 0.1), fill: "#ff7300" }
      ]
    }

    // Sales performance data from real API data
    let salesPerformanceData = []
    if (detailedStats.salesStats?.monthlyData && detailedStats.salesStats.monthlyData.length > 0) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      salesPerformanceData = detailedStats.salesStats.monthlyData.map(item => ({
        month: monthNames[item._id.month - 1] || `Month ${item._id.month}`,
        sales: item.count,
        revenue: item.totalProducts * 1000 // Mock revenue calculation
      }))
    } else {
      // Fallback to mock data
      salesPerformanceData = [
        { month: "Jan", sales: Math.floor(statsData.sales.total * 0.7), revenue: 15000 },
        { month: "Feb", sales: Math.floor(statsData.sales.total * 0.8), revenue: 18000 },
        { month: "Mar", sales: Math.floor(statsData.sales.total * 0.9), revenue: 22000 },
        { month: "Apr", sales: statsData.sales.total, revenue: 25000 },
        { month: "May", sales: Math.floor(statsData.sales.total * 1.1), revenue: 28000 },
        { month: "Jun", sales: Math.floor(statsData.sales.total * 1.2), revenue: 32000 }
      ]
    }

    // Order status distribution from real data
    const orderStatusData = [
      { status: "Completed", count: statsData.orders.completed, fill: "#82ca9d" },
      { status: "Pending", count: statsData.orders.pending, fill: "#ffc658" },
      { status: "Processing", count: statsData.orders.processing, fill: "#8884d8" }
    ]

    setChartData({
      userGrowth: userGrowthData,
      productStats: productCategoryData,
      salesData: salesPerformanceData,
      orderStats: orderStatusData
    })
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, change, icon: Icon, color = "blue", subtitle }) => (
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
          {subtitle && (
            <div className="text-xs text-muted-foreground mb-1">{subtitle}</div>
          )}
          {change !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground">
              {change > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{change}%</span>
                </>
              ) : change < 0 ? (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{change}%</span>
                </>
              ) : (
                <span className="text-gray-600">No change</span>
              )}
              <span className="ml-1">from last month</span>
            </div>
          )}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
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
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          subtitle={`${stats.users.admins} admins, ${stats.users.regular} users`}
          change={12.5}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.products.total}
          subtitle={`${stats.products.active} active, ${stats.products.inactive} inactive`}
          change={5.2}
          icon={Package}
          color="green"
        />
        <StatCard
          title="Active Sales"
          value={stats.sales.active}
          subtitle={`${stats.sales.total} total campaigns`}
          change={8.7}
          icon={Percent}
          color="orange"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
          subtitle={`${stats.orders.completed} completed, ${stats.orders.pending} pending`}
          change={-2.3}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue?.total?.toLocaleString() || '0'}`}
          subtitle={`₹${stats.revenue?.monthly?.toLocaleString() || '0'} this month`}
          change={stats.revenue?.growth || 0}
          icon={IndianRupee}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* User Growth Chart */}
        <DefaultMultipleBarChart 
          data={chartData.userGrowth}
          title="User Growth"
          subtitle="Monthly user registration trends"
          growthRate={`+${chartData.userGrowth.length > 0 ? chartData.userGrowth[chartData.userGrowth.length - 1].growth : 0}%`}
        />

        {/* Product Category Distribution */}
        <RoundedPieChart 
          data={chartData.productStats}
          title="Product Categories"
          subtitle="Distribution of products by category"
          growthRate="5.2%"
        />

      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-medium">{stats.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Admins</span>
              <span className="font-medium">{stats.users.admins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Regular Users</span>
              <span className="font-medium">{stats.users.regular}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">New (30 days)</span>
              <span className="font-medium">{stats.users.recent}</span>
            </div>
          </CardContent>
        </Card>

        {/* Product Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Products</span>
              <span className="font-medium">{stats.products.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="font-medium text-green-600">{stats.products.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Inactive</span>
              <span className="font-medium text-red-600">{stats.products.inactive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">New (7 days)</span>
              <span className="font-medium">{stats.products.recent}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sales Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Sales Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Campaigns</span>
              <span className="font-medium">{stats.sales.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Now</span>
              <span className="font-medium text-green-600">{stats.sales.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <span className="font-medium text-blue-600">{stats.sales.scheduled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Products in Sales</span>
              <span className="font-medium">{stats.sales.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-medium">₹{stats.revenue?.total?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium text-green-600">₹{stats.revenue?.monthly?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Growth Rate</span>
              <span className="font-medium text-blue-600">+{stats.revenue?.growth || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Success</span>
              <span className="font-medium text-green-600">{stats.payments?.success || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

     
    </div>
  )
}

export default AdminDashboard
