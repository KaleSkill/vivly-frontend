import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import { CartButton } from '@/components/ui/cart-button'
import NavComp from '@/components/origin/navcomp'
import Footer from '@/pages/home/components/Footer'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await userApi.products.getProductById(id)
        const productData = response.data.data
        
        setProduct(productData)
        
        // Set default selections
        if (productData.variants && productData.variants.length > 0) {
          setSelectedColor(productData.variants[0].color)
          if (productData.variants[0].sizes && productData.variants[0].sizes.length > 0) {
            setSelectedSize(productData.variants[0].sizes[0].size)
          }
        }
        
        // Fetch similar products
        const similarResponse = await userApi.products.getProducts({
          category: productData.category?.name,
          limit: 4
        })
        setSimilarProducts(similarResponse.data.data?.products || [])
        
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, navigate])

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Get product price
  const getProductPrice = (product) => {
    if (product.isOnSale && product.salePrice) {
      return parseFloat(product.salePrice.discountedPrice || product.salePrice.price || 0)
    }
    return parseFloat(product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0)
  }

  // Get original price
  const getOriginalPrice = (product) => {
    if (product.isOnSale && product.nonSalePrice) {
      return parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
    }
    return null
  }

  // Get discount percentage
  const getDiscountPercentage = (product) => {
    if (product.isOnSale && product.salePrice && product.nonSalePrice) {
      const original = parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
      const sale = parseFloat(product.salePrice.discountedPrice || product.salePrice.price || 0)
      return Math.round(((original - sale) / original) * 100)
    }
    return 0
  }

  // Get available sizes for selected color
  const getAvailableSizes = () => {
    if (!selectedColor || !product?.variants) return []
    const variant = product.variants.find(v => v.color._id === selectedColor._id)
    return variant?.sizes || []
  }

  // Buy now
  const handleBuyNow = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size')
      return
    }

    // Add to cart first, then navigate to checkout
    // This will be handled by the cart store
    toast.success('Redirecting to checkout...')
    // Navigate to checkout page (to be implemented)
  }

  // Get product images
  const getProductImages = () => {
    if (!product?.variants) return []
    
    const images = []
    product.variants.forEach(variant => {
      if (variant.orderImage) {
        images.push({
          url: variant.orderImage.secure_url,
          color: variant.color
        })
      }
    })
    
    return images
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavComp />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="w-1/2">
              <div className="aspect-square bg-muted animate-pulse rounded" />
            </div>
            <div className="w-1/2 space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
              <div className="h-10 bg-muted animate-pulse rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <NavComp />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  const images = getProductImages()
  const availableSizes = getAvailableSizes()

  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/products')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]?.url || product.variants?.[0]?.orderImage?.secure_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={image.url}
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
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.isOnSale && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  {getDiscountPercentage(product)}% OFF
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {formatPrice(getProductPrice(product))}
                </span>
                {getOriginalPrice(product) && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(getOriginalPrice(product))}
                  </span>
                )}
              </div>
              {product.isOnSale && (
                <p className="text-sm text-green-600">
                  You save {formatPrice(getOriginalPrice(product) - getProductPrice(product))}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Color Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.color._id}
                      onClick={() => {
                        setSelectedColor(variant.color)
                        setSelectedSize(null) // Reset size when color changes
                      }}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor?._id === variant.color._id ? 'border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: variant.color.hexCode }}
                      title={variant.color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex gap-2">
                  {availableSizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      className={`px-4 py-2 rounded border ${
                        selectedSize === sizeObj.size 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <CartButton 
                product={product}
                colorId={selectedColor?._id}
                size={selectedSize}
                quantity={quantity}
                variant="default"
                className="w-full bg-black text-white hover:bg-gray-800"
              />
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist */}
            <Button variant="ghost" className="w-full gap-2">
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </Button>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <motion.div
                  key={similarProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/products/${similarProduct._id}`)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={similarProduct.variants?.[0]?.orderImage?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{similarProduct.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold">
                          {formatPrice(getProductPrice(similarProduct))}
                        </span>
                        {getOriginalPrice(similarProduct) && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(getOriginalPrice(similarProduct))}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Reviews</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to review this product
                </p>
                <Button variant="outline">
                  Write a Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
