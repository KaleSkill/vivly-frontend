import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/api'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

// Icons
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Package,
  Palette,
  Image,
  Layers
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const VariantManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState({})

  // Fetch product details
  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await adminApi.products.getProductById(id)
      setProduct(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch product details')
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  // Delete variant
  const deleteVariant = async (color) => {
    setOperationLoading(prev => ({ ...prev, [color]: true }))
    try {
      await adminApi.products.deleteVariant(id, color)
      toast.success('Variant deleted successfully')
      await fetchProduct()
    } catch (error) {
      toast.error(`Failed to delete variant: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [color]: false }))
    }
  }

  // Edit variant
  const editVariant = (variantId) => {
    navigate(`/admin/products/${id}/variants/edit/${variantId}`)
  }

  if (loading) {
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
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate('/admin/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
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
            <div>
              <h1 className="text-3xl font-bold">Manage Variants</h1>
              <p className="text-muted-foreground mt-1">{product.name}</p>
            </div>
          </div>
        <Button
          onClick={() => navigate(`/admin/products/${id}/variants/add`)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
        </div>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">{product.category?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={product.isActive ? 'default' : 'secondary'} className="mt-1">
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variants Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                Product Variants
                <Badge variant="outline" className="ml-2">
                  {product.variants?.length || 0} variants
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!product.variants || product.variants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No variants found</h3>
                <p className="text-muted-foreground mb-6">Add your first variant to get started</p>
              <Button
                onClick={() => navigate(`/admin/products/${id}/variants/add`)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Variant
              </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.variants.map((variant) => {
                  const isOperationLoading = operationLoading[variant.color?.name]
                  const totalStock = variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0

                  return (
                    <div key={variant._id} className="group relative bg-card rounded-xl p-4 hover:bg-accent transition-colors">
                      {/* Variant Image */}
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                        {variant.orderImage ? (
                          <img
                            src={variant.orderImage.secure_url}
                            alt={variant.color?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Image className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Variant Info */}
                      <div className="space-y-3">
                        {/* Color */}
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: variant.color?.hexCode }}
                          />
                          <span className="font-semibold">{variant.color?.name}</span>
                        </div>

                        {/* Sizes */}
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Sizes</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {variant.sizes?.map((size, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {size.size}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stock & Images */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{totalStock} total stock</span>
                          <span>{variant.images?.length || 0} images</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editVariant(variant._id)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isOperationLoading}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {isOperationLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the {variant.color?.name} variant and remove all its images.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteVariant(variant.color?.name)}
                                  disabled={isOperationLoading}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isOperationLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Variant'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VariantManagement
