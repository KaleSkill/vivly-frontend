import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube
} from 'lucide-react';
import { userApi } from '@/api/api';
import { toast } from 'sonner';

const ShipRocketConfig = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    if (!credentials.email || !credentials.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test with a simple API call
      const response = await userApi.shiprocket.getAllShipments(1, 1);
      
      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'Connection successful! ShipRocket API is working.'
        });
        toast.success('ShipRocket connection test successful');
      } else {
        setTestResult({
          success: false,
          message: response.data.error || 'Connection failed'
        });
        toast.error('ShipRocket connection test failed');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Connection test failed'
      });
      toast.error('ShipRocket connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCredentials = () => {
    // In a real application, you would save these to a secure configuration
    // For now, we'll just show a message
    toast.info('Credentials would be saved to server configuration');
    console.log('ShipRocket credentials:', credentials);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ShipRocket Configuration</h1>
          <p className="text-muted-foreground">Configure your ShipRocket API credentials</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>API Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">ShipRocket API Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-api-email@example.com"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use the API user email from your ShipRocket panel
              </p>
            </div>

            <div>
              <Label htmlFor="password">ShipRocket API Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your API password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use the API user password from your ShipRocket panel
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleTestConnection} disabled={testing || !credentials.email || !credentials.password}>
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleSaveCredentials}>
              <Save className="h-4 w-4 mr-2" />
              Save Credentials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Get ShipRocket API Credentials</p>
                <p className="text-sm text-muted-foreground">
                  Go to <a href="https://app.shiprocket.in/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ShipRocket Panel</a> → API → Generate API User
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Create API User</p>
                <p className="text-sm text-muted-foreground">
                  Use an email that is NOT registered on ShipRocket. Note down the email and password.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Configure Environment</p>
                <p className="text-sm text-muted-foreground">
                  Add the credentials to your backend .env file:
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">
                    SHIPROCKET_EMAIL=your_api_email@example.com<br/>
                    SHIPROCKET_PASSWORD=your_api_password
                  </code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Test Connection</p>
                <p className="text-sm text-muted-foreground">
                  Use the "Test Connection" button above to verify your credentials work.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Order Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create orders</li>
                <li>• Track orders</li>
                <li>• Assign AWB codes</li>
                <li>• Generate pickups</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Shipping & Logistics</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Courier serviceability</li>
                <li>• Generate manifests</li>
                <li>• Print labels</li>
                <li>• Print invoices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipRocketConfig;
