import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/api'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  ArrowLeft,
  Save,
  Palette,
  Package,
  Image,
  Plus,
  Layers,
  Trash2
} from 'lucide-react'

// Constants
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const VariantAddForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [productLoading, setProductLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [product, setProduct] = useState(null)
  const [colors, setColors] = useState([])
  const [formData, setFormData] = useState({
    color: '',
    sizes: [{ size: 'M', stock: 0 }],
  })
  const [imageFiles, setImageFiles] = useState([])

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

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
      setProductLoading(true)
      const [productRes, colorsRes] = await Promise.all([
        adminApi.products.getProductById(id),
        adminApi.colors.getColors()
      ])
      
      const productData = productRes.data.data
      const colorsData = colorsRes.data.data || []
      
      setProduct(productData)
      setColors(colorsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch product data')
      navigate(`/admin/products/${id}/variants`)
    } finally {
      setProductLoading(false)
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

  // Handle image file changes
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files)
    setImageFiles(files)
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

  // Add variant
  const addVariant = async () => {
    if (!formData.color) {
      toast.error('Please select a color')
      return
    }

    if (!imageFiles || imageFiles.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    // Check if color already exists
    const existingVariant = product.variants?.find(v => 
      typeof v.color === 'object' ? v.color.name === formData.color : v.color === formData.color
    )
    if (existingVariant) {
      toast.error(`A variant with color '${formData.color}' already exists`)
      return
    }

    try {
      setLoading(true)
      
      const submitData = new FormData()
      submitData.append('color', formData.color)
      submitData.append('sizes', JSON.stringify(formData.sizes))
      
      // Add image files
      imageFiles.forEach((file, index) => {
        submitData.append('images', file)
      })

      console.log('Submitting variant data:', {
        color: formData.color,
        sizes: formData.sizes,
        imageCount: imageFiles.length
      })

      await adminApi.products.addVariant(id, submitData)
      
      toast.success('Variant added successfully!')
      setHasUnsavedChanges(false)
      navigate(`/admin/products/${id}/variants`)
    } catch (error) {
      console.error('Error adding variant:', error)
      const errorMessage = error.response?.data?.message || error.message
      toast.error(`Failed to add variant: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
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
              <h1 className="text-3xl font-bold">Add New Variant</h1>
              <p className="text-muted-foreground mt-1">{product.name}</p>
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="mt-2">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Variant Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                New Variant Details
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
                    {colors.map((color) => {
                      const isUsed = product.variants?.some(v => 
                        typeof v.color === 'object' ? v.color.name === color.name : v.color === color.name
                      )
                      return (
                        <SelectItem 
                          key={color._id} 
                          value={color.name}
                          disabled={isUsed}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            {color.name}
                            {isUsed && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                Used
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
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
                  <Label>Variant Images *</Label>
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
                  Upload images for this variant (at least one required)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Details */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-lg font-semibold">{product.category?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={product.isActive ? 'default' : 'secondary'} className="mt-1">
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Existing Variants */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Existing Variants</Label>
                  <Badge variant="outline" className="ml-2">
                    {product.variants?.length || 0}
                  </Badge>
                </div>
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((variant, index) => (
                      <div key={variant._id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                          style={{ backgroundColor: variant.color?.hexCode }}
                        />
                        <span className="text-sm font-medium">{variant.color?.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {variant.sizes?.length || 0} sizes
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button 
            onClick={addVariant}
            disabled={loading || !formData.color || imageFiles.length === 0}
            className="gap-2"
          >
            {loading ? 'Adding Variant...' : hasUnsavedChanges ? 'Save Changes' : 'Add Variant'}
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VariantAddForm
