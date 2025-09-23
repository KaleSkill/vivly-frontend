import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/api'

// UI Components
import { Button } from '@/components/ui/button'

// Icons
import { Plus, RefreshCw, Eye } from 'lucide-react'

// Import sub-components
import ProductFilters from './ProductFilters'
import ProductTable from './ProductTable'


const ProductManagement = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState({
    gender: 'all',
    category: 'all',
    color: 'all',
    priceLte: '',
    priceGte: '',
    sort: 'newest',
    isOnSale: 'all',
    isActive: 'all',
    search: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [operationLoading, setOperationLoading] = useState({})

  // Initialize filters from URL query parameters
  const initializeFiltersFromURL = () => {
    const urlFilters = {
      gender: searchParams.get('gender') || 'all',
      category: searchParams.get('category') || 'all',
      color: searchParams.get('color') || 'all',
      priceLte: searchParams.get('priceLte') || '',
      priceGte: searchParams.get('priceGte') || '',
      sort: searchParams.get('sort') || 'newest',
      isOnSale: searchParams.get('isOnSale') || 'all',
      isActive: searchParams.get('isActive') || 'all',
      search: searchParams.get('search') || ''
    }
    setFilters(urlFilters)
    setSearchTerm(urlFilters.search)
  }

  // Update URL query parameters when filters change
  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams()
    
    // Only add non-default values to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      }
    })
    
    // Update URL without causing a page reload
    setSearchParams(params, { replace: true })
  }

  // Fetch products
  const fetchProducts = async (page = pagination.currentPage) => {
    setLoading(true)
    try {
      console.log('Fetching products with filters:', { ...filters, page, limit: 20 })
      const response = await adminApi.products.getProducts({
        ...filters,
        page,
        limit: 20
      })
      console.log('Products response:', response.data)
      setProducts(response.data.data.products || [])
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products'
      toast.error(errorMessage)
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories and colors for filters
  const fetchFilterData = async () => {
    try {
      const [categoriesRes, colorsRes] = await Promise.all([
        adminApi.categories.getCategories(),
        adminApi.colors.getColors()
      ])
      setCategories(categoriesRes.data.data || [])
      setColors(colorsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching filter data:', error)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters = { ...filters, search: searchTerm }
      setFilters(newFilters)
      updateURLParams(newFilters)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Fetch data on component mount and filter changes
  useEffect(() => {
    fetchProducts()
  }, [filters])

  useEffect(() => {
    fetchFilterData()
  }, [])

  // Initialize filters from URL on component mount
  useEffect(() => {
    initializeFiltersFromURL()
  }, [])

  // Handle filter change
  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} = ${value}`)
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURLParams(newFilters)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    const newFilters = { ...filters, search: '' }
    setFilters(newFilters)
    updateURLParams(newFilters)
  }

  // Clear all filters
  const clearAllFilters = () => {
    const defaultFilters = {
      gender: 'all',
      category: 'all',
      color: 'all',
      priceLte: '',
      priceGte: '',
      sort: 'newest',
      isOnSale: 'all',
      isActive: 'all',
      search: ''
    }
    setFilters(defaultFilters)
    setSearchTerm('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  // Refresh products data
  const refreshProducts = async () => {
    await fetchProducts()
    toast.success('Products refreshed successfully')
  }

  // View product preview
  const handleViewPreview = (productId) => {
    navigate(`/admin/products/preview/${productId}`)
  }

  // Edit product
  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`)
  }

  // Manage variants
  const handleManageVariants = (productId) => {
    navigate(`/admin/products/${productId}/variants`)
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchProducts(newPage)
  }

  // Toggle product status
  const toggleProductStatus = async (productId) => {
    setOperationLoading(prev => ({ ...prev, [productId]: true }))
    try {
      await adminApi.products.toggleProductStatus(productId)
      toast.success('Product status updated successfully')
      await fetchProducts()
    } catch (error) {
      toast.error(`Failed to update product status: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Delete product
  const deleteProduct = async (productId) => {
    setOperationLoading(prev => ({ ...prev, [productId]: true }))
    try {
      await adminApi.products.deleteProduct(productId)
      toast.success('Product deleted successfully')
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      await fetchProducts()
      toast.error(`Failed to delete product: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={refreshProducts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="gap-2"
            onClick={() => navigate('/admin/products/create')}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

     

      {/* Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        colors={colors}
        searchTerm={searchTerm}
        pagination={pagination}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        onClearAllFilters={clearAllFilters}
      />

      {/* Products Table */}
      <ProductTable
        products={products}
        loading={loading}
        pagination={pagination}
        operationLoading={operationLoading}
        onPageChange={handlePageChange}
        onToggleStatus={toggleProductStatus}
        onDelete={deleteProduct}
        onViewPreview={handleViewPreview}
        onEditProduct={handleEditProduct}
        onManageVariants={handleManageVariants}
      />
    </div>
  )
}

export default ProductManagement
