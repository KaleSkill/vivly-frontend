import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings, 
  BarChart3, 
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';
import { PaymentConfig } from '../components/PaymentConfig';
import { PaymentTransactions } from '../components/PaymentTransactions';
import { PaymentStats } from '../components/PaymentStats';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [configResponse, statsResponse] = await Promise.all([
        adminApi.adminPayments.getPaymentConfig(),
        adminApi.adminPayments.getPaymentStats()
      ]);

      if (configResponse.data.success) {
        setPaymentConfig(configResponse.data.data);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = (updatedConfig) => {
    setPaymentConfig(updatedConfig);
    toast.success('Payment configuration updated successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage payment providers, monitor transactions, and view analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={paymentConfig?.onlinePaymentEnabled ? "default" : "secondary"}>
            {paymentConfig?.onlinePaymentEnabled ? "Online Payments Enabled" : "Online Payments Disabled"}
          </Badge>
          <Badge variant={paymentConfig?.codEnabled ? "default" : "secondary"}>
            {paymentConfig?.codEnabled ? "COD Enabled" : "COD Disabled"}
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.overview?.totalAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview?.totalTransactions > 0 
                ? Math.round((stats.overview.successfulTransactions / stats.overview.totalTransactions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentConfig?.providers?.filter(p => p.isEnabled).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment providers enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PaymentStats stats={stats} paymentConfig={paymentConfig} />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <PaymentConfig 
            config={paymentConfig} 
            onConfigUpdate={handleConfigUpdate}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <PaymentTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;
