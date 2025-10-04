import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2,
  Search
} from 'lucide-react'
import statesData from '@/data/indian-states.json'

const AddressPage = () => {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [states, setStates] = useState(statesData.states)
  const [districts, setDistricts] = useState([])
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchDistricts = (stateCode) => {
    const state = states.find(s => s.code === stateCode);
    if (state) {
      setDistricts(state.districts);
    }
  };

  const handlePincodeLookup = async (pincode) => {
    if (!pincode || pincode.length !== 6) return
    
    setPincodeLoading(true)
    try {
      const response = await userApi.address.getPincodeDetails(pincode)
      if (response.data.success) {
        const data = response.data.data
        setFormData(prev => ({
          ...prev,
          city: data.city || '', // Use city from API response
          state: data.state,
          country: 'India'
        }))
        
        
        // Find state code and fetch districts
        const state = states.find(s => s.name === data.state)
        if (state) {
          fetchDistricts(state.code)
        }
        
        toast.success('Address details filled automatically!')
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error)
      toast.error('Unable to fetch address details for this pincode')
    } finally {
      setPincodeLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await userApi.addresses.getUserAddresses()
      if (response.data.success) {
        setAddresses(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Auto-fill address details when pincode is entered
    if (name === 'postalCode' && value.length === 6) {
      handlePincodeLookup(value)
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Fetch districts when state changes
    if (name === 'state') {
      const state = states.find(s => s.name === value)
      if (state) {
        fetchDistricts(state.code)
        setFormData(prev => ({
          ...prev,
          city: '' // Reset city when state changes
        }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    })
    setEditingAddress(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.address || !formData.city || !formData.state || !formData.postalCode || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      setLoading(true)
      
      if (editingAddress) {
        // Update existing address
        await userApi.addresses.updateAddress(editingAddress._id, formData)
        toast.success('Address updated successfully!')
      } else {
        // Create new address
        await userApi.addresses.addAddress(formData)
        toast.success('Address added successfully!')
      }
      
      setIsDialogOpen(false)
      resetForm()
      fetchAddresses()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setFormData({
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      setLoading(true)
      await userApi.addresses.deleteAddress(addressId)
      toast.success('Address deleted successfully!')
      fetchAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    } finally {
      setLoading(false)
    }
  }


  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">My Addresses</h1>
          <p className="text-lg text-muted-foreground">Manage your shipping addresses</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
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
      {/* Header */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Addresses</h1>
          <p className="text-lg text-muted-foreground">Manage your shipping addresses</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }} 
              className="gap-2 rounded-full"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, street name, apartment, etc."
                    required
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <div className="relative">
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                      required
                    />
                    {pincodeLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter pincode to auto-fill city and state
                  </p>
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleSelectChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.code} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                    required
                  />
                </div>

                {/* Country - Fixed to India */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value="India"
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* Default Address */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="gap-2 rounded-full">
                  {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No addresses yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add your first address to make checkout easier and faster
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 rounded-full px-8">
              <Plus className="h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address._id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">
                      {address.isDefault ? 'Default Address' : 'Address'}
                    </span>
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">{address.phone}</div>
                  <div className="text-muted-foreground">{address.address}</div>
                  <div className="text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </div>
                  <div className="text-muted-foreground">{address.country}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressPage
