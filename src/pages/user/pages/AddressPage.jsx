import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  Phone,
  Home
} from 'lucide-react'

const AddressPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: '',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await userApi.addresses.getUserAddresses()
      if (response.data.success) {
        setAddresses(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to load addresses')
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userApi.addresses.addAddress(addressForm)
      if (response.data.success) {
        toast.success('Address added successfully')
        resetForm()
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAddress = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userApi.addresses.updateAddress(editingAddress._id, addressForm)
      if (response.data.success) {
        toast.success('Address updated successfully')
        resetForm()
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Failed to update address')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true)
      const response = await userApi.addresses.deleteAddress(addressId)
      if (response.data.success) {
        toast.success('Address deleted successfully')
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true)
      const response = await userApi.addresses.setDefaultAddress(addressId)
      if (response.data.success) {
        toast.success('Default address updated')
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      toast.error('Failed to set default address')
    } finally {
      setLoading(false)
    }
  }

  const startEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone,
      isDefault: address.isDefault
    })
    setShowAddressForm(true)
  }

  const resetForm = () => {
    setAddressForm({
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      phone: '',
      isDefault: false
    })
    setShowAddressForm(false)
    setEditingAddress(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Button>
        <h1 className="text-3xl font-bold">My Addresses</h1>
      </div>

      <div className="space-y-6">
        {/* Address List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
              <DialogTrigger asChild>
                <Button disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingAddress ? handleEditAddress : handleAddAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                      disabled={loading}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      disabled={loading}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                      Set as default address
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No addresses saved</h3>
                <p className="text-muted-foreground mb-6">
                  Add your first address to get started with faster checkout.
                </p>
                <Button onClick={() => setShowAddressForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <Card key={address._id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Home Address</span>
                      </div>
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="font-medium">{address.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {address.phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditAddress(address)}
                        disabled={loading}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultAddress(address._id)}
                          disabled={loading}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AddressPage
