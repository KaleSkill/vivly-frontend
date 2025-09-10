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
  RotateCcw,
  Package,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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
      // This would be a new API endpoint for user refunds
      // const response = await userApi.refunds.getUserRefunds()
      // For now, we'll show a placeholder
      setRefunds([])
    } catch (error) {
      console.error('Error fetching refunds:', error)
      toast.error('Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const getRefundStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PROCESSING':
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRefundStatusBadgeColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
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

  const handleRequestRefund = () => {
    // This would open a refund request modal or navigate to refund request page
    toast.info('Refund request feature coming soon!')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Button>
          <h1 className="text-3xl font-bold">Refunds & Returns</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Button>
        <h1 className="text-3xl font-bold">Refunds & Returns</h1>
      </div>

      {/* Refund Policy Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Refund Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">7-Day Return</h3>
              <p className="text-sm text-muted-foreground">
                Return items within 7 days of delivery
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Easy Process</h3>
              <p className="text-sm text-muted-foreground">
                Simple return process with instant approval
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Quick Refund</h3>
              <p className="text-sm text-muted-foreground">
                Refunds processed within 3-5 business days
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">Return Conditions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Items must be in original condition with tags</li>
              <li>• No damage or signs of wear</li>
              <li>• Original packaging preferred</li>
              <li>• Free return shipping for eligible items</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Refund Requests */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Refund Requests</h2>
          <Button onClick={handleRequestRefund}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
        </div>

        {refunds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No refund requests</h3>
              <p className="text-muted-foreground mb-6">
                You haven't requested any refunds yet. Need to return an item?
              </p>
              <Button onClick={handleRequestRefund}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Request Refund
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <Card key={refund._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Refund #{refund.refundId}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Requested on {formatDate(refund.requestedAt)}
                      </p>
                    </div>
                    <Badge className={getRefundStatusBadgeColor(refund.status)}>
                      {getRefundStatusIcon(refund.status)}
                      <span className="ml-1">{refund.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">#{refund.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Refund Amount:</span>
                      <span className="font-semibold">₹{refund.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{refund.reason}</span>
                    </div>
                    {refund.refundMethod && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refund Method:</span>
                        <span>{refund.refundMethod}</span>
                      </div>
                    )}
                  </div>

                  {refund.status === 'APPROVED' && refund.processedAt && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Refund processed on {formatDate(refund.processedAt)}
                      </p>
                    </div>
                  )}

                  {refund.status === 'REJECTED' && refund.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <XCircle className="h-4 w-4 inline mr-1" />
                        {refund.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RefundsPage
