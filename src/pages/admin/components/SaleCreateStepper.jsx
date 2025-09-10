import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import UploaderComp from '../../../components/ui/uploader-comp'

// Icons
import { 
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Percent,
  Calendar,
  Package,
  Image
} from 'lucide-react'

const SaleCreateStepper = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    products: [],
    startDate: '',
    endDate: '',
    banner_image: null
  })
  const [bannerFiles, setBannerFiles] = useState([])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminApi.products.getProducts({ isActive: 'true' })
        setProducts(response.data.data.products || [])
      } catch (error) {
        toast.error('Failed to fetch products')
      }
    }
    fetchProducts()
  }, [])

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle banner file upload
  const handleBannerUpload = (files) => {
    setBannerFiles(files)
  }

  // Add product to sale
  const addProduct = (productId) => {
    const product = products.find(p => p._id === productId)
    if (product && !formData.products.find(p => p._id === productId)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, product]
      }))
    }
  }

  // Remove product from sale
  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p._id !== productId)
    }))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.startDate || !formData.endDate || formData.products.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!bannerFiles || bannerFiles.length === 0) {
      toast.error('Please upload a banner image')
      return
    }

    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('products', JSON.stringify(formData.products))
      submitData.append('startDate', formData.startDate)
      submitData.append('endDate', formData.endDate)
      submitData.append('banner_image', bannerFiles[0].file)

      const response = await adminApi.sales.createSale(submitData)
      toast.success('Sale created successfully!')
      navigate('/admin/sales')
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error(`Failed to create sale: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
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
              onClick={() => navigate('/admin/sales')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sales
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Create Sale</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Sale Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sale Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter sale name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add Products *</Label>
                <Select onValueChange={addProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select products to add to sale" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Products */}
              {formData.products.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Products ({formData.products.length})</Label>
                  <div className="space-y-2">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                            {product.variants?.[0]?.orderImage?.secure_url ? (
                              <img
                                src={product.variants[0].orderImage.secure_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.variants?.length || 0} variants
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(product._id)}
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

          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Image *</Label>
                <UploaderComp
                  maxSizeMB={5}
                  maxFiles={1}
                  onFilesChange={handleBannerUpload}
                  initialFiles={[]}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a banner image for this sale
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/sales')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? 'Creating...' : 'Create Sale'}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SaleCreateStepper
