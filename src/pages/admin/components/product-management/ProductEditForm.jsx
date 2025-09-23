import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/api'
import useProductStore from '@/store/productStore'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'  
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icons
import { 
  Plus,
  X,
  Package,
  DollarSign,
  Settings,
  ArrowLeft,
  Save
} from 'lucide-react'

const ProductEditForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [productLoading, setProductLoading] = useState(true)
  const [categories, setCategories] = useState([])
  
  // Zustand store
  const {
    editFormData,
    hasUnsavedChanges,
    setEditFormData,
    updateEditFormData,
    clearUnsavedChanges,
    resetEditForm
  } = useProductStore()

  // Fetch product data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          adminApi.products.getProductById(id),
          adminApi.categories.getCategories()
        ])
        
        const product = productRes.data.data
        const formData = {
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
          paymentOptions: product.paymentOptions || { cod: true, online: true },
          isActive: product.isActive !== undefined ? product.isActive : true
        }
        setEditFormData(formData)
        
        setCategories(categoriesRes.data.data || [])
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
        resetEditForm()
        navigate(path)
      }
    } else {
      navigate(path)
    }
  }

  // Add specification
  const addSpecification = () => {
    if (!editFormData) return
    const newSpecs = [...editFormData.specifications, { title: '', description: '' }]
    updateEditFormData('specifications', newSpecs)
  }

  // Remove specification
  const removeSpecification = (index) => {
    if (!editFormData) return
    const newSpecs = editFormData.specifications.filter((_, i) => i !== index)
    updateEditFormData('specifications', newSpecs)
  }

  // Update specification
  const updateSpecification = (index, field, value) => {
    if (!editFormData) return
    const newSpecs = editFormData.specifications.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    )
    updateEditFormData('specifications', newSpecs)
  }

  // Submit form
  const handleSubmit = async () => {
    if (!editFormData) {
      toast.error('No form data available')
      return
    }
    
    if (!editFormData.name || !editFormData.description || !editFormData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create FormData for multipart upload
      const submitData = new FormData()
      
      // Add basic product data
      submitData.append('name', editFormData.name)
      submitData.append('description', editFormData.description)
      submitData.append('category', editFormData.category)
      submitData.append('nonSalePrice', JSON.stringify(editFormData.nonSalePrice))
      
      // Only send sale price data if sale is enabled
      if (editFormData.isOnSale) {
        submitData.append('salePrice', JSON.stringify(editFormData.salePrice))
      }
      
      submitData.append('isOnSale', editFormData.isOnSale.toString())
      submitData.append('specifications', JSON.stringify(editFormData.specifications))
      submitData.append('paymentOptions', JSON.stringify(editFormData.paymentOptions))
      submitData.append('isActive', editFormData.isActive)

      // Debug: Log the data being sent
      console.log('Sending product update data:', {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        nonSalePrice: editFormData.nonSalePrice,
        salePrice: editFormData.salePrice,
        isOnSale: editFormData.isOnSale,
        specifications: editFormData.specifications,
        paymentOptions: editFormData.paymentOptions,
        isActive: editFormData.isActive
      })

      const response = await adminApi.products.updateProduct(id, submitData)
      toast.success('Product updated successfully!')
      clearUnsavedChanges()
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
              onClick={() => safeNavigate('/admin/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Edit Product</h1>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="ml-2">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/products/${id}/variants`)}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Manage Variants
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                      value={editFormData?.name || ''}
                      onChange={(e) => updateEditFormData('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={editFormData?.description || ''}
                      onChange={(e) => updateEditFormData('description', e.target.value)}
                      placeholder="Enter product description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={editFormData?.category || ''} onValueChange={(value) => updateEditFormData('category', value)}>
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
                      checked={editFormData?.isActive || false}
                      onCheckedChange={(checked) => updateEditFormData('isActive', checked)}
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
                          value={editFormData?.nonSalePrice?.price || ''}
                          onChange={(e) => updateEditFormData('nonSalePrice.price', e.target.value)}
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
                          value={editFormData?.nonSalePrice?.discountedPrice || ''}
                          onChange={(e) => updateEditFormData('nonSalePrice.discountedPrice', e.target.value)}
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
                        checked={editFormData?.isOnSale || false}
                        onCheckedChange={(checked) => updateEditFormData('isOnSale', checked)}
                      />
                      <Label htmlFor="isOnSale">Enable Sale Pricing</Label>
                    </div>
                    
                    {editFormData?.isOnSale && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="salePrice">Sale Original Price (₹) *</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            value={editFormData?.salePrice?.price || ''}
                            onChange={(e) => updateEditFormData('salePrice.price', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required={editFormData?.isOnSale}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="saleDiscountedPrice">Sale Discounted Price (₹) *</Label>
                          <Input
                            id="saleDiscountedPrice"
                            type="number"
                            value={editFormData?.salePrice?.discountedPrice || ''}
                            onChange={(e) => updateEditFormData('salePrice.discountedPrice', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required={editFormData?.isOnSale}
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
                          checked={editFormData?.paymentOptions?.cod || false}
                          onCheckedChange={(checked) => updateEditFormData('paymentOptions.cod', checked)}
                        />
                        <Label htmlFor="cod">Cash on Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="online"
                          checked={editFormData?.paymentOptions?.online || false}
                          onCheckedChange={(checked) => updateEditFormData('paymentOptions.online', checked)}
                        />
                        <Label htmlFor="online">Online Payment</Label>
                      </div>
                    </div>
                  </div>
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
                  {editFormData?.specifications?.map((spec, index) => (
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
                        disabled={editFormData?.specifications?.length === 1}
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
            <Button type="button" variant="outline" onClick={() => safeNavigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="button" disabled={loading} onClick={handleSubmit} className="gap-2">
              {loading ? 'Updating...' : hasUnsavedChanges ? 'Save Changes' : 'Update Product'}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductEditForm
