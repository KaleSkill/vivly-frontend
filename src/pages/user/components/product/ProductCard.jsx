import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CartButton } from '@/components/ui/cart-button'

const ProductCard = ({ 
  product, 
  index = 0, 
  showColors = true, 
  className = "",
  animationDelay = 0.1
}) => {
  const navigate = useNavigate()

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

  const getColorHex = (colorName) => {
    const colorMap = {
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#10b981',
      'Black': '#000000',
      'White': '#ffffff',
      'Yellow': '#f59e0b',
      'Pink': '#ec4899',
      'Purple': '#8b5cf6',
      'Orange': '#f97316',
      'Gray': '#6b7280',
      'Brown': '#8b4513'
    }
    return colorMap[colorName] || '#6b7280'
  }

  const handleCardClick = () => {
    navigate(`/products/${product._id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * animationDelay }}
      className={className}
    >
      <Card 
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-none rounded-lg bg-card"
        onClick={handleCardClick}
      >
        {/* Product Image */}
        <div className="relative  overflow-hidden bg-muted">
          <img
            src={product.variants?.[0]?.orderImage?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Sale Badge */}
          {product.isOnSale && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              Sale
            </Badge>
          )}
          
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Colors Display */}
          {showColors && product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Colors:</span>
              <div className="flex gap-1">
                {product.variants.slice(0, 3).map((variant, idx) => (
                  <div
                    key={idx}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background shadow-sm"
                    style={{ 
                      backgroundColor: variant.color?.hexCode || getColorHex(variant.color?.name)
                    }}
                    title={variant.color?.name || 'Unknown'}
                  />
                ))}
                {product.variants.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{product.variants.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-foreground">
              {formatPrice(getProductPrice(product))}
            </span>
            {getOriginalPrice(product) && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatPrice(getOriginalPrice(product))}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <CartButton 
              product={product}
              colorId={product.variants?.[0]?.color?._id}
              size={product.variants?.[0]?.sizes?.[0]?.size}
              quantity={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProductCard
