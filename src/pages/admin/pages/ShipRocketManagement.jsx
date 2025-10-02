import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

const ShipRocketManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ShipRocket Management</h1>
          <p className="text-muted-foreground">Manage deliveries, shipments, and logistics</p>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>ShipRocket Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ShipRocket Management</h3>
            <p className="text-muted-foreground mb-4">
              This feature is under development. You can implement ShipRocket integration here.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Track orders and shipments</p>
              <p>• Manage courier services</p>
              <p>• Generate shipping labels</p>
              <p>• Handle pickup requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipRocketManagement;
