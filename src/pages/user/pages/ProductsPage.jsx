import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingBag, Heart, Filter, Search, X, Truck, Shield, RefreshCw } from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import { CartButton } from '@/components/ui/cart-button'
import NavComp from '@/components/origin/navcomp'
import Footer from '@/pages/home/components/Footer'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    genders: searchParams.get('genders') ? searchParams.get('genders').split(',') : [],
    categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    priceMin: searchParams.get('priceMin') || 0,
    priceMax: searchParams.get('priceMax') || 100000,
    isOnSale: searchParams.get('isOnSale') || 'all'
  })
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [showFilters, setShowFilters] = useState(false)
  const [availableCategories, setAvailableCategories] = useState([])
  const [availableColors, setAvailableColors] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20
  })

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const queryParams = {
        page,
        limit: 20,
        sort: filters.sort
      }

      // Add filters only if they're not empty
      if (filters.genders.length > 0) queryParams.gender = filters.genders.join(',')
      if (filters.categories.length > 0) queryParams.category = filters.categories.join(',')
      if (filters.colors.length > 0) queryParams.color = filters.colors.join(',')
      if (filters.search) queryParams.search = filters.search
      if (filters.isOnSale !== 'all') queryParams.isOnSale = filters.isOnSale
      if (filters.priceMin > 0) queryParams['price[gte]'] = filters.priceMin
      if (filters.priceMax < 100000) queryParams['price[lte]'] = filters.priceMax

      const response = await userApi.products.getProducts(queryParams)
      
      const data = response.data.data
      setProducts(data.products || [])
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 20
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch available categories and colors
  const fetchFilterOptions = async () => {
    try {
      // You can create separate API endpoints for this or extract from products
      const response = await userApi.products.getProducts({ limit: 1000 })
      const allProducts = response.data.data.products || []
      
      // Extract unique categories
      const categories = [...new Set(allProducts.map(p => p.category?.name).filter(Boolean))]
      setAvailableCategories(categories)
      
      // Extract unique colors
      const colors = [...new Set(allProducts.flatMap(p => 
        p.variants?.map(v => v.color?.name).filter(Boolean) || []
      ))]
      setAvailableColors(colors)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchFilterOptions()
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams)
    if (value === 'all' || value === '' || (Array.isArray(value) && value.length === 0)) {
      newSearchParams.delete(key)
    } else {
      newSearchParams.set(key, Array.isArray(value) ? value.join(',') : value)
    }
    setSearchParams(newSearchParams)
  }

  // Handle multiple selection filters
  const handleMultiSelectFilter = (key, value) => {
    const currentValues = filters[key] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    
    handleFilterChange(key, newValues)
  }

  // Handle search with debouncing
  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== searchParams.get('search')) {
        fetchProducts()
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [filters.search])

  // Handle price range change
  const handlePriceRangeChange = (value) => {
    setPriceRange(value)
    setFilters(prev => ({
      ...prev,
      priceMin: value[0],
      priceMax: value[1]
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      genders: [],
      categories: [],
      colors: [],
      sort: 'newest',
      search: '',
      priceMin: 0,
      priceMax: 100000,
      isOnSale: 'all'
    })
    setPriceRange([0, 100000])
    setSearchParams({})
  }

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

  // Check authentication helper
  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to add products to cart')
      navigate('/login')
      return false
    }
    return true
  }

  // Skeleton Component
  const ProductSkeleton = () => (
    <Card className="overflow-hidden border-0 shadow-none rounded-lg">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="h-8 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm text-muted-foreground hover:text-foreground">
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Gender</h4>
        <div className="space-y-3">
          {['men', 'women', 'unisex'].map((gender) => (
            <div key={gender} className="flex items-center space-x-3">
              <Checkbox
                id={`gender-${gender}`}
                checked={filters.genders.includes(gender)}
                onCheckedChange={() => handleMultiSelectFilter('genders', gender)}
              />
              <label htmlFor={`gender-${gender}`} className="text-sm text-foreground capitalize cursor-pointer">
                {gender}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Category</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {availableCategories.map((category) => (
            <div key={category} className="flex items-center space-x-3">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleMultiSelectFilter('categories', category)}
              />
              <label htmlFor={`category-${category}`} className="text-sm text-foreground capitalize cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Color</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {availableColors.map((color) => (
            <div key={color} className="flex items-center space-x-3">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleMultiSelectFilter('colors', color)}
              />
              <label htmlFor={`color-${color}`} className="text-sm text-foreground capitalize cursor-pointer">
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sale */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Special Offers</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sale-true"
              checked={filters.isOnSale === 'true'}
              onCheckedChange={() => handleFilterChange('isOnSale', filters.isOnSale === 'true' ? 'all' : 'true')}
            />
            <label htmlFor="sale-true" className="text-sm text-foreground cursor-pointer">On Sale</label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      {/* Fixed Search Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                {loading ? (
                  <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                )}
                <Input
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-12 border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
            </form>

            {/* Mobile Filter Button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden gap-2 h-12">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <div className="bg-card h-full">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Results Counter */}
            <div className="hidden lg:flex items-center text-sm text-muted-foreground">
              <span>{pagination.totalProducts} products found</span>
            </div>

            {/* Sort Dropdown */}
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-0 bg-muted/50 focus:bg-background transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                <SelectItem value="highToLow">Price: High to Low</SelectItem>
                <SelectItem value="topRated">Top Rated</SelectItem>
                <SelectItem value="bestSelling">Best Selling</SelectItem>
                <SelectItem value="alphabetical">A to Z</SelectItem>
                <SelectItem value="discount">Best Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar - Fixed */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-fit">
            <div className="bg-card rounded-lg border border-border/50 shadow-sm">
              <FilterSidebar />
            </div>
          </div>

          {/* Products Grid - Scrollable */}
          <div className="flex-1 min-w-0 pl-4">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {pagination.totalProducts} Products Found
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} of {pagination.totalProducts} products
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-none rounded-lg bg-card"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted rounded-t-lg">
                        <img
                          src={product.variants?.[0]?.orderImage?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Sale Badge */}
                        {product.isOnSale && (
                          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs">
                            Sale
                          </Badge>
                        )}
                        
                        {/* Wishlist Button */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="absolute top-3 right-3 rounded-full w-8 h-8 p-0 bg-background/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle wishlist
                          }}
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <CardContent className="p-4 space-y-3">
                        {/* Product Name */}
                        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                          {product.name}
                        </h3>
                        
                        {/* Category */}
                        <p className="text-sm text-muted-foreground capitalize">
                          {product.category?.name}
                        </p>
                        
                        {/* Colors Display */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Colors:</span>
                          <div className="flex gap-1">
                            {product.variants?.slice(0, 4).map((variant, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-border shadow-sm"
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
                            {product.variants?.length > 4 && (
                              <span className="text-xs text-muted-foreground ml-1">+{product.variants.length - 4}</span>
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(getProductPrice(product))}
                          </span>
                          {getOriginalPrice(product) && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(getOriginalPrice(product))}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(((getOriginalPrice(product) - getProductPrice(product)) / getOriginalPrice(product)) * 100)}% OFF
                              </Badge>
                            </>
                          )}
                        </div>
                        
                        {/* Features */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>Free Delivery</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Warranty</span>
                          </div>
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
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button onClick={clearAllFilters} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination - Simple Previous/Next */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 px-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchProducts(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="gap-2 px-6"
                  >
                    ← Previous
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => fetchProducts(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="gap-2 px-6"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductsPage
