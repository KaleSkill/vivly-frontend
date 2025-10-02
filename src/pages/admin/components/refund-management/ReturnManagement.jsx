import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw } from 'lucide-react'

const ReturnManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Refund Management</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Refund management feature is under development and will be available soon.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Process refund requests</p>
              <p>• Manage return orders</p>
              <p>• Track refund status</p>
              <p>• Handle customer returns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReturnManagement