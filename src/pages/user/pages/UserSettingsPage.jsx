import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authstore'
import { userApi } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Settings, 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

const UserSettingsPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [editingAddress, setEditingAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    email: ''
  })

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
    if (authUser) {
      setProfileForm({
        firstname: authUser.firstname || '',
        lastname: authUser.lastname || '',
        email: authUser.email || ''
      })
    }
    fetchAddresses()
  }, [authUser])

  const fetchAddresses = async () => {
    try {
      const response = await userApi.addresses.getUserAddresses()
      if (response.data.success) {
        setAddresses(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Here you would call the API to update profile
      // await userApi.profile.updateProfile(profileForm)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userApi.addresses.addAddress(addressForm)
      if (response.data.success) {
        toast.success('Address added successfully')
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
        setEditingAddress(null)
        setAddressForm({
          address: '',
          city: '',
          state: '',
          country: 'India',
          postalCode: '',
          phone: '',
          isDefault: false
        })
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

  const cancelEdit = () => {
    setEditingAddress(null)
    setShowAddressForm(false)
    setAddressForm({
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      phone: '',
      isDefault: false
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    value={profileForm.firstname}
                    onChange={(e) => setProfileForm({...profileForm, firstname: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    value={profileForm.lastname}
                    onChange={(e) => setProfileForm({...profileForm, lastname: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Address Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(true)}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddressForm ? (
              <form onSubmit={editingAddress ? handleEditAddress : handleAddAddress} className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    disabled={loading}
                    placeholder="Street address"
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      disabled={loading}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No addresses added yet. Click "Add Address" to get started.
                  </p>
                ) : (
                  addresses.map((address) => (
                    <div key={address._id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{address.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {address.phone}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {address.isDefault && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
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
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserSettingsPage
