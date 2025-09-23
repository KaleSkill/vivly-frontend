import React from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter } from 'lucide-react'
import ProductFilterSidebar from '@/pages/user/components/ProductFilterSidebar'

const ProductFilterLayout = ({
  children,
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  colors,
  loading,
  hasActiveFilters,
  getActiveFilterCount
}) => {
  return (
    <div className="w-full h-screen flex">
      {/* Desktop Filter Sidebar - Fixed */}
      <div className="hidden lg:block w-80 flex-shrink-0 bg-background border-r">
        <div className="h-full overflow-y-auto scrollbar-hide p-4">
          <ProductFilterSidebar
            minMaxPrice={{min: filters.priceGte, max: filters.priceLte}}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            categories={categories}
            colors={colors}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-4 py-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">All Products</h1>
              <p className="text-muted-foreground">
                {children.props?.pagination?.totalProducts || 0} products found
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
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <ProductFilterSidebar
                    minMaxPrice={{min: filters.priceGte, max: filters.priceLte}}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                    categories={categories}
                    colors={colors}
                    loading={loading}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProductFilterLayout