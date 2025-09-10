import { useMemo } from 'react'

export function usePagination({ currentPage, totalPages, paginationItemsToDisplay = 5 }) {
  const pages = useMemo(() => {
    const result = []
    
    if (totalPages <= paginationItemsToDisplay) {
      // Show all pages if total pages is less than or equal to items to display
      for (let i = 1; i <= totalPages; i++) {
        result.push(i)
      }
    } else {
      // Calculate start and end pages
      const halfDisplay = Math.floor(paginationItemsToDisplay / 2)
      let startPage = Math.max(1, currentPage - halfDisplay)
      let endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1)
      
      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < paginationItemsToDisplay) {
        startPage = Math.max(1, endPage - paginationItemsToDisplay + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        result.push(i)
      }
    }
    
    return result
  }, [currentPage, totalPages, paginationItemsToDisplay])
  
  const showLeftEllipsis = useMemo(() => {
    return totalPages > paginationItemsToDisplay && pages[0] > 1
  }, [totalPages, paginationItemsToDisplay, pages])
  
  const showRightEllipsis = useMemo(() => {
    return totalPages > paginationItemsToDisplay && pages[pages.length - 1] < totalPages
  }, [totalPages, paginationItemsToDisplay, pages])
  
  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis
  }
}