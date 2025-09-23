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
// Icons
import { 
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Percent,
  Calendar,
  Package,
  CheckCircle,
  X
} from 'lucide-react'

const SaleCreateStepper = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    products: [],
    startDate: '',
    endDate: ''
  })

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

    setLoading(true)
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        products: formData.products.map(p => p._id),
        startDate: formData.startDate,
        endDate: formData.endDate
      }

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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter sale description (optional)"
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

              {/* Available Products Grid */}
              <div className="space-y-2">
                <Label>Available Products ({products.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {products.map((product) => {
                    const isSelected = formData.products.find(p => p._id === product._id);
                    return (
                      <div
                        key={product._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                            : 'hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => isSelected ? removeProduct(product._id) : addProduct(product._id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {product.variants?.[0]?.orderImage?.secure_url ? (
                              <img
                                src={product.variants[0].orderImage.secure_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.variants?.length || 0} variants
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{typeof product.nonSalePrice === 'object' ? product.nonSalePrice?.price || 'N/A' : product.nonSalePrice || 'N/A'}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Products Summary */}
              {formData.products.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Products ({formData.products.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.products.map((product) => (
                      <Badge key={product._id} variant="secondary" className="gap-1">
                        {product.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(product._id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
