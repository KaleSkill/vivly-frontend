import React, { useState } from 'react'
import { useAuthStore } from '@/store/authstore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Edit3,
} from 'lucide-react'

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuthStore()
  console.log(authUser)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: authUser?.data?.firstName || '',
    email: authUser?.data?.email || '',
   
  })




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
       
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {authUser?.data?.profile ? (
                  <img 
                    src={authUser.data.profile} 
                    alt={authUser?.data?.firstname || 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ display: authUser?.data?.profile ? 'none' : 'flex' }}
                >
                  {authUser?.data?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              
            
            </div>
            
            <div>
              <h3 className="font-medium text-lg">
                {authUser?.data?.firstname}
              </h3>
              <p className="text-muted-foreground">
                {authUser?.data?.email}
              </p>
             
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
             
                <div className="p-3 bg-muted rounded-md">
                  {authUser?.data?.firstname || 'Not provided'}
                </div>
          
            </div>

           

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              
             
                <div className="p-3 bg-muted rounded-md">
                  {authUser?.data?.email || 'Not provided'}
                </div>
              
            </div>

           

          
          </div>

         
        
        </CardContent>
      </Card>

     
    </div>
  )
}

export default ProfilePage
