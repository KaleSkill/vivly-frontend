import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, Search, Filter, RefreshCw } from "lucide-react";

const ProductFilterSidebar = ({
  minMaxPrice,
  filters,
  onFilterChange,
  onClearFilters,
  categories = [],
  colors = [],
}) => {
  const safeMin = minMaxPrice?.min ?? 0;
  const safeMax = minMaxPrice?.max ?? 10000;

  // local price state which is only applied when user clicks Apply
  const [priceRange, setPriceRange] = useState([
    filters?.priceGte !== undefined && filters.priceGte !== null
      ? Number(filters.priceGte)
      : safeMin,
    filters?.priceLte !== undefined && filters.priceLte !== null
      ? Number(filters.priceLte)
      : safeMax,
  ]);

  // keep local inputs in sync when external filters change
  useEffect(() => {
    // prefer explicit filters values (allow zero). Otherwise use minMaxPrice bounds
    const gte =
      filters?.priceGte !== undefined && filters?.priceGte !== null
        ? Number(filters.priceGte)
        : null;
    const lte =
      filters?.priceLte !== undefined && filters?.priceLte !== null
        ? Number(filters.priceLte)
        : null;

    setPriceRange([
      gte !== null && Number.isFinite(gte)
        ? Math.max(safeMin, Math.min(safeMax, gte))
        : safeMin,
      lte !== null && Number.isFinite(lte)
        ? Math.max(safeMin, Math.min(safeMax, lte))
        : safeMax,
    ]);
  }, [filters.priceGte, filters.priceLte, safeMin, safeMax]);

  // Update local state only. Parent will be updated on Apply.
  const handlePriceRangeChange = (value) => {
    const low = Math.max(
      safeMin,
      Math.min(safeMax, Number(value[0] ?? safeMin))
    );
    const high = Math.max(low, Math.min(safeMax, Number(value[1] ?? safeMax)));
    setPriceRange([low, high]);
  };

  const applyPriceFilters = () => {
    const [low, high] = priceRange;
    // ensure numbers are sent
    // send both values together so parent updates state once
    onFilterChange({ priceGte: Number(low), priceLte: Number(high) });
  };

  const resetPriceToDefaults = () => {
    setPriceRange([safeMin, safeMax]);
    // reset price filters only
    onFilterChange("priceGte", safeMin);
    onFilterChange("priceLte", safeMax);
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "priceGte" || key === "priceLte")
        return value && value !== "";
      return value && value !== "all";
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.gender && filters.gender !== "all") count++;
    if (filters.category && filters.category !== "all") count++;
    if (filters.color && filters.color !== "all") count++;
    if (filters.isOnSale && filters.isOnSale !== "all") count++;
    if (filters.priceGte || filters.priceLte) count++;
    return count;
  };

  const clearAllFilters = () => {
    setPriceRange([minMaxPrice.min, minMaxPrice.max]);
    onClearFilters();
  };

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
      <Accordion
        type="multiple"
        defaultValue={["gender", "category", "color", "price", "sale"]}
        className="w-full"
      >
        {/* Gender Filter */}
        <AccordionItem value="gender" className="border rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium">Gender</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {[
                { value: "all", label: "All" },
                { value: "men", label: "Men" },
                { value: "women", label: "Women" },
                { value: "unisex", label: "Unisex" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${option.value}`}
                    checked={filters.gender === option.value}
                    onCheckedChange={() =>
                      onFilterChange("gender", option.value)
                    }
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
                  checked={filters.category === "all"}
                  onCheckedChange={() => onFilterChange("category", "all")}
                />
                <Label
                  htmlFor="category-all"
                  className="text-sm font-normal cursor-pointer"
                >
                  All Categories
                </Label>
              </div>
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={filters.category === category.name}
                    onCheckedChange={() =>
                      onFilterChange("category", category.name)
                    }
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
                  checked={filters.color === "all"}
                  onCheckedChange={() => onFilterChange("color", "all")}
                />
                <Label
                  htmlFor="color-all"
                  className="text-sm font-normal cursor-pointer"
                >
                  All Colors
                </Label>
              </div>
              {colors.map((color) => (
                <div key={color._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color._id}`}
                    checked={filters.color === color.name}
                    onCheckedChange={() => onFilterChange("color", color.name)}
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
                    min={safeMin}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value);
                      const value = Math.max(
                        safeMin,
                        Math.min(
                          priceRange[1],
                          Number.isFinite(parsed) ? parsed : safeMin
                        )
                      );
                      setPriceRange([value, priceRange[1]]);
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
                    max={safeMax}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value);
                      const value = Math.max(
                        priceRange[0],
                        Math.min(
                          safeMax,
                          Number.isFinite(parsed) ? parsed : safeMax
                        )
                      );
                      setPriceRange([priceRange[0], value]);
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
                  max={safeMax}
                  min={safeMin}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Action Buttons: only show when local range differs from applied filters */}
              {(Number(filters.priceGte) !== Number(priceRange[0]) ||
                Number(filters.priceLte) !== Number(priceRange[1])) && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={applyPriceFilters}
                    className="px-4"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPriceToDefaults}
                  >
                    Reset
                  </Button>
                </div>
              )}
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
                { value: "all", label: "All Products" },
                { value: "true", label: "On Sale" },
                { value: "false", label: "Regular Price" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sale-${option.value}`}
                    checked={filters.isOnSale === option.value}
                    onCheckedChange={() =>
                      onFilterChange("isOnSale", option.value)
                    }
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
  );
};

export default ProductFilterSidebar;