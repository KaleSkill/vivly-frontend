import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/api'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

// Icons
import { 
  ArrowLeft,
  Save,
  Trash2,
  Palette,
  Package,
  Image,
  Plus,
  Layers
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Constants
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const VariantEditForm = () => {
  const { id, variantId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [variantLoading, setVariantLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [product, setProduct] = useState(null)
  const [variant, setVariant] = useState(null)
  const [colors, setColors] = useState([])
  const [formData, setFormData] = useState({
    color: '',
    sizes: [{ size: 'M', stock: 0 }],
    images: []
  })
  const [newImages, setNewImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])

  useEffect(() => {
    if (id && variantId) {
      fetchData()
    }
  }, [id, variantId])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Safe navigation function
  const safeNavigate = (path) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (confirmed) {
        navigate(path)
      }
    } else {
      navigate(path)
    }
  }

  const fetchData = async () => {
    try {
      setVariantLoading(true)
      const [productRes, colorsRes, variantRes] = await Promise.all([
        adminApi.products.getProductById(id),
        adminApi.colors.getColors(),
        adminApi.products.getVariantForEdit(id, variantId)
      ])
      
      const productData = productRes.data.data
      const variantData = variantRes.data.data
      const colorsData = colorsRes.data.data || []
      
      setProduct(productData)
      setColors(colorsData)
      
      // Find the variant in the product's variants array
      const foundVariant = productData.variants.find(v => v._id === variantId)
      if (foundVariant) {
        setVariant(foundVariant)
        setFormData({
          color: typeof foundVariant.color === 'object' ? foundVariant.color.name : foundVariant.color,
          sizes: foundVariant.sizes || [{ size: 'M', stock: 0 }],
          images: foundVariant.images || []
        })
      } else {
        toast.error('Variant not found')
        navigate(`/admin/products/edit/${id}`)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch variant data')
      navigate(`/admin/products/edit/${id}`)
    } finally {
      setVariantLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setHasUnsavedChanges(true)
  }

  // Add size to variant
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 'M', stock: 0 }]
    }))
    setHasUnsavedChanges(true)
  }

  // Remove size from variant
  const removeSize = (index) => {
    if (formData.sizes.length > 1) {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index)
      }))
      setHasUnsavedChanges(true)
    }
  }

  // Update size in variant
  const updateSize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
    setHasUnsavedChanges(true)
  }

  // Delete variant
  const deleteVariant = async () => {
    try {
      setLoading(true)
      const variantColor = typeof variant.color === 'object' ? variant.color.name : variant.color
      await adminApi.products.deleteVariant(id, variantColor)
      toast.success('Variant deleted successfully!')
      navigate(`/admin/products/${id}/variants`)
    } catch (error) {
      console.error('Error deleting variant:', error)
      toast.error(`Failed to delete variant: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle image file changes
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files)
    setImageFiles(files)
    setHasUnsavedChanges(true)
  }

  // Handle existing image deletion
  const toggleImageDeletion = (imageId) => {
    setImagesToDelete(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        return [...prev, imageId]
      }
    })
    setHasUnsavedChanges(true)
  }

  // Cleanup URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => {
        if (file && typeof file === 'object' && file.name) {
          URL.revokeObjectURL(URL.createObjectURL(file))
        }
      })
    }
  }, [imageFiles])

  // Update variant
  const updateVariant = async () => {
    if (!formData.color) {
      toast.error('Please select a color')
      return
    }

    try {
      setLoading(true)
      
      const submitData = new FormData()
      submitData.append('color', formData.color)
      submitData.append('sizes', JSON.stringify(formData.sizes))
      
      // Add images to delete if any
      if (imagesToDelete.length > 0) {
        submitData.append('imagesToDelete', JSON.stringify(imagesToDelete))
      }
      
      // Add new image files if any
      imageFiles.forEach((file, index) => {
        submitData.append('images', file)
      })

      const variantColor = typeof variant.color === 'object' ? variant.color.name : variant.color
      await adminApi.products.updateVariant(id, variantColor, submitData)
      
      toast.success('Variant updated successfully!')
      setHasUnsavedChanges(false)
      navigate(`/admin/products/${id}/variants`)
    } catch (error) {
      console.error('Error updating variant:', error)
      toast.error(`Failed to update variant: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (variantLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading variant...</p>
        </div>
      </div>
    )
  }

  if (!variant || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Variant not found</h2>
          <p className="mt-2 text-muted-foreground">The variant you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/admin/products/${id}/variants`)} className="mt-4">
            Back to Variants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => safeNavigate(`/admin/products/${id}/variants`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Variants
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Variant</h1>
              <p className="text-muted-foreground mt-1">{product.name}</p>
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="mt-2">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/admin/products/${id}/variants/add`)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Variant
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  disabled={loading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Variant
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this variant? This will permanently remove the variant "{typeof variant?.color === 'object' ? variant.color.name : variant?.color}" and all its images. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteVariant}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Variant
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                Edit Variant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Selection */}
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color._id} value={color.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <Label>Sizes *</Label>
                </div>
                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Select
                        value={size.size}
                        onValueChange={(value) => updateSize(index, 'size', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALLOWED_SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                        min="0"
                        className="flex-1"
                      />
                      {formData.sizes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSize(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSize}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Size
                  </Button>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <Label>Add New Images</Label>
                </div>
                
                {/* File Input */}
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  
                  {/* Image Preview */}
                  {imageFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Images:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => {
                                const newFiles = imageFiles.filter((_, i) => i !== index)
                                setImageFiles(newFiles)
                                setHasUnsavedChanges(true)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Upload new images to add alongside existing ones (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Variant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                Current Variant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Display */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: colors.find(c => c.name === (typeof variant.color === 'object' ? variant.color.name : variant.color))?.hexCode }}
                />
                <div>
                  <p className="font-semibold">
                    {typeof variant.color === 'object' ? variant.color.name : variant.color}
                  </p>
                  <p className="text-sm text-muted-foreground">Current color</p>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Current Sizes</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.sizes?.map((size, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {size.size}
                      <span className="text-xs opacity-70">({size.stock})</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Current Images</Label>
                  <Badge variant="outline" className="ml-2">
                    {variant.images?.length || 0}
                  </Badge>
                  {imagesToDelete.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {imagesToDelete.length} marked for deletion
                    </Badge>
                  )}
                </div>
                {variant.images && variant.images.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Click on images to mark them for deletion
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {variant.images.map((image, index) => {
                        const isMarkedForDeletion = imagesToDelete.includes(image.id)
                        return (
                          <div key={image.id} className="relative group">
                            <div 
                              className={`aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer transition-all ${
                                isMarkedForDeletion 
                                  ? 'ring-2 ring-destructive opacity-50' 
                                  : 'hover:ring-2 hover:ring-primary'
                              }`}
                              onClick={() => toggleImageDeletion(image.id)}
                            >
                              <img 
                                src={image.secure_url || image.url} 
                                alt={`Variant ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {isMarkedForDeletion && (
                              <div className="absolute inset-0 bg-destructive/20 rounded-lg flex items-center justify-center">
                                <div className="bg-destructive text-destructive-foreground rounded-full p-1">
                                  <Trash2 className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className={`rounded-full p-1 ${
                                isMarkedForDeletion ? 'bg-destructive text-destructive-foreground' : 'bg-background/80'
                              }`}>
                                <Trash2 className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button 
            onClick={updateVariant}
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Updating...' : hasUnsavedChanges ? 'Save Changes' : 'Update Variant'}
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VariantEditForm
