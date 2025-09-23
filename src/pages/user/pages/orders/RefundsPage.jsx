import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  RefreshCw,
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

const RefundsPage = () => {
  const navigate = useNavigate()
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      // Note: This endpoint might not exist yet, adjust as needed
      const response = await userApi.refunds?.getUserRefunds?.() || { data: { success: true, data: [] } }
      if (response.data.success) {
        setRefunds(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching refunds:', error)
      toast.error('Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRequestRefund = (orderId) => {
    // Navigate to refund request page or open modal
    navigate(`/user/refunds/request/${orderId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">My Refunds</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (refunds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">My Refunds</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No refunds yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't requested any refunds yet. You can request a refund for eligible orders.
            </p>
            <Button onClick={() => navigate('/user/orders')}>
              <Package className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold">My Refunds</h1>
        <Badge variant="secondary" className="ml-auto">
          {refunds.length} {refunds.length === 1 ? 'refund' : 'refunds'}
        </Badge>
      </div>

      <div className="space-y-4">
        {refunds.map((refund) => (
          <Card key={refund._id} className="border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Refund Icon */}
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {/* Refund Details */}
                <div className="flex-1 min-w-0">
                  {/* Refund Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">#{refund.refundId || refund._id}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Requested on {formatDate(refund.requestedAt || refund.createdAt)}
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusBadgeColor(refund.status)}`}>
                      {getStatusIcon(refund.status)}
                      <span className="ml-1">{refund.status}</span>
                    </Badge>
                  </div>
                  
                  {/* Refund Info */}
                  <div className="mb-3">
                    <div className="text-sm font-medium">
                      Order: #{refund.orderId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reason: {refund.reason || 'Not specified'}
                    </div>
                  </div>
                  
                  {/* Bottom Row: Amount, Actions */}
                  <div className="flex items-center justify-between">
                    {/* Amount */}
                    <div className="text-right">
                      <div className="font-semibold text-sm">₹{refund.amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {refund.method || 'Original payment method'}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {refund.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/user/refunds/${refund._id}`)}
                          className="h-7 px-3"
                        >
                          <span className="text-xs">View Details</span>
                        </Button>
                      )}
                      {refund.status === 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/user/refunds/${refund._id}`)}
                          className="h-7 px-3"
                        >
                          <span className="text-xs">View Receipt</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default RefundsPage
