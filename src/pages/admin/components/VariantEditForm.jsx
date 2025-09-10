import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'
import UploaderComp from '../../../components/ui/uploader-comp'

// Icons
import { 
  ArrowLeft,
  Save,
  Trash2,
  Palette,
  Package,
  Image,
  Plus
} from 'lucide-react'

// Constants
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const VariantEditForm = () => {
  const { id, variantId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [variantLoading, setVariantLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [variant, setVariant] = useState(null)
  const [colors, setColors] = useState([])
  const [formData, setFormData] = useState({
    color: '',
    sizes: [{ size: 'M', stock: 0 }],
    images: []
  })
  const [newImages, setNewImages] = useState([])

  useEffect(() => {
    if (id && variantId) {
      fetchData()
    }
  }, [id, variantId])

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
  }

  // Add size to variant
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 'M', stock: 0 }]
    }))
  }

  // Remove size from variant
  const removeSize = (index) => {
    if (formData.sizes.length > 1) {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index)
      }))
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
  }

  // Delete variant
  const deleteVariant = async () => {
    try {
      setLoading(true)
      const variantColor = typeof variant.color === 'object' ? variant.color.name : variant.color
      await adminApi.products.deleteVariant(id, variantColor)
      toast.success('Variant deleted successfully!')
      navigate(`/admin/products/edit/${id}`)
    } catch (error) {
      console.error('Error deleting variant:', error)
      toast.error(`Failed to delete variant: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

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
      
      // Add new images if any
      newImages.forEach((fileObj, index) => {
        submitData.append(`${formData.color}_${index}`, fileObj.file)
      })
      
      // Add order image if new files uploaded
      if (newImages[0]) {
        submitData.append(`orderImage_${formData.color}`, newImages[0].file)
      }

      const variantColor = typeof variant.color === 'object' ? variant.color.name : variant.color
      await adminApi.products.updateVariant(id, variantColor, submitData)
      
      toast.success('Variant updated successfully!')
      navigate(`/admin/products/edit/${id}`)
    } catch (error) {
      console.error('Error updating variant:', error)
      toast.error(`Failed to update variant: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }


  if (variantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading variant...</p>
        </div>
      </div>
    )
  }

  if (!variant || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Variant not found</h2>
          <p className="mt-2 text-gray-600">The variant you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/admin/products/edit/${id}`)} className="mt-4">
            Back to Product Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/products/edit/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product Edit
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Variant</h1>
              <p className="text-gray-600 mt-1">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Variant
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Variant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Variant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            className="w-4 h-4 rounded border"
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
              <div className="space-y-2">
                <Label>Sizes *</Label>
                <div className="space-y-2">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2">
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
                        className="w-24"
                      />
                      {formData.sizes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSize(index)}
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
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Update Images</Label>
                <UploaderComp
                  maxFiles={10}
                  maxSizeMB={5}
                  onFilesChange={setNewImages}
                  initialFiles={[]}
                />
                <p className="text-sm text-muted-foreground">
                  Upload new images to replace existing ones (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Variant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Current Variant Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Display */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: colors.find(c => c.name === (typeof variant.color === 'object' ? variant.color.name : variant.color))?.hexCode }}
                />
                <span className="font-medium">
                  {typeof variant.color === 'object' ? variant.color.name : variant.color}
                </span>
              </div>

              {/* Sizes */}
              <div>
                <Label className="text-sm font-medium">Current Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variant.sizes?.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size.size} ({size.stock} stock)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <Label className="text-sm font-medium">Current Images</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Image className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{variant.images?.length || 0} images</span>
                </div>
                {variant.images && variant.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {variant.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden border">
                        <img 
                          src={image.secure_url || image.url} 
                          alt={`Variant ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={updateVariant}
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Updating...' : 'Update Variant'}
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VariantEditForm
