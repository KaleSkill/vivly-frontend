import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { shiprocketApi } from '@/api/api'
import { Truck, Key, LogOut, CheckCircle, XCircle, Loader2, BarChart3 } from 'lucide-react'

const ShiprocketManagement = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('shiprocket_token') || '')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleConnect = async () => {
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const result = await shiprocketApi.generateToken(credentials)
      console.log('Shiprocket Login Response:', result.data)
      
      if (result.data.data && result.data.data.token) {
        const newToken = result.data.data.token
        setToken(newToken)
        localStorage.setItem('shiprocket_token', newToken)
        setResponse(result.data)
      } else {
        setError('No token received from Shiprocket')
      }
    } catch (err) {
      console.error('Shiprocket connection error:', err)
      setError(err.response?.data?.message || 'Failed to connect to Shiprocket')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const result = await shiprocketApi.logout(token)
      console.log('Shiprocket Logout Response:', result.data)
      
      setToken('')
      localStorage.removeItem('shiprocket_token')
      setResponse(result.data)
    } catch (err) {
      console.error('Shiprocket logout error:', err)
      setError(err.response?.data?.message || 'Failed to logout from Shiprocket')
    } finally {
      setLoading(false)
    }
  }

  const clearResponse = () => {
    setResponse(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shiprocket Management</h1>
          <p className="text-muted-foreground">Connect and manage your Shiprocket integration</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Connect to Shiprocket
            </CardTitle>
            <CardDescription>
              Enter your Shiprocket credentials to generate an authentication token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your Shiprocket email"
                value={credentials.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your Shiprocket password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Shiprocket'
                )}
              </Button>
              
              {token && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/admin/shiprocket/dashboard'}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Current authentication status and token information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={token ? "default" : "secondary"}>
                {token ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {token && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Token:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {token.substring(0, 20)}...
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigator.clipboard.writeText(token)}
                  className="w-full"
                >
                  Copy Token
                </Button>
              </div>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>• Token is stored in localStorage</p>
              <p>• Use this token for Shiprocket API calls</p>
              <p>• Token expires based on Shiprocket settings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Response</CardTitle>
              <Button variant="outline" size="sm" onClick={clearResponse}>
                Clear
              </Button>
            </div>
            <CardDescription>
              Response data from Shiprocket API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ShiprocketManagement
