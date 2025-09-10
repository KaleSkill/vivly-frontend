import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Plus,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { adminApi } from '@/api/api'

const BannerManagement = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [dragIndex, setDragIndex] = useState(null)
  const [operationLoading, setOperationLoading] = useState({})
  const fileInputRef = useRef(null)

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true)
    try {
      const response = await adminApi.banners.getBanners(filter)
      setBanners(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch banners')
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  // Upload banner
  const handleUpload = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('banner', file)

      const response = await adminApi.banners.uploadBanner(formData)
      
      // Immediately add the new banner to the UI
      if (response.data && response.data.data) {
        setBanners(prevBanners => [...prevBanners, response.data.data])
      }
      
      toast.success('Banner uploaded successfully')
      
      // Refresh to ensure consistency
      await fetchBanners()
    } catch (error) {
      toast.error('Failed to upload banner')
      console.error('Error uploading banner:', error)
    } finally {
      setUploading(false)
    }
  }

  // Toggle banner status
  const toggleBannerStatus = async (bannerId) => {
    setOperationLoading(prev => ({ ...prev, [bannerId]: true }))
    try {
      // Optimistically update UI first
      setBanners(prevBanners => 
        prevBanners.map(banner => 
          banner._id === bannerId 
            ? { ...banner, isActive: !banner.isActive }
            : banner
        )
      )
      
      await adminApi.banners.toggleBannerStatus(bannerId)
      toast.success('Banner status updated')
      
      // Refresh to ensure consistency
      await fetchBanners()
    } catch (error) {
      // Revert optimistic update on error
      fetchBanners()
      toast.error('Failed to update banner status')
      console.error('Error toggling banner status:', error)
    } finally {
      setOperationLoading(prev => ({ ...prev, [bannerId]: false }))
    }
  }

  // Delete banner
  const deleteBanner = async (bannerId) => {
    setOperationLoading(prev => ({ ...prev, [bannerId]: true }))
    try {
      // Optimistically update UI first
      setBanners(prevBanners => prevBanners.filter(banner => banner._id !== bannerId))
      
      await adminApi.banners.deleteBanner(bannerId)
      toast.success('Banner deleted successfully')
      
      // Refresh to ensure consistency
      await fetchBanners()
    } catch (error) {
      // Revert optimistic update on error
      fetchBanners()
      toast.error('Failed to delete banner')
      console.error('Error deleting banner:', error)
    } finally {
      setOperationLoading(prev => ({ ...prev, [bannerId]: false }))
    }
  }

  // Reorder banners
  const reorderBanners = async (newOrder) => {
    try {
      const orderedIds = newOrder.map(banner => banner._id)
      await adminApi.banners.reorderBanners(orderedIds)
      toast.success('Banners reordered successfully')
      setBanners(newOrder)
    } catch (error) {
      toast.error('Failed to reorder banners')
      console.error('Error reordering banners:', error)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) return

    const newBanners = [...banners]
    const draggedBanner = newBanners[dragIndex]
    
    // Remove dragged item
    newBanners.splice(dragIndex, 1)
    // Insert at new position
    newBanners.splice(dropIndex, 0, draggedBanner)
    
    // Update order numbers
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      order: index + 1
    }))

    setBanners(updatedBanners)
    reorderBanners(updatedBanners)
    setDragIndex(null)
  }

  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  // Drop zone handlers
  const handleDropZone = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleDragOverZone = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    fetchBanners()
  }, [filter])

  const activeBanners = banners.filter(banner => banner.isActive)
  const inactiveBanners = banners.filter(banner => !banner.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground">
            Upload and manage your website banners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Upload Banner
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Banner
          </CardTitle>
          <CardDescription>
            Drag and drop an image here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDropZone}
            onDragOver={handleDragOverZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              Drop your image here
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Banners ({banners.length})</TabsTrigger>
          <TabsTrigger value="true">Active ({activeBanners.length})</TabsTrigger>
          <TabsTrigger value="false">Inactive ({inactiveBanners.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BannerGrid 
            banners={banners} 
            onToggleStatus={toggleBannerStatus}
            onDelete={deleteBanner}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dragIndex={dragIndex}
            operationLoading={operationLoading}
          />
        </TabsContent>

        <TabsContent value="true" className="space-y-4">
          <BannerGrid 
            banners={activeBanners} 
            onToggleStatus={toggleBannerStatus}
            onDelete={deleteBanner}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dragIndex={dragIndex}
            operationLoading={operationLoading}
          />
        </TabsContent>

        <TabsContent value="false" className="space-y-4">
          <BannerGrid 
            banners={inactiveBanners} 
            onToggleStatus={toggleBannerStatus}
            onDelete={deleteBanner}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dragIndex={dragIndex}
            operationLoading={operationLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Banner Grid Component
const BannerGrid = ({ 
  banners, 
  onToggleStatus, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  dragIndex,
  operationLoading 
}) => {
  if (banners.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Image className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No banners found</h3>
          <p className="text-sm text-gray-500">Upload your first banner to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {banners.map((banner, index) => (
          <motion.div
            key={banner._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className={`relative group cursor-move ${
              dragIndex === index ? 'opacity-50' : ''
            }`}
          >
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={banner.image.url}
                  alt={`Banner ${banner.order}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    Order: {banner.order}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-white bg-black/50 rounded p-1" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Uploaded: {new Date(banner.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(banner._id)}
                      disabled={operationLoading[banner._id]}
                      className="h-8 w-8 p-0"
                    >
                      {operationLoading[banner._id] ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : banner.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={operationLoading[banner._id]}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          {operationLoading[banner._id] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this banner? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(banner._id)}
                            disabled={operationLoading[banner._id]}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {operationLoading[banner._id] ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default BannerManagement
