import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { userApi } from '@/api/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const SearchComponent = ({ className = "", placeholder = "Search products...", showResults = true }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Search products when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchProducts(debouncedSearchQuery.trim())
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [debouncedSearchQuery])

  // Search products function
  const searchProducts = async (query) => {
    try {
      setIsLoading(true)
      const response = await userApi.products.searchProducts(query)
      if (response.data.success) {
        setSearchResults(response.data.data.products || [])
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Error searching products:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowDropdown(false)
    }
  }

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`)
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => setShowDropdown(false), 200)
  }

  const getProductImage = (product) => {
    // Get first image from variants or images array
    if (product.images && product.images.length > 0) {
      return product.images[0].secure_url || product.images[0].url
    }
    if (product.variants && product.variants.length > 0 && product.variants[0].orderImage) {
      return product.variants[0].orderImage.secure_url || product.variants[0].orderImage.url
    }
    return '/placeholder-product.jpg'
  }

  const getProductPrice = (product) => {
    if (product.unifiedPrice) {
      return product.unifiedPrice
    }
    if (product.isOnSale && product.salePrice) {
      return product.salePrice.discountedPrice || product.salePrice.price
    }
    return product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-4 w-full h-10 bg-white/10 border-none text-white placeholder-gray-300 focus:bg-white/20 focus:outline-none transition-all duration-300 rounded-lg"
        />
      </form>
      
      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showDropdown && showResults && (searchResults.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {product.category?.name}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs font-medium text-foreground">
                          ₹{getProductPrice(product)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No products found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchComponent
