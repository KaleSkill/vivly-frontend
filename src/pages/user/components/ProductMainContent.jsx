import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Grid, List, Search, X } from 'lucide-react'
import { ProductCard, ProductSkeleton } from '@/pages/user/components/product'

const ProductMainContent = ({
  products,
  loading,
  viewMode,
  setViewMode,
  filters,
  handleFilterChange,
  clearAllFilters,
  hasActiveFilters,
  pagination,
  fetchProductsWithFilters
}) => {
  return (
    <>
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          {(filters.priceGte || filters.priceLte) && (
            <Badge variant="secondary" className="gap-1">
              Price: ₹{filters.priceGte || 0} - ₹{filters.priceLte || '∞'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  handleFilterChange('priceGte', filters.priceGte)
                  handleFilterChange('priceLte', filters.priceLte)
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
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
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
            onClick={() => fetchProductsWithFilters(pagination.currentPage - 1, filters)}
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
            onClick={() => fetchProductsWithFilters(pagination.currentPage + 1, filters)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  )
}

export default ProductMainContent
