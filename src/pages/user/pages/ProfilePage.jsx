import React, { useState } from 'react'
import { useAuthStore } from '@/store/authstore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit3,
  Save,
  X
} from 'lucide-react'

const ProfilePage = () => {
  const { authUser, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstname: authUser?.firstname || '',
    lastname: authUser?.lastname || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll just update the local state
      await updateUser(formData)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstname: authUser?.firstname || '',
      lastname: authUser?.lastname || '',
      email: authUser?.email || '',
      phone: authUser?.phone || '',
    })
    setIsEditing(false)
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!authUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={authUser.profile} alt={authUser.firstname} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(authUser.firstname + ' ' + authUser.lastname)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {authUser.firstname} {authUser.lastname}
                </h3>
                <Badge variant={authUser.role === 'Admin' ? 'default' : 'secondary'} className="mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {authUser.role}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{authUser.email}</span>
                </div>
                {authUser.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{authUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since {new Date(authUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{authUser.firstname}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{authUser.lastname}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{authUser.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{authUser.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
