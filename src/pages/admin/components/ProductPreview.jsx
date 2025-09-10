import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

// Icons
import { 
  ArrowLeft,
  Edit,
  Share2,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Palette,
  DollarSign,
  Calendar,
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react'

const ProductPreview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await adminApi.products.getProductById(id)
        setProduct(response.data.data)
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to fetch product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  // Format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numPrice)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get current variant
  const currentVariant = product?.variants?.[selectedVariant]

  // Get current images
  const currentImages = currentVariant?.images || []

  // Calculate discount percentage - use salePrice if on sale, otherwise nonSalePrice
  const currentPrice = product?.isOnSale ? product?.salePrice : product?.nonSalePrice
  
  // Ensure prices are numbers and handle NaN cases
  const originalPrice = currentPrice?.price ? parseFloat(currentPrice.price) : 0
  const discountedPrice = currentPrice?.discountedPrice ? parseFloat(currentPrice.discountedPrice) : 0
  
  const discountPercentage = originalPrice > 0 && discountedPrice > 0 ? 
    Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-lg font-semibold">Product Preview</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {currentImages[activeImageIndex] ? (
                <img
                  src={currentImages[activeImageIndex].secure_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      activeImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.secure_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm font-medium">4.8</span>
                </div>
                <span className="text-sm text-muted-foreground">(127 reviews)</span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">
                    {formatPrice(discountedPrice || 0)}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(originalPrice || 0)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                {product.isOnSale && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    On Sale
                  </Badge>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {/* Color Selection */}
                  <div>
                    <h3 className="font-medium mb-2">Color: {currentVariant?.color?.name}</h3>
                    <div className="flex gap-2">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedVariant(index)
                            setActiveImageIndex(0)
                            setSelectedSize('')
                          }}
                          className={`w-10 h-10 rounded-full border-2 ${
                            selectedVariant === index ? 'border-primary' : 'border-muted'
                          }`}
                          style={{ backgroundColor: variant.color?.hexCode }}
                          title={variant.color?.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {currentVariant?.sizes && currentVariant.sizes.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Size</h3>
                      <div className="flex gap-2">
                        {currentVariant.sizes.map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size.size)}
                            className={`px-4 py-2 border rounded-md text-sm font-medium ${
                              selectedSize === size.size
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted hover:border-primary'
                            }`}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Free shipping on orders over ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>1-year warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-4 w-4 text-purple-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{spec.title}</span>
                          <span className="text-muted-foreground">{spec.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Category</h4>
                      <Badge variant="outline">{product.category?.name}</Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Status</h4>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Created</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Views</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.totalViews || 0} total views
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Shipping Options</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Standard Shipping (5-7 business days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Express Shipping (2-3 business days)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Options</h4>
                    <div className="space-y-2">
                      {product.paymentOptions?.cod && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Cash on Delivery</span>
                        </div>
                      )}
                      {product.paymentOptions?.online && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Online Payment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ProductPreview
