import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { 
  ChevronLeft, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import { CartButton } from '@/components/ui/cart-button'
import ProductReviews from '@/pages/user/components/product/ProductReviews'
import ReviewForm from '@/pages/user/components/product/ReviewForm'

import Footer from '@/pages/home/components/Footer'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isInCart, setIsInCart] = useState(false)
  const [availableStock, setAvailableStock] = useState(0)

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await userApi.products.getProductById(id)
      const productData = response.data.data
      setProduct(productData)
      
      // Set default selections
      if (productData.variants && productData.variants.length > 0) {
        setSelectedColor(productData.variants[0].color._id)
        if (productData.variants[0].sizes && productData.variants[0].sizes.length > 0) {
          setSelectedSize(productData.variants[0].sizes[0].size)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product details')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getProductPrice = (product) => {
    if (product.isOnSale && product.salePrice) {
      return parseFloat(product.salePrice.discountedPrice || product.salePrice.price || 0)
    }
    return parseFloat(product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0)
  }

  const getOriginalPrice = (product) => {
    if (product.isOnSale && product.nonSalePrice) {
      return parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
    }
    return null
  }

  const getSelectedVariant = () => {
    if (!product || !selectedColor) return null
    return product.variants.find(variant => variant.color._id === selectedColor)
  }

  const getAvailableSizes = () => {
    const variant = getSelectedVariant()
    if (!variant || !variant.sizes) return []
    return variant.sizes.map(size => size.size)
  }

  const getStockForSelectedSize = () => {
    const variant = getSelectedVariant()
    if (!variant || !variant.sizes || !selectedSize) return 0
    
    const sizeData = variant.sizes.find(size => size.size === selectedSize)
    return sizeData ? sizeData.stock : 0
  }

  const getColorHex = (colorName) => {
    const colorMap = {
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#10b981',
      'Black': '#000000',
      'White': '#ffffff',
      'Yellow': '#fbbf24',
      'Purple': '#8b5cf6',
      'Pink': '#ec4899',
      'Orange': '#f97316',
      'Gray': '#6b7280',
      'Brown': '#a3a3a3'
    }
    return colorMap[colorName] || '#6b7280'
  }

  const handleQuantityChange = (change) => {
    const currentStock = getStockForSelectedSize()
    setQuantity(prev => {
      const newQuantity = prev + change
      return Math.max(1, Math.min(newQuantity, currentStock))
    })
  }

  // Update available stock when color or size changes
  useEffect(() => {
    const stock = getStockForSelectedSize()
    setAvailableStock(stock)
    
    // Reset quantity if it exceeds available stock
    if (quantity > stock && stock > 0) {
      setQuantity(stock)
    } else if (stock === 0) {
      setQuantity(1)
    }
  }, [selectedColor, selectedSize, product])

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size')
      return
    }
    
    // Add to cart and navigate to checkout
    // Implementation depends on your cart system
    toast.success('Added to cart! Redirecting to checkout...')
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
       
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="flex gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-20 h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
      
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const selectedVariant = getSelectedVariant()
  const availableSizes = getAvailableSizes()
  const allImages = selectedVariant?.images || []

  return (
    <div className="min-h-screen bg-background">
     
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={allImages[selectedImageIndex]?.secure_url || selectedVariant?.orderImage?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-border'
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name & Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.isOnSale && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    Sale
                  </Badge>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.averageRating || 0} rating)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(getProductPrice(product))}
                </span>
                {getOriginalPrice(product) && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(getOriginalPrice(product))}
                  </span>
                )}
              </div>
              {product.isOnSale && (
                <div className="text-sm text-green-600 font-medium">
                  Save {formatPrice(getOriginalPrice(product) - getProductPrice(product))}
                </div>
              )}
            </div>

            {/* Color Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Color</h3>
                <div className="flex gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.color._id}
                      onClick={() => {
                        setSelectedColor(variant.color._id)
                        setSelectedImageIndex(0)
                        setSelectedSize('')
                      }}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === variant.color._id 
                          ? 'border-primary ring-4 ring-primary/30 scale-110' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ 
                        backgroundColor: variant.color.hexCode || getColorHex(variant.color.name)
                      }}
                      title={variant.color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => {
                    const isAvailable = availableSizes.includes(size)
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isAvailable
                            ? 'border-border hover:border-primary'
                            : 'border-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quantity</h3>
                {availableStock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {availableStock} available
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= availableStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {availableStock === 0 && (
                <p className="text-sm text-destructive font-medium">
                  Out of stock for this size
                </p>
              )}
              {availableStock > 0 && availableStock <= 5 && (
                <p className="text-sm text-orange-600 font-medium">
                  Only {availableStock} left in stock!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <div className="flex-1">
                <CartButton 
                  product={product}
                  colorId={selectedColor}
                  size={selectedSize}
                  quantity={quantity}
                  className="w-full"
                  disabled={availableStock === 0}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toast.success('Link copied to clipboard')}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Buy Now Button */}
            {isInCart && (
              <Button 
                onClick={handleBuyNow}
                className="w-full"
                size="lg"
                disabled={availableStock === 0}
              >
                Buy Now
              </Button>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Accordion */}
        <div className="mt-12">
          <Accordion type="multiple" defaultValue={["description"]} className="w-full">
            {/* Description */}
            <AccordionItem value="description" className="border rounded-lg mb-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-semibold text-lg">Description</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <AccordionItem value="specifications" className="border rounded-lg mb-4">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="font-semibold text-lg">Specifications</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    {product.specifications.map((spec, index) => (
                      <div key={spec._id || index} className="py-3 border-b border-border last:border-b-0">
                        <h4 className="font-semibold text-foreground mb-2">{spec.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{spec.description}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Reviews */}
            <AccordionItem value="reviews" className="border rounded-lg mb-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-semibold text-lg">Reviews</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-6">
                  <ReviewForm 
                    productId={product._id} 
                    onReviewAdded={() => {
                      // Refresh reviews when new review is added
                      window.location.reload()
                    }}
                  />
                  <ProductReviews productId={product._id} showLimited={true} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetailPage