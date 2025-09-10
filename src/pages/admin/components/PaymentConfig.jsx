import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Settings, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';

export const PaymentConfig = ({ config, onConfigUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    onlinePaymentEnabled: config?.onlinePaymentEnabled || false,
    codEnabled: config?.codEnabled || true,
    defaultProvider: config?.defaultProvider || 'razorpay',
    limits: {
      minAmount: config?.limits?.minAmount || 1,
      maxAmount: config?.limits?.maxAmount || 100000
    },
    providers: config?.providers || [
      {
        name: 'razorpay',
        isEnabled: false,
        settings: {
          currency: 'INR',
          theme: '#000000',
          description: 'Payment for order'
        }
      },
      {
        name: 'cashfree',
        isEnabled: false,
        settings: {
          currency: 'INR',
          theme: '#000000',
          description: 'Payment for order'
        }
      }
    ]
  });

  const handleProviderToggle = (providerName, enabled) => {
    setFormData(prev => ({
      ...prev,
      providers: prev.providers.map(provider => 
        provider.name === providerName 
          ? { ...provider, isEnabled: enabled }
          : provider
      )
    }));
  };

  const handleProviderSettings = (providerName, field, value) => {
    setFormData(prev => ({
      ...prev,
      providers: prev.providers.map(provider => 
        provider.name === providerName 
          ? { 
              ...provider, 
              settings: { 
                ...provider.settings, 
                [field]: value 
              } 
            }
          : provider
      )
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await adminApi.adminPayments.updatePaymentConfig(formData);
      
      if (response.data.success) {
        onConfigUpdate(response.data.data);
        toast.success('Payment configuration updated successfully');
      }
    } catch (error) {
      console.error('Error updating payment config:', error);
      toast.error('Failed to update payment configuration');
    } finally {
      setLoading(false);
    }
  };


  const getProviderIcon = (providerName) => {
    return <CreditCard className="h-5 w-5" />;
  };

  const getProviderStatus = (provider) => {
    if (provider.isEnabled) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Enabled
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Global Payment Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="onlinePayment">Online Payment</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="onlinePayment"
                  checked={formData.onlinePaymentEnabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, onlinePaymentEnabled: checked }))
                  }
                />
                <Label htmlFor="onlinePayment">
                  {formData.onlinePaymentEnabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codPayment">Cash on Delivery</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="codPayment"
                  checked={formData.codEnabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, codEnabled: checked }))
                  }
                />
                <Label htmlFor="codPayment">
                  {formData.codEnabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultProvider">Default Provider</Label>
              <Select
                value={formData.defaultProvider}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, defaultProvider: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default provider" />
                </SelectTrigger>
                <SelectContent>
                  {formData.providers
                    .filter(p => p.isEnabled)
                    .map(provider => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
              <Input
                id="minAmount"
                type="number"
                value={formData.limits.minAmount}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    limits: { ...prev.limits, minAmount: parseInt(e.target.value) }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={formData.limits.maxAmount}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    limits: { ...prev.limits, maxAmount: parseInt(e.target.value) }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Providers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Providers</h3>
        
        {formData.providers.map((provider) => (
          <Card key={provider.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider.name)}
                  <div>
                    <CardTitle className="capitalize">{provider.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {provider.name === 'razorpay' 
                        ? 'Accept payments via Razorpay gateway'
                        : 'Accept payments via Cashfree gateway'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getProviderStatus(provider)}
                  <Switch
                    checked={provider.isEnabled}
                    onCheckedChange={(checked) => handleProviderToggle(provider.name, checked)}
                  />
                </div>
              </div>
            </CardHeader>

            {provider.isEnabled && (
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}</strong> is configured and ready to process payments.
                    API credentials are managed securely in the backend configuration.
                  </AlertDescription>
                </Alert>
                
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${provider.name}-currency`}>Currency</Label>
                      <Select
                        value={provider.settings.currency}
                        onValueChange={(value) => handleProviderSettings(provider.name, 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${provider.name}-theme`}>Theme Color</Label>
                      <Input
                        id={`${provider.name}-theme`}
                        type="color"
                        value={provider.settings.theme}
                        onChange={(e) => handleProviderSettings(provider.name, 'theme', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${provider.name}-description`}>Description</Label>
                      <Input
                        id={`${provider.name}-description`}
                        value={provider.settings.description}
                        onChange={(e) => handleProviderSettings(provider.name, 'description', e.target.value)}
                        placeholder="Payment description"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> API credentials for Razorpay and Cashfree are configured in the backend. You only need to enable/disable the payment providers here. Make sure to test payments in sandbox mode before going live.
        </AlertDescription>
      </Alert>
    </div>
  );
};
