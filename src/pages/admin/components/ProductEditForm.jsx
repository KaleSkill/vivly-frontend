import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../../api/api'

// Constants
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Checkbox } from '../../../components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import UploaderComp from '../../../components/ui/uploader-comp'

// Icons
import { 
  Plus,
  Trash2,
  X,
  Package,
  Palette,
  DollarSign,
  Settings,
  ArrowLeft,
  Save,
  Upload,
  Edit
} from 'lucide-react'

const ProductEditForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [productLoading, setProductLoading] = useState(true)
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
    salePrice: {
      price: '',
      discountedPrice: ''
    },
    isOnSale: false,
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
  const [currentVariantFiles, setCurrentVariantFiles] = useState([])
  const [isEditVariantDialogOpen, setIsEditVariantDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)

  // Fetch product data and categories/colors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes, colorsRes] = await Promise.all([
          adminApi.products.getProductById(id),
          adminApi.categories.getCategories(),
          adminApi.colors.getColors()
        ])
        
        const product = productRes.data.data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category?.name || '',
          nonSalePrice: {
            price: product.nonSalePrice?.price || '',
            discountedPrice: product.nonSalePrice?.discountedPrice || ''
          },
          salePrice: {
            price: product.salePrice?.price || '',
            discountedPrice: product.salePrice?.discountedPrice || ''
          },
          isOnSale: product.isOnSale || false,
          specifications: product.specifications || [{ title: '', description: '' }],
          variants: product.variants || [],
          paymentOptions: product.paymentOptions || { cod: true, online: true },
          isActive: product.isActive !== undefined ? product.isActive : true
        })
        
        setCategories(categoriesRes.data.data || [])
        setColors(colorsRes.data.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch product data')
      } finally {
        setProductLoading(false)
      }
    }
    
    if (id) {
      fetchData()
    }
  }, [id])

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
  const handleFileUpload = (files) => {
    setCurrentVariantFiles(files)
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

    if (!currentVariantFiles || currentVariantFiles.length === 0) {
      toast.error('Please upload at least one image for this variant')
      return
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        ...currentVariant,
        images: currentVariantFiles.map(file => ({ file: file.file }))
      }]
    }))

    // Store files for this variant
    setUploadedFiles(prev => ({
      ...prev,
      [currentVariant.color]: currentVariantFiles.map(file => file.file)
    }))

    // Reset current variant
    setCurrentVariant({
      color: '',
      sizes: [{ size: 'M', stock: 0 }],
      images: []
    })
    setCurrentVariantFiles([])
  }

  // Remove variant
  const removeVariant = (color) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.color !== color)
    }))
  }

  // Edit variant
  const editVariant = (variant) => {
    setEditingVariant(variant)
    setCurrentVariant({
      color: typeof variant.color === 'object' ? variant.color.name : variant.color,
      sizes: variant.sizes || [{ size: 'M', stock: 0 }],
      images: variant.images || []
    })
    setCurrentVariantFiles([])
    setIsEditVariantDialogOpen(true)
  }

  // Add size to variant
  const addSizeToVariant = () => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 'M', stock: 0 }]
    }))
  }

  // Remove size from variant
  const removeSizeFromVariant = (index) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  // Update size in variant
  const updateSizeInVariant = (index, field, value) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  // Update variant
  const updateVariant = () => {
    if (!currentVariant.color) {
      toast.error('Please select a color')
      return
    }

    const updatedVariants = formData.variants.map(variant => {
      const variantColor = typeof variant.color === 'object' ? variant.color.name : variant.color
      const editingColor = typeof editingVariant.color === 'object' ? editingVariant.color.name : editingVariant.color
      
      if (variantColor === editingColor) {
        return {
          ...variant,
          color: currentVariant.color,
          sizes: currentVariant.sizes,
          images: currentVariantFiles.length > 0 ? currentVariantFiles.map(file => ({ file: file.file })) : variant.images
        }
      }
      return variant
    })

    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }))

    setIsEditVariantDialogOpen(false)
    setEditingVariant(null)
    setCurrentVariant({
      color: '',
      sizes: [{ size: 'M', stock: 0 }],
      images: []
    })
    setCurrentVariantFiles([])
    
    toast.success(`Variant "${currentVariant.color}" updated successfully!`)
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
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
      submitData.append('salePrice', JSON.stringify(formData.salePrice))
      submitData.append('isOnSale', formData.isOnSale.toString())
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

      const response = await adminApi.products.updateProduct(id, submitData)
      toast.success('Product updated successfully!')
      navigate(`/admin/products/preview/${id}`)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
        </div>

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
                  {/* Regular Pricing */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Regular Pricing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Original Price (₹) *</Label>
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
                        <Label htmlFor="discountedPrice">Discounted Price (₹) *</Label>
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
                  </div>

                  {/* Sale Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOnSale"
                        checked={formData.isOnSale}
                        onCheckedChange={(checked) => handleInputChange('isOnSale', checked)}
                      />
                      <Label htmlFor="isOnSale">Enable Sale Pricing</Label>
                    </div>
                    
                    {formData.isOnSale && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="salePrice">Sale Original Price (₹) *</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            value={formData.salePrice.price}
                            onChange={(e) => handleInputChange('salePrice.price', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required={formData.isOnSale}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="saleDiscountedPrice">Sale Discounted Price (₹) *</Label>
                          <Input
                            id="saleDiscountedPrice"
                            type="number"
                            value={formData.salePrice.discountedPrice}
                            onChange={(e) => handleInputChange('salePrice.discountedPrice', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required={formData.isOnSale}
                          />
                        </div>
                      </div>
                    )}
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
                      <UploaderComp
                        maxSizeMB={5}
                        maxFiles={10}
                        onFilesChange={handleFileUpload}
                        initialFiles={[]}
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
                                style={{ backgroundColor: colors.find(c => c.name === (typeof variant.color === 'object' ? variant.color.name : variant.color))?.hexCode }}
                              />
                              <span className="font-medium">{typeof variant.color === 'object' ? variant.color.name : variant.color}</span>
                              <Badge variant="outline">{variant.sizes.length} sizes</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/products/${id}/variants/edit/${variant._id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeVariant(typeof variant.color === 'object' ? variant.color.name : variant.color)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? 'Updating...' : 'Update Product'}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Edit Variant Dialog */}
        <Dialog open={isEditVariantDialogOpen} onOpenChange={setIsEditVariantDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Variant</DialogTitle>
              <DialogDescription>
                Update the variant details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Color Selection */}
              <div className="space-y-2">
                <Label htmlFor="editColor">Color *</Label>
                <Select value={currentVariant.color} onValueChange={(value) => handleInputChange('currentVariant.color', value)}>
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
                  {currentVariant.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={size.size}
                        onValueChange={(value) => updateSizeInVariant(index, 'size', value)}
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
                        onChange={(e) => updateSizeInVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-24"
                      />
                      {currentVariant.sizes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSizeFromVariant(index)}
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
                    onClick={addSizeToVariant}
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
                  onFilesChange={setCurrentVariantFiles}
                  initialFiles={[]}
                />
                <p className="text-sm text-muted-foreground">
                  Upload new images to replace existing ones (optional)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditVariantDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateVariant}>
                Update Variant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductEditForm
