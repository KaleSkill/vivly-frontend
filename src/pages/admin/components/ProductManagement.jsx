import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import UserPagination from '../../../components/ui/user-pagination'

// Icons
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus,
  Edit,
  Trash2, 
  RefreshCw,
  Package,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag,
  Image,
  Palette,
  Settings,
  BarChart3
} from 'lucide-react'

const ProductManagement = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    gender: 'all',
    category: 'all',
    color: 'all',
    isOnSale: 'all',
    isActive: 'all',
    sort: 'newest',
    priceGte: '',
    priceLte: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)

  // Fetch products
  const fetchProducts = async (page = pagination.currentPage) => {
    setLoading(true)
    try {
      const response = await adminApi.products.getProducts({
        ...filters,
        page,
        limit: 20
      })
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
      toast.error('Failed to fetch products')
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

  useEffect(() => {
    fetchProducts(1) // Reset to page 1 when filters change
    fetchFilterData()
  }, [filters])

  // Handle page change
  const handlePageChange = (page) => {
    fetchProducts(page)
  }

  // Toggle product status
  const toggleProductStatus = async (productId) => {
    setOperationLoading(prev => ({ ...prev, [productId]: true }))
    try {
      const response = await adminApi.products.toggleProductStatus(productId)
      
      if (response.data.success) {
        // Update the specific product in the list
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId 
              ? { ...product, isActive: !product.isActive }
              : product
          )
        )
        
        toast.success(response.data.message)
      } else {
        throw new Error(response.data.message || 'Failed to toggle status')
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast.error(`Failed to update product status: ${error.response?.data?.message || error.message}`)
      
      // Refresh to get correct state
      await fetchProducts()
    } finally {
      setOperationLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Delete product
  const deleteProduct = async (productId) => {
    setOperationLoading(prev => ({ ...prev, [productId]: true }))
    try {
      // Optimistically remove from UI
      setProducts(prevProducts => prevProducts.filter(product => product._id !== productId))

      const response = await adminApi.products.deleteProduct(productId)
      toast.success(response.data.message)
      
      // Refresh to ensure consistency
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      // Revert optimistic update
      fetchProducts()
      toast.error(`Failed to delete product: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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
      month: 'short',
      day: 'numeric'
    })
  }

  // Get product image
  const getProductImage = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].orderImage?.secure_url || product.variants[0].images?.[0]?.secure_url
    }
    return null
  }

  // Get product colors
  const getProductColors = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(variant => variant.color?.name).filter(Boolean)
    }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, variants, and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchProducts()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/admin/products/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently visible
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => !p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Hidden from customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isOnSale).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Special offers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((total, product) => total + (product.variants?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Color variants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                <SelectItem value="highToLow">Price: High to Low</SelectItem>
                <SelectItem value="bestSelling">Best Selling</SelectItem>
                <SelectItem value="alphabetical">A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Package className="h-8 w-8 mb-2" />
              <p>No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                          {getProductImage(product) ? (
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {(() => {
                              // Determine which price to show based on sale status
                              if (product.isOnSale && product.salePrice && product.salePrice.discountedPrice) {
                                // Show sale price when on sale
                                const salePrice = parseFloat(product.salePrice.discountedPrice) || 0;
                                return formatPrice(salePrice);
                              } else if (product.nonSalePrice && product.nonSalePrice.discountedPrice) {
                                // Show regular price when not on sale
                                const regularPrice = parseFloat(product.nonSalePrice.discountedPrice) || 0;
                                return formatPrice(regularPrice);
                              } else if (product.unifiedPrice) {
                                // Fallback to unifiedPrice if available
                                const unifiedPrice = parseFloat(product.unifiedPrice) || 0;
                                return formatPrice(unifiedPrice);
                              } else {
                                // Last resort fallback
                                return formatPrice(0);
                              }
                            })()}
                          </div>
                          {product.isOnSale && (
                            <div className="text-xs text-green-600">
                              On Sale
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getProductColors(product).slice(0, 3).map((color, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                          {getProductColors(product).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{getProductColors(product).length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline">
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.isOnSale && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Sale
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={operationLoading[product._id]}
                            >
                              {operationLoading[product._id] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/products/preview/${product._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => toggleProductStatus(product._id)}
                              disabled={operationLoading[product._id]}
                            >
                              {product.isActive ? (
                                <EyeOff className="h-4 w-4 mr-2" />
                              ) : (
                                <Eye className="h-4 w-4 mr-2" />
                              )}
                              {product.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Product
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This will also delete all variants and images. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProduct(product._id)}
                                    disabled={operationLoading[product._id]}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {operationLoading[product._id] ? (
                                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <UserPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            paginationItemsToDisplay={5}
          />
        </div>
      )}

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View and manage product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Product details view will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Product: {selectedProduct.name}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Management Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Variants</DialogTitle>
            <DialogDescription>
              Add, edit, or remove product variants
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Variant management will be implemented here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductManagement
