import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Copy, Check, ExternalLink, TestTube, Settings, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/api';

const ShiprocketWebhookManager = () => {
  const [webhookConfig, setWebhookConfig] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedItems, setCopiedItems] = useState(new Set());

  useEffect(() => {
    fetchWebhookConfig();
  }, []);

  const fetchWebhookConfig = async () => {
    try {
      setLoading(true);
      const response = await adminApi.shiprocket.getWebhookConfig();
      if (response.data.success) {
        setWebhookConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching webhook config:', error);
      toast.error('Failed to fetch webhook configuration');
    } finally {
      setLoading(false);
    }
  };

  const testWebhooks = async () => {
    try {
      setLoading(true);
      const response = await adminApi.shiprocket.testWebhook();
      if (response.data.success) {
        setTestResults(response.data.results);
        toast.success('Webhook test completed');
      }
    } catch (error) {
      console.error('Error testing webhooks:', error);
      toast.error('Failed to test webhooks');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, item) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, item]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item);
          return newSet;
        });
      }, 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
  };

  if (loading && !webhookConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading webhook configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shiprocket Webhook Manager</h2>
          <p className="text-muted-foreground">
            Configure and manage Shiprocket webhooks for real-time order updates
          </p>
        </div>
        <Button onClick={testWebhooks} disabled={loading}>
          <TestTube className="h-4 w-4 mr-2" />
          Test Webhooks
        </Button>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="urls">Webhook URLs</TabsTrigger>
          <TabsTrigger value="test">Test Results</TabsTrigger>
          <TabsTrigger value="instructions">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Current webhook configuration and environment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhookConfig && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Environment</Label>
                      <Badge variant="outline" className="mt-1">
                        {webhookConfig.environment}
                      </Badge>
                    </div>
                    <div>
                      <Label>Base URL</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={webhookConfig.urls.orderStatus.split('/api')[0]}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(webhookConfig.urls.orderStatus.split('/api')[0], 'baseUrl')}
                        >
                          {copiedItems.has('baseUrl') ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Supported Events</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {webhookConfig.events.map((event, index) => (
                        <Badge key={index} variant="secondary">
                          {event.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook URLs</CardTitle>
              <CardDescription>
                Copy these URLs to configure in your Shiprocket dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhookConfig?.urls && Object.entries(webhookConfig.urls).map(([name, url]) => (
                <div key={name} className="space-y-2">
                  <Label className="text-sm font-medium capitalize">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={url}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(url, name)}
                    >
                      {copiedItems.has(name) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUrl(url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Test Results</CardTitle>
              <CardDescription>
                Test results for all webhook endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={result.success ? "default" : "destructive"}
                        >
                          {result.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{result.endpoint}</p>
                          <p className="text-sm text-muted-foreground">{result.url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {result.success ? 'Success' : 'Failed'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No test results available. Click "Test Webhooks" to run tests.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to configure webhooks in your Shiprocket dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhookConfig?.instructions && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Make sure to set the <code>SHIPROCKET_WEBHOOK_SECRET</code> environment variable
                      in your backend configuration for webhook signature verification.
                    </AlertDescription>
                  </Alert>
                  
                  <ol className="space-y-3">
                    {webhookConfig.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiprocketWebhookManager;
