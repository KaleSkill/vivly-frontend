import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, Search, X, ChevronDown, RefreshCw, Grid, List, Menu } from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import { ProductCard, ProductSkeleton } from '@/pages/user/components/product'
import ProductFilterSidebar from '@/pages/user/components/ProductFilterSidebar'
import NavComp from '@/components/origin/NavComp'
import Footer from '@/pages/home/components/Footer'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || 'all',
    category: searchParams.get('category') || 'all',
    color: searchParams.get('color') || 'all',
    isOnSale: searchParams.get('isOnSale') || 'all',
    priceGte: searchParams.get('priceGte') || '',
    priceLte: searchParams.get('priceLte') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || ''
  })
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
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
        sort: filters.sort,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        color: filters.color !== 'all' ? filters.color : undefined,
        isOnSale: filters.isOnSale !== 'all' ? filters.isOnSale : undefined,
        search: filters.search || undefined,
        priceGte: filters.priceGte || undefined,
        priceLte: filters.priceLte || undefined
      }

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key]
        }
      })

      console.log('Fetching products with params:', queryParams)

      const response = await userApi.products.getProducts(queryParams)
      console.log('API Response:', response.data)
      
      setProducts(response.data.data?.products || [])
      setPagination({
        currentPage: response.data.data?.pagination?.currentPage || 1,
        totalPages: response.data.data?.pagination?.totalPages || 1,
        totalProducts: response.data.data?.pagination?.totalProducts || 0,
        limit: response.data.data?.pagination?.limit || 20
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await userApi.categories?.getCategories?.() || { data: { data: [] } }
      setCategories(categoriesResponse.data.data || [])

      // Fetch colors
      const colorsResponse = await userApi.colors?.getColors?.() || { data: { data: [] } }
      setColors(colorsResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Update URL params when filters change
  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      }
    })

    setSearchParams(params)
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    updateURLParams(newFilters)
    fetchProducts(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    const defaultFilters = {
      gender: 'all',
      category: 'all',
      color: 'all',
      isOnSale: 'all',
      priceGte: '',
      priceLte: '',
      sort: 'newest',
      search: ''
    }
    setFilters(defaultFilters)
    setSearchParams(new URLSearchParams())
    fetchProducts(1)
  }

  // Handle search with debounce
  const [searchValue, setSearchValue] = useState(filters.search)
  const handleSearchChange = (value) => {
    setSearchValue(value)
    const timeoutId = setTimeout(() => {
      handleFilterChange('search', value)
    }, 500)
    return () => clearTimeout(timeoutId)
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'search') return value && value.trim() !== ''
      if (key === 'priceGte' || key === 'priceLte') return value && value !== ''
      return value && value !== 'all'
    })
  }

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlFilters = {
      gender: searchParams.get('gender') || 'all',
      category: searchParams.get('category') || 'all',
      color: searchParams.get('color') || 'all',
      isOnSale: searchParams.get('isOnSale') || 'all',
      priceGte: searchParams.get('priceGte') || '',
      priceLte: searchParams.get('priceLte') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || ''
    }
    setFilters(urlFilters)
    setSearchValue(urlFilters.search)
  }, [])

  // Fetch data on component mount and filter changes
  useEffect(() => {
    fetchProducts()
  }, [filters])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <ProductFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
              categories={categories}
              colors={colors}
              loading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Products</h1>
                <p className="text-muted-foreground">
                  {pagination.totalProducts} products found
                </p>
              </div>
              
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="ml-1">
                          {Object.values(filters).filter(v => v && v !== 'all' && v !== '').length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <ProductFilterSidebar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={clearAllFilters}
                      categories={categories}
                      colors={colors}
                      loading={loading}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Top Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort */}
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                  <SelectItem value="highToLow">Price: High to Low</SelectItem>
                  <SelectItem value="alphabetical">A to Z</SelectItem>
                  <SelectItem value="topRated">Top Rated</SelectItem>
                  <SelectItem value="bestSelling">Best Selling</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.gender && filters.gender !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Gender: {filters.gender}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('gender', 'all')}
                    />
                  </Badge>
                )}
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {filters.category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('category', 'all')}
                    />
                  </Badge>
                )}
                {filters.color && filters.color !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Color: {filters.color}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('color', 'all')}
                    />
                  </Badge>
                )}
                {filters.isOnSale && filters.isOnSale !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Sale: {filters.isOnSale === 'true' ? 'On Sale' : 'Regular'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('isOnSale', 'all')}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
                {(filters.priceGte || filters.priceLte) && (
                  <Badge variant="secondary" className="gap-1">
                    Price: ₹{filters.priceGte || 0} - ₹{filters.priceLte || '∞'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        handleFilterChange('priceGte', '')
                        handleFilterChange('priceLte', '')
                      }}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
                {hasActiveFilters() && (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
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
