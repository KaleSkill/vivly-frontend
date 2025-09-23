import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/api/api'
import { Package, Eye, EyeOff, TrendingUp, RefreshCw } from 'lucide-react'

const ProductStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    recentProducts: 0
  })
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await adminApi.products.getProductStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching product stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'All products in catalog'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Eye,
      description: 'Currently visible products'
    },
    {
      title: 'Inactive Products',
      value: stats.inactiveProducts,
      icon: EyeOff,
      description: 'Hidden from customers'
    },
    {
      title: 'Recent Products',
      value: stats.recentProducts,
      icon: TrendingUp,
      description: 'Added in last 7 days'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
      
      {/* Refresh Button */}
      <Card className="flex items-center justify-center">
        <CardContent className="flex items-center justify-center h-full">
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductStats
