import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Activity
} from 'lucide-react';

export const PaymentStats = ({ stats, paymentConfig }) => {
  const formatAmount = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const getSuccessRate = () => {
    if (!stats?.overview?.totalTransactions || stats.overview.totalTransactions === 0) return 0;
    return Math.round((stats.overview.successfulTransactions / stats.overview.totalTransactions) * 100);
  };

  const getFailureRate = () => {
    if (!stats?.overview?.totalTransactions || stats.overview.totalTransactions === 0) return 0;
    return Math.round((stats.overview.failedTransactions / stats.overview.totalTransactions) * 100);
  };

  const getPendingRate = () => {
    if (!stats?.overview?.totalTransactions || stats.overview.totalTransactions === 0) return 0;
    return Math.round((stats.overview.pendingTransactions / stats.overview.totalTransactions) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats?.overview?.successfulAmount)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats?.overview?.successfulTransactions || 0} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.successfulTransactions || 0} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getFailureRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.failedTransactions || 0} failed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getPendingRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.pendingTransactions || 0} pending transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Providers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byProvider?.map((provider) => (
                <div key={provider._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      {provider._id}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {provider.count} transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(provider.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(provider.count, stats?.overview?.totalTransactions)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Transaction Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byStatus?.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={status._id === 'success' ? 'default' : 'secondary'}
                      className={
                        status._id === 'success' ? 'bg-green-100 text-green-800' :
                        status._id === 'failed' ? 'bg-red-100 text-red-800' :
                        status._id === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {status.count} transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(status.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(status.count, stats?.overview?.totalTransactions)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Provider Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Payment Methods</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online Payments</span>
                  <Badge variant={paymentConfig?.onlinePaymentEnabled ? "default" : "secondary"}>
                    {paymentConfig?.onlinePaymentEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash on Delivery</span>
                  <Badge variant={paymentConfig?.codEnabled ? "default" : "secondary"}>
                    {paymentConfig?.codEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Active Providers</h4>
              <div className="space-y-2">
                {paymentConfig?.providers?.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{provider.name}</span>
                    <Badge variant={provider.isEnabled ? "default" : "secondary"}>
                      {provider.isEnabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {paymentConfig?.limits && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Payment Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Minimum Amount</label>
                  <p className="font-medium">{formatAmount(paymentConfig.limits.minAmount)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Maximum Amount</label>
                  <p className="font-medium">{formatAmount(paymentConfig.limits.maxAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Test Payment</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Test your payment configuration with a sample transaction
              </p>
              <button className="text-sm text-primary hover:underline">
                Run Test →
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export transaction data for analysis
              </p>
              <button className="text-sm text-primary hover:underline">
                Download CSV →
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">View Logs</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Check payment processing logs and errors
              </p>
              <button className="text-sm text-primary hover:underline">
                View Logs →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
