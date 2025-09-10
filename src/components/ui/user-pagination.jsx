import React from 'react'
import { usePagination } from '../../hooks/use-pagination'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

const UserPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  paginationItemsToDisplay = 5 
}) => {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  })

  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous page button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            disabled={currentPage === 1}
          />
        </PaginationItem>

        {/* Left ellipsis (...) */}
        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Page number links */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink 
              onClick={() => handlePageClick(page)} 
              isActive={page === currentPage}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Right ellipsis (...) */}
        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next page button */}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default UserPagination
