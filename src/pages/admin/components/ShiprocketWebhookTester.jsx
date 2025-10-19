import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TestTube, 
  Play, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Info, 
  Cloud, 
  Terminal,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { shiprocketApi } from '@/api/api';

const ShiprocketWebhookTester = () => {
  const [tunnelUrls, setTunnelUrls] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [simulationResults, setSimulationResults] = useState(null);

  // Test form state
  const [testForm, setTestForm] = useState({
    eventType: 'ORDER_STATUS_UPDATE',
    orderId: 'ORD-TEST-123',
    status: 'SHIPPED',
    trackingId: 'TRACK-TEST-123',
    courierName: 'Test Courier'
  });

  // Simulation form state
  const [simulationForm, setSimulationForm] = useState({
    eventType: 'ORDER_STATUS_UPDATE',
    orderId: 'ORD-SIMULATE-123',
    status: 'SHIPPED',
    trackingId: 'TRACK-SIM-123',
    courierName: 'Test Courier'
  });

  useEffect(() => {
    fetchTunnelUrls();
    fetchTestStatus();
  }, []);

  const fetchTunnelUrls = async () => {
    try {
      const response = await shiprocketApi.getTunnelWebhookUrls();
      if (response.data.success) {
        setTunnelUrls(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tunnel URLs:', error);
    }
  };

  const fetchTestStatus = async () => {
    try {
      const response = await shiprocketApi.getWebhookTestStatus();
      if (response.data.success) {
        setTestStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching test status:', error);
    }
  };

  const runLocalTest = async () => {
    setLoading(true);
    try {
      const response = await shiprocketApi.testWebhookLocal(testForm);
      if (response.data.success) {
        setTestResults(prev => [response.data, ...prev.slice(0, 9)]);
        toast.success('Local webhook test completed');
      } else {
        toast.error(response.data.message || 'Test failed');
      }
    } catch (error) {
      console.error('Error running local test:', error);
      toast.error('Failed to run local test');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await shiprocketApi.simulateWebhook(simulationForm);
      if (response.data.success) {
        setSimulationResults(response.data);
        toast.success('Webhook simulation completed');
      } else {
        toast.error(response.data.message || 'Simulation failed');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard!');
  };

  const statusOptions = [
    'NEW', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RTO_INITIATED', 
    'RTO_DELIVERED', 'LOST', 'DAMAGED', 'RETURN_REQUESTED', 
    'RETURN_PICKUP_GENERATED', 'RETURN_IN_TRANSIT', 'RETURN_DELIVERED', 
    'RETURN_CANCELLED', 'REFUND_PROCESSED'
  ];

  return (
    <div className="space-y-6">
      {/* Cloudflare Tunnel Setup */}
      {tunnelUrls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" /> Cloudflare Tunnel Setup
            </CardTitle>
            <CardDescription>
              Set up Cloudflare tunnel to expose your local server for webhook testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Setup Instructions</AlertTitle>
              <AlertDescription>
                Follow these steps to set up Cloudflare tunnel for webhook testing
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Setup Steps:</Label>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {tunnelUrls.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="space-y-3">
              <Label>Tunnel Command:</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Terminal className="h-4 w-4" />
                <code className="flex-1 text-sm">{tunnelUrls.tunnelCommand}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(tunnelUrls.tunnelCommand)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Webhook URLs for Shiprocket:</Label>
              {Object.entries(tunnelUrls.testUrls).map(([name, url]) => (
                <div key={name} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <span className="font-medium capitalize w-32">{name.replace(/([A-Z])/g, ' $1')}:</span>
                  <code className="flex-1 text-sm">{url}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Status */}
      {testStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Webhook Test Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testStatus.successfulTests}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testStatus.failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testStatus.totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((testStatus.successfulTests / testStatus.totalTests) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Webhook Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" /> Local Webhook Test
          </CardTitle>
          <CardDescription>
            Test webhook endpoints with custom payloads for local development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={testForm.eventType} 
                onValueChange={(value) => setTestForm(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_STATUS_UPDATE">Order Status Update</SelectItem>
                  <SelectItem value="RETURN_STATUS_UPDATE">Return Status Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={testForm.orderId}
                onChange={(e) => setTestForm(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="ORD-TEST-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={testForm.status} 
                onValueChange={(value) => setTestForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input
                id="trackingId"
                value={testForm.trackingId}
                onChange={(e) => setTestForm(prev => ({ ...prev, trackingId: e.target.value }))}
                placeholder="TRACK-TEST-123"
              />
            </div>
          </div>

          <Button onClick={runLocalTest} disabled={loading} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Run Local Test'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Webhook Simulation
          </CardTitle>
          <CardDescription>
            Simulate realistic Shiprocket webhook calls for comprehensive testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="simEventType">Event Type</Label>
              <Select 
                value={simulationForm.eventType} 
                onValueChange={(value) => setSimulationForm(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_STATUS_UPDATE">Order Status Update</SelectItem>
                  <SelectItem value="RETURN_STATUS_UPDATE">Return Status Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simOrderId">Order ID</Label>
              <Input
                id="simOrderId"
                value={simulationForm.orderId}
                onChange={(e) => setSimulationForm(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="ORD-SIMULATE-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="simStatus">Status</Label>
              <Select 
                value={simulationForm.status} 
                onValueChange={(value) => setSimulationForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simCourierName">Courier Name</Label>
              <Input
                id="simCourierName"
                value={simulationForm.courierName}
                onChange={(e) => setSimulationForm(prev => ({ ...prev, courierName: e.target.value }))}
                placeholder="Test Courier"
              />
            </div>
          </div>

          <Button onClick={runSimulation} disabled={loading} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" /> Recent Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.response?.status === 200 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result.testData?.eventType} - {result.testData?.status}
                      </span>
                    </div>
                    <Badge variant={result.response?.status === 200 ? 'success' : 'destructive'}>
                      {result.response?.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Order ID: {result.testData?.orderId} | 
                    Webhook URL: {result.testData?.webhookUrl}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Results */}
      {simulationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> Simulation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event Type</Label>
                  <div className="text-sm">{simulationResults.simulation?.eventType}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="text-sm">{simulationResults.simulation?.status}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order ID</Label>
                  <div className="text-sm">{simulationResults.simulation?.orderId}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Response Status</Label>
                  <div className="text-sm">{simulationResults.webhookResponse?.status}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Webhook Payload</Label>
                <Textarea
                  value={JSON.stringify(simulationResults.simulation?.payload, null, 2)}
                  readOnly
                  className="mt-2 h-40 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShiprocketWebhookTester;
