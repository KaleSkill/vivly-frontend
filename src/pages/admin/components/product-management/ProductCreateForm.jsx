import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/api'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
// Removed UploaderComp import - using simple file input instead

// Icons
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

const ProductCreateForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [availableSizes] = useState(['S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
  // Main product image state removed - only variant images are used

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    gender: 'unisex',
    images: [],
    variants: [],
    specifications: [
      { title: 'Material', description: 'High quality material' },
      { title: 'Care Instructions', description: 'Machine washable' }
    ],
    isOnSale: false,
    salePrice: {
      price: 0,
      discountedPrice: 0,
      discount: 0
    },
    nonSalePrice: {
      price: '',
      discountedPrice: '',
      discount: 0
    }
  })

  const [currentVariant, setCurrentVariant] = useState({
    color: '',
    sizes: [{ size: 'M', stock: 0 }],
    images: []
  })

  const [currentVariantFiles, setCurrentVariantFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Fetch categories and colors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, colorsRes] = await Promise.all([
          adminApi.categories.getCategories(),
          adminApi.colors.getColors()
        ])
        setCategories(categoriesRes.data.data || [])
        setColors(colorsRes.data.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
    }
  }, [imagePreviews])

  // File upload handlers removed - using direct file input instead

  // Add size to current variant
  const addSize = () => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 'M', stock: 0 }]
    }))
  }

  // Remove size from current variant
  const removeSize = (index) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  // Update size in current variant
  const updateSize = (index, field, value) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  // Add variant
  const addVariant = () => {
    if (!currentVariant.color) {
      toast.error('Please select a color')
      return
    }

    if (currentVariant.sizes.length === 0) {
      toast.error('Please add at least one size')
      return
    }

    // Check if color already exists
    const existingVariant = formData.variants.find(v => v.color === currentVariant.color)
    if (existingVariant) {
      toast.error('Variant with this color already exists')
      return
    }

    // Store the color before resetting
    const addedColor = currentVariant.color

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        ...currentVariant,
        images: currentVariantFiles.map(file => ({ file: file.file }))
      }]
    }))

    // Reset current variant form completely
    setCurrentVariant({
      color: '',
      sizes: [{ size: 'M', stock: 0 }],
      images: []
    })
    setCurrentVariantFiles([])
    
    // Clear image previews and revoke URLs
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
    setImagePreviews([])
    
    // Clear the file input
    const variantImageInput = document.getElementById('variantImages')
    if (variantImageInput) {
      variantImageInput.value = ''
    }

    toast.success(`Variant "${addedColor}" added successfully!`)
  }

  // Remove variant
  const removeVariant = (color) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.color !== color)
    }))
  }

  // Clear variant form
  const clearVariantForm = () => {
    setCurrentVariant({
      color: '',
      sizes: [{ size: 'M', stock: 0 }],
      images: []
    })
    setCurrentVariantFiles([])
    
    // Clear image previews and revoke URLs
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
    setImagePreviews([])
    
    // Clear the file input
    const variantImageInput = document.getElementById('variantImages')
    if (variantImageInput) {
      variantImageInput.value = ''
    }
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.variants.length === 0) {
      toast.error('Please add at least one variant')
      return
    }

    // Validate pricing
    if (!formData.nonSalePrice.price || formData.nonSalePrice.price <= 0) {
      toast.error('Please enter a valid price (greater than 0)')
      return
    }

    if (formData.nonSalePrice.discountedPrice && formData.nonSalePrice.discountedPrice > formData.nonSalePrice.price) {
      toast.error('Discounted price cannot be greater than original price')
      return
    }

    if (formData.isOnSale) {
      if (formData.salePrice.price <= 0) {
        toast.error('Please enter a valid sale price (greater than 0)')
        return
      }
      if (formData.salePrice.discountedPrice > formData.salePrice.price) {
        toast.error('Sale discounted price cannot be greater than sale price')
        return
      }
    }

    // Main product images validation removed - only variant images are required

    setLoading(true)
    try {
      // Prepare data in the format expected by the backend
      const submitData = new FormData()
      
      // Add basic fields
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('gender', formData.gender)
      submitData.append('isActive', 'true')
      
      // Add specifications as JSON string
      submitData.append('specifications', JSON.stringify(formData.specifications))
      
      // Add pricing as JSON strings
      const processedNonSalePrice = {
        price: formData.nonSalePrice.price || 0,
        discountedPrice: formData.nonSalePrice.discountedPrice || 0,
        discount: formData.nonSalePrice.discount || 0
      }
      console.log('Non-sale price being sent:', processedNonSalePrice)
      submitData.append('nonSalePrice', JSON.stringify(processedNonSalePrice))
      
      if (formData.isOnSale) {
        const processedSalePrice = {
          price: formData.salePrice.price || 0,
          discountedPrice: formData.salePrice.discountedPrice || 0,
          discount: formData.salePrice.discount || 0
        }
        submitData.append('salePrice', JSON.stringify(processedSalePrice))
        submitData.append('isOnSale', 'true')
      } else {
        submitData.append('isOnSale', 'false')
      }
      
      // Add variants as JSON string
      console.log('Variants being sent:', formData.variants)
      submitData.append('variants', JSON.stringify(formData.variants))
      
      // Main product images removed - only variant images are used
      
      // Add variant images with proper field names
      formData.variants.forEach((variant, variantIndex) => {
        // Add variant images (for gallery)
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((img, imgIndex) => {
            submitData.append(variant.color, img.file)
          })
        }
        
        // Add order image (first image as order image)
        if (variant.images && variant.images.length > 0) {
          submitData.append(`orderImage_${variant.color}`, variant.images[0].file)
        }
      })

      const response = await adminApi.products.createProduct(submitData)
      toast.success('Product created successfully!')
      navigate('/admin/products')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create product'
      toast.error(errorMessage)
      console.error('Error creating product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/products')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product Images removed - only variant images are used */}

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Product Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div className="space-y-2">
                  <Label htmlFor={`spec-title-${index}`}>Specification Title</Label>
                  <Input
                    id={`spec-title-${index}`}
                    value={spec.title}
                    onChange={(e) => {
                      const newSpecs = [...formData.specifications]
                      newSpecs[index].title = e.target.value
                      setFormData(prev => ({ ...prev, specifications: newSpecs }))
                    }}
                    placeholder="e.g., Material, Care Instructions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`spec-desc-${index}`}>Description</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`spec-desc-${index}`}
                      value={spec.description}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications]
                        newSpecs[index].description = e.target.value
                        setFormData(prev => ({ ...prev, specifications: newSpecs }))
                      }}
                      placeholder="e.g., 100% Cotton, Machine washable"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newSpecs = formData.specifications.filter((_, i) => i !== index)
                        setFormData(prev => ({ ...prev, specifications: newSpecs }))
                      }}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  specifications: [...prev.specifications, { title: '', description: '' }]
                }))
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice" className="text-red-600 font-semibold">Regular Price *</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  value={formData.nonSalePrice.price}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nonSalePrice: { ...prev.nonSalePrice, price: e.target.value ? parseFloat(e.target.value) : '' }
                  }))}
                  placeholder="Enter price (e.g., 99.99)"
                  min="0"
                  step="0.01"
                  required
                  className={!formData.nonSalePrice.price ? "border-red-500" : ""}
                />
                {!formData.nonSalePrice.price && (
                  <p className="text-sm text-red-500">Price is required</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="regularDiscountedPrice">Regular Discounted Price</Label>
                <Input
                  id="regularDiscountedPrice"
                  type="number"
                  value={formData.nonSalePrice.discountedPrice}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nonSalePrice: { ...prev.nonSalePrice, discountedPrice: e.target.value ? parseFloat(e.target.value) : '' }
                  }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOnSale"
                checked={formData.isOnSale}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnSale: checked }))}
              />
              <Label htmlFor="isOnSale">Enable Sale Pricing</Label>
            </div>

            {formData.isOnSale && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Original Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice.price}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salePrice: { ...prev.salePrice, price: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleDiscountedPrice">Sale Discounted Price</Label>
                  <Input
                    id="saleDiscountedPrice"
                    type="number"
                    value={formData.salePrice.discountedPrice}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salePrice: { ...prev.salePrice, discountedPrice: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Variant Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">Add New Variant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantColor">Color *</Label>
                  <Select
                    value={currentVariant.color}
                    onValueChange={(value) => setCurrentVariant(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color._id} value={color.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variantImages">Variant Images</Label>
                  <Input
                    id="variantImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      setCurrentVariantFiles(files.map(file => ({ file })))
                      
                      // Create image previews
                      const previews = files.map(file => URL.createObjectURL(file))
                      setImagePreviews(previews)
                    }}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <Label>Image Previews</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            // Remove preview and file
                            const newPreviews = imagePreviews.filter((_, i) => i !== index)
                            const newFiles = currentVariantFiles.filter((_, i) => i !== index)
                            setImagePreviews(newPreviews)
                            setCurrentVariantFiles(newFiles)
                            
                            // Revoke URL to prevent memory leak
                            URL.revokeObjectURL(preview)
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Sizes & Stock</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSize}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Size
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {currentVariant.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={size.size}
                        onValueChange={(value) => updateSize(index, 'size', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSizes.map(availableSize => (
                            <SelectItem key={availableSize} value={availableSize}>
                              {availableSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        min="0"
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSize(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
                <Button type="button" variant="outline" onClick={clearVariantForm}>
                  Clear Form
                </Button>
              </div>
            </div>

            {/* Existing Variants */}
            {formData.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Added Variants</h3>
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{variant.color}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {variant.sizes.length} sizes
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(variant.color)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Product...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductCreateForm
