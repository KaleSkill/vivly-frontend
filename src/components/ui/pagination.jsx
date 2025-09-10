import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef(({ className, isActive, size = "icon", ...props }, ref) => (
  <Button
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    size={size}
    className={cn(
      "h-9 w-9",
      isActive && "border-primary",
      className
    )}
    {...props}
  />
))
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    aria-label="Go to previous page"
    size="icon"
    className={cn("h-9 w-9", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </Button>
))
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    aria-label="Go to next page"
    size="icon"
    className={cn("h-9 w-9", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </Button>
))
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}