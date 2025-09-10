import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Heart, ArrowRight } from 'lucide-react'
import { userApi } from '@/api/api'

const BestSellers = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch trending products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log('Fetching best sellers...')
        const response = await userApi.products.getTrendingProducts()
        console.log('Products response:', response.data)
        setProducts(response.data.data?.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getProductPrice = (product) => {
    // If product is on sale, use sale price
    if (product.isOnSale && product.salePrice) {
      return parseFloat(product.salePrice.discountedPrice || product.salePrice.price || 0)
    }
    // Otherwise use non-sale price
    return parseFloat(product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0)
  }

  const getOriginalPrice = (product) => {
    // If product is on sale, show original non-sale price
    if (product.isOnSale && product.nonSalePrice) {
      return parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
    }
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-black text-white">
            Trending Now
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Best Sellers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most loved products that customers can't get enough of
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="p-3 sm:p-4 bg-white">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div key={product._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.variants?.[0]?.orderImage?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isOnSale && (
                    <Badge className="absolute top-3 left-3 bg-black text-white">
                      Sale
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 bg-white border-gray-300">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white">
                  <h3 className="font-semibold mb-2 line-clamp-2 text-sm sm:text-base text-black">{product.name}</h3>
                  
                  {/* Colors Display */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Colors:</span>
                    <div className="flex gap-1">
                      {product.variants?.slice(0, 3).map((variant, idx) => (
                        <div
                          key={idx}
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
                          style={{ 
                            backgroundColor: variant.color?.hexCode || 
                              (variant.color?.name === 'Red' ? '#ef4444' :
                               variant.color?.name === 'Blue' ? '#3b82f6' :
                               variant.color?.name === 'Green' ? '#10b981' :
                               variant.color?.name === 'Black' ? '#000000' :
                               variant.color?.name === 'White' ? '#ffffff' :
                               variant.color?.name === 'Yellow' ? '#f59e0b' :
                               variant.color?.name === 'Pink' ? '#ec4899' :
                               variant.color?.name === 'Purple' ? '#8b5cf6' :
                               '#6b7280')
                          }}
                          title={variant.color?.name || 'Unknown'}
                        />
                      ))}
                      {product.variants?.length > 3 && (
                        <span className="text-xs text-gray-500">+{product.variants.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-3">
                    <span className="text-base sm:text-lg font-bold text-black">
                      {formatPrice(getProductPrice(product))}
                    </span>
                    {getOriginalPrice(product) && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatPrice(getOriginalPrice(product))}
                      </span>
                    )}
                  </div>
                  
                  <Button className="w-full bg-black text-white hover:bg-gray-800" size="sm">
                    <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Add to Cart</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        )}

        {/* See All Button - Show only on desktop when more than 4 products */}
        {products.length > 4 && (
          <div className="hidden lg:flex justify-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/products')}
              className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              See All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default BestSellers
