import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

const ProductFilters = ({
  filters,
  categories,
  colors,
  searchTerm,
  pagination,
  onFilterChange,
  onClearFilter,
  onSearchChange,
  onClearSearch,
  onClearAllFilters
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Search by product name or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={onClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              Searching for: "{searchTerm}"
            </p>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Gender Filter */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={filters.gender} onValueChange={(value) => onFilterChange('gender', value)}>
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
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
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
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Select value={filters.color} onValueChange={(value) => onFilterChange('color', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map(color => (
                  <SelectItem key={color._id} value={color.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.isActive} onValueChange={(value) => onFilterChange('isActive', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sale Filter */}
          <div className="space-y-2">
            <Label>Sale</Label>
            <Select value={filters.isOnSale} onValueChange={(value) => onFilterChange('isOnSale', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="true">On Sale</SelectItem>
                <SelectItem value="false">Not on Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={filters.sort} onValueChange={(value) => onFilterChange('sort', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                <SelectItem value="highToLow">Price: High to Low</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="bestSelling">Best Selling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([key, value]) => {
          // Check if filter has an active value
          if (!value || value === 'all' || value === '') return false
          
          // Special handling for boolean filters
          if (key === 'isOnSale' || key === 'isActive') {
            return value === 'true' || value === 'false'
          }
          
          // Special handling for search
          if (key === 'search') {
            return value.trim() !== ''
          }
          
          return true
        }) && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                // Use the same logic as the condition above
                if (!value || value === 'all' || value === '') return null
                
                // Special handling for boolean filters
                if (key === 'isOnSale' || key === 'isActive') {
                  if (value !== 'true' && value !== 'false') return null
                }
                
                // Special handling for search
                if (key === 'search' && value.trim() === '') return null
                
                const filterLabels = {
                  gender: 'Gender',
                  category: 'Category', 
                  color: 'Color',
                  priceLte: 'Max Price',
                  priceGte: 'Min Price',
                  sort: 'Sort By',
                  isOnSale: 'Sale Status',
                  isActive: 'Status',
                  search: 'Search'
                }
                
                // Format display value based on filter type
                const getDisplayValue = (key, value) => {
                  switch (key) {
                    case 'isOnSale':
                      return value === 'true' ? 'On Sale' : 'Not on Sale'
                    case 'isActive':
                      return value === 'true' ? 'Active' : 'Inactive'
                    case 'priceLte':
                      return `≤ ₹${value}`
                    case 'priceGte':
                      return `≥ ₹${value}`
                    case 'sort':
                      const sortLabels = {
                        newest: 'Newest',
                        oldest: 'Oldest',
                        lowToHigh: 'Price: Low to High',
                        highToLow: 'Price: High to Low',
                        alphabetical: 'Alphabetical',
                        bestSelling: 'Best Selling'
                      }
                      return sortLabels[value] || value
                    default:
                      return value
                  }
                }

                return (
                  <div
                    key={key}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    <span className="font-medium">{filterLabels[key]}:</span>
                    <span>{getDisplayValue(key, value)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-primary/20"
                      onClick={() => onClearFilter(key)}
                      title={`Clear ${filterLabels[key] || key} filter`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-muted-foreground">
          {filters.search ? (
            <span>Found {pagination?.totalProducts || 0} results for "{searchTerm}"</span>
          ) : (
            <span>Showing {pagination?.totalProducts || 0} products</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductFilters
