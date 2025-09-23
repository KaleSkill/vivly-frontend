import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const ProductSkeleton = ({ className = "" }) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-none rounded-lg bg-card ${className}`}>
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="w-full h-full bg-muted animate-pulse"></div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        </div>
        
        {/* Colors Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Price Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
        </div>
        
        {/* Button Skeleton */}
        <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

export default ProductSkeleton
