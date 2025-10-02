import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { 
  X, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

const ProductFilterSidebar = ({
  minMaxPrice,
  filters,
  onFilterChange,
  onClearFilters,
  categories = [],
  colors = [],
  loading = false
}) => {
  const [priceRange, setPriceRange] = useState([minMaxPrice.min, minMaxPrice.max])

  // Update price range when filters change
  useEffect(() => {
    if (filters.priceGte || filters.priceLte) {
      setPriceRange([
        parseInt(filters.priceGte) || minMaxPrice.min,
        parseInt(filters.priceLte) || minMaxPrice.max
      ])
    }
  }, [filters.priceGte, filters.priceLte])


  const handlePriceRangeChange = (value) => {
    setPriceRange(value)
    onFilterChange('priceGte', value[0])
    onFilterChange('priceLte', value[1])
  }

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'priceGte' || key === 'priceLte') return value && value !== ''
      return value && value !== 'all'
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.gender && filters.gender !== 'all') count++
    if (filters.category && filters.category !== 'all') count++
    if (filters.color && filters.color !== 'all') count++
    if (filters.isOnSale && filters.isOnSale !== 'all') count++
    if (filters.priceGte || filters.priceLte) count++
    return count
  }

  const clearAllFilters = () => {
    setPriceRange([minMaxPrice.min, minMaxPrice.max])
    onClearFilters()
  }

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Accordion Filters */}
      <Accordion type="multiple" defaultValue={["gender", "category", "color", "price", "sale"]} className="w-full">

        {/* Gender Filter */}
        <AccordionItem value="gender" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Gender</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {[
                { value: 'all', label: 'All' },
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'unisex', label: 'Unisex' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${option.value}`}
                    checked={filters.gender === option.value}
                    onCheckedChange={() => onFilterChange('gender', option.value)}
                  />
                  <Label
                    htmlFor={`gender-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Category Filter */}
        <AccordionItem value="category" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Category</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-all"
                  checked={filters.category === 'all'}
                  onCheckedChange={() => onFilterChange('category', 'all')}
                />
                <Label htmlFor="category-all" className="text-sm font-normal cursor-pointer">
                  All Categories
                </Label>
              </div>
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={filters.category === category.name}
                    onCheckedChange={() => onFilterChange('category', category.name)}
                  />
                  <Label
                    htmlFor={`category-${category._id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="color" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Color</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="color-all"
                  checked={filters.color === 'all'}
                  onCheckedChange={() => onFilterChange('color', 'all')}
                />
                <Label htmlFor="color-all" className="text-sm font-normal cursor-pointer">
                  All Colors
                </Label>
              </div>
              {colors.map((color) => (
                <div key={color._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color._id}`}
                    checked={filters.color === color.name}
                    onCheckedChange={() => onFilterChange('color', color.name)}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <Label
                      htmlFor={`color-${color._id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {color.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Price Range</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 p-4">
            <div className="space-y-4">
              {/* Input Fields */}
              <div className="flex items-center justify-between gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min-price" className="text-sm font-medium">
                    Min Price
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    min={minMaxPrice.min}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Math.max(minMaxPrice.min, Math.min(priceRange[1], parseInt(e.target.value) || minMaxPrice.min))
                      setPriceRange([value, priceRange[1]])
                      onFilterChange('priceGte', value)
                    }}
                    className="w-24"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-price" className="text-sm font-medium">
                    Max Price
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    min={priceRange[0]}
                    max={minMaxPrice.max}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Math.max(priceRange[0], Math.min(minMaxPrice.max, parseInt(e.target.value) || minMaxPrice.max))
                      setPriceRange([priceRange[0], value])
                      onFilterChange('priceLte', value)
                    }}
                    className="w-24"
                  />
                </div>
              </div>
              
              {/* Slider */}
              <div className="space-y-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={minMaxPrice.max}
                  min={minMaxPrice.min}
                  step={10}
                  className="w-full"
                />
              </div>
              
              {/* Price Range Display */}
              <p className="text-sm text-muted-foreground">
                Showing products between ₹{priceRange[0]} and ₹{priceRange[1]}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sale Filter */}
        <AccordionItem value="sale" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Sale</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {[
                { value: 'all', label: 'All Products' },
                { value: 'true', label: 'On Sale' },
                { value: 'false', label: 'Regular Price' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sale-${option.value}`}
                    checked={filters.isOnSale === option.value}
                    onCheckedChange={() => onFilterChange('isOnSale', option.value)}
                  />
                  <Label
                    htmlFor={`sale-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default ProductFilterSidebar
