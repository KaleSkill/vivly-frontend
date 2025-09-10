import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Checkbox } from '../../../components/ui/checkbox'

// Icons
import { 
  Plus,
  Trash2,
  Upload,
  X,
  Package,
  Palette,
  DollarSign,
  Settings
} from 'lucide-react'

const ProductCreateForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    nonSalePrice: {
      price: '',
      discountedPrice: ''
    },
    specifications: [{ title: '', description: '' }],
    variants: [],
    paymentOptions: {
      cod: true,
      online: true
    },
    isActive: true
  })
  const [currentVariant, setCurrentVariant] = useState({
    color: '',
    sizes: [{ size: 'M', stock: 0 }],
    images: []
  })
  const [uploadedFiles, setUploadedFiles] = useState({})

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

  // Add specification
  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { title: '', description: '' }]
    }))
  }

  // Remove specification
  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  // Update specification
  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }))
  }

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

  // Update size
  const updateSize = (index, field, value) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  // Handle file upload for variant
  const handleFileUpload = (color, files) => {
    setUploadedFiles(prev => ({
      ...prev,
      [color]: files
    }))
  }

  // Add variant
  const addVariant = () => {
    if (!currentVariant.color) {
      toast.error('Please select a color')
      return
    }

    const variantExists = formData.variants.some(v => v.color === currentVariant.color)
    if (variantExists) {
      toast.error('Variant with this color already exists')
      return
    }

    const files = uploadedFiles[currentVariant.color]
    if (!files || files.length === 0) {
      toast.error('Please upload at least one image for this variant')
      return
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        ...currentVariant,
        images: files.map(file => ({ file }))
      }]
    }))

    // Reset current variant
    setCurrentVariant({
      color: '',
      sizes: [{ size: 'M', stock: 0 }],
      images: []
    })
  }

  // Remove variant
  const removeVariant = (color) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.color !== color)
    }))
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

    setLoading(true)
    try {
      // Create FormData for multipart upload
      const submitData = new FormData()
      
      // Add basic product data
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('nonSalePrice', JSON.stringify(formData.nonSalePrice))
      submitData.append('specifications', JSON.stringify(formData.specifications))
      submitData.append('paymentOptions', JSON.stringify(formData.paymentOptions))
      submitData.append('isActive', formData.isActive)

      // Add variants data
      const variantsData = formData.variants.map(variant => ({
        color: variant.color,
        sizes: variant.sizes
      }))
      submitData.append('variants', JSON.stringify(variantsData))

      // Add image files
      formData.variants.forEach(variant => {
        const files = uploadedFiles[variant.color]
        if (files) {
          files.forEach((file, index) => {
            submitData.append(`${variant.color}`, file)
          })
          // Add order image (first image as order image)
          if (files[0]) {
            submitData.append(`orderImage_${variant.color}`, files[0])
          }
        }
      })

      const response = await adminApi.products.createProduct(submitData)
      toast.success('Product created successfully!')
      onSuccess && onSuccess(response.data.data)
      onClose()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(`Failed to create product: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Product is active</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Original Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.nonSalePrice.price}
                    onChange={(e) => handleInputChange('nonSalePrice.price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price *</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    value={formData.nonSalePrice.discountedPrice}
                    onChange={(e) => handleInputChange('nonSalePrice.discountedPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Payment Options</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cod"
                      checked={formData.paymentOptions.cod}
                      onCheckedChange={(checked) => handleInputChange('paymentOptions.cod', checked)}
                    />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online"
                      checked={formData.paymentOptions.online}
                      onCheckedChange={(checked) => handleInputChange('paymentOptions.online', checked)}
                    />
                    <Label htmlFor="online">Online Payment</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants */}
        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Product Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Variant Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Variant</h4>
                
                <div className="space-y-2">
                  <Label>Color *</Label>
                  <Select value={currentVariant.color} onValueChange={(value) => setCurrentVariant(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
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
                  <div className="flex items-center justify-between">
                    <Label>Sizes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSize}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  {currentVariant.sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <Select value={size.size} onValueChange={(value) => updateSize(index, 'size', value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                          <SelectItem value="XXXL">XXXL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        min="0"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSize(index)}
                        disabled={currentVariant.sizes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Images *</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(currentVariant.color, Array.from(e.target.files))}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload multiple images for this variant
                  </p>
                </div>

                <Button type="button" onClick={addVariant} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>

              {/* Added Variants */}
              {formData.variants.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Variants</Label>
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: colors.find(c => c.name === variant.color)?.hexCode }}
                          />
                          <span className="font-medium">{variant.color}</span>
                          <Badge variant="outline">{variant.sizes.length} sizes</Badge>
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
        </TabsContent>

        {/* Specifications */}
        <TabsContent value="specs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={spec.title}
                    onChange={(e) => updateSpecification(index, 'title', e.target.value)}
                    placeholder="Specification title"
                    className="flex-1"
                  />
                  <Input
                    value={spec.description}
                    onChange={(e) => updateSpecification(index, 'description', e.target.value)}
                    placeholder="Specification description"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpecification(index)}
                    disabled={formData.specifications.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSpecification}>
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}

export default ProductCreateForm
