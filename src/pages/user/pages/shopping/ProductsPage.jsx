import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import ProductFilterLayout from '@/pages/user/layout/ProductFilterLayout'
import ProductMainContent from '@/pages/user/components/ProductMainContent'
import VivlyNavigation from '@/components/ui/vivly-navigation'
import Footer from '@/pages/home/components/Footer'
import { useDebounce } from '@/hooks/useDebounce'

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
    priceGte: searchParams.get('priceGte') || 0,
    priceLte: searchParams.get('priceLte') || 10000,
    sort: searchParams.get('sort') || 'newest'
  })
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20
  })

  // Fetch products with specific filters
  const fetchProductsWithFilters = async (page = 1, filterState = filters) => {
    setLoading(true)
    try {
      const queryParams = {
        page,
        limit: 20,
        sort: filterState.sort,
        gender: filterState.gender !== 'all' ? filterState.gender : undefined,
        category: filterState.category !== 'all' ? filterState.category : undefined,
        color: filterState.color !== 'all' ? filterState.color : undefined,
        isOnSale: filterState.isOnSale !== 'all' ? filterState.isOnSale : undefined,
        priceGte: filterState.priceGte || filters.priceGte,
        priceLte: filterState.priceLte || filters.priceLte
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

      setFilters((prev) => ({
        ...prev,
        priceGte: response.data.data?.minPrice,
        priceLte: response.data.data?.maxPrice
      }))
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
      const categoriesResponse = await userApi.categories.getCategories()
      setCategories(categoriesResponse.data.data || [])

      // Fetch colors
      const colorsResponse = await userApi.colors.getColors()
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
    console.log("handleFilterChange with new filters:", newFilters)
    // Pass the new filters directly to avoid timing issues
    fetchProductsWithFilters(1, newFilters)
  }

  // Clear all filters
  const clearAllFilters = () => {
    const defaultFilters = {
      gender: 'all',
      category: 'all',
      color: 'all',
      isOnSale: 'all',
      priceGte: filters.priceGte,
      priceLte: filters.priceLte,
      sort: 'newest'
    }
    setFilters(defaultFilters)
    setSearchParams(new URLSearchParams())
    console.log("clearAllFilters with default filters:", defaultFilters)
    fetchProductsWithFilters(1, defaultFilters)
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'priceGte' || key === 'priceLte') return value && value !== 0
      return value && value !== 'all'
    })
  }

  // Initialize filters from URL on component mount and fetch products
  useEffect(() => {
    const urlFilters = {
      gender: searchParams.get('gender') || 'all',
      category: searchParams.get('category') || 'all',
      color: searchParams.get('color') || 'all',
      isOnSale: searchParams.get('isOnSale') || 'all',
      priceGte: searchParams.get('priceGte') || filters.priceGte,
      priceLte: searchParams.get('priceLte') || filters.priceLte,
      sort: searchParams.get('sort') || 'newest'
    }
    setFilters(urlFilters)
    console.log("Initial load with URL filters:", urlFilters)
    fetchProductsWithFilters(1, urlFilters)
  }, [])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  return (
    <div className="h-screen bg-background flex flex-col">
      <VivlyNavigation />
      
      <div className="flex-1">
        <ProductFilterLayout
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        categories={categories}
        colors={colors}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        getActiveFilterCount={() => Object.values(filters).filter(v => v && v !== 'all' && v !== '').length}
      >
        <ProductMainContent
          products={products}
          loading={loading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          pagination={pagination}
          fetchProductsWithFilters={fetchProductsWithFilters}
        />
        </ProductFilterLayout>
      </div>

      <Footer />
    </div>
  )
}

export default ProductsPage