import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'

const ProductReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [helpfulStates, setHelpfulStates] = useState({})
  const reviewsPerPage = 5

  useEffect(() => {
    fetchReviews()
  }, [productId, currentPage])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await userApi.reviews.getReviews(productId, { 
        page: currentPage, 
        limit: reviewsPerPage 
      })
      
      console.log('Reviews API response:', response.data)
      
      setReviews(response.data.data.reviews)
      setReviewStats({
        averageRating: response.data.data.averageRating,
        totalReviews: response.data.data.totalReviews,
        ratingDistribution: response.data.data.ratingDistribution
      })
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (user) => {
    if (!user) return 'U'
    
    const firstname = user.firstname || ''
    const lastname = user.lastname || ''
    const name = `${firstname} ${lastname}`.trim()
    
    if (!name) return 'U'
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserName = (user) => {
    if (!user) return 'Anonymous User'
    
    const firstname = user.firstname || ''
    const lastname = user.lastname || ''
    const name = `${firstname} ${lastname}`.trim()
    
    return name || 'Anonymous User'
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleMarkHelpful = async (reviewId, event) => {
    event.preventDefault()
    event.stopPropagation()
    
    try {
      const response = await userApi.reviews.markHelpful(productId, reviewId)
      toast.success(response.data.message)
      
      // Update local state for immediate UI feedback
      setHelpfulStates(prev => ({
        ...prev,
        [reviewId]: response.data.isHelpful
      }))
      
      // Update the specific review in the reviews array
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { ...review, helpful: response.data.helpful }
            : review
        )
      )
    } catch (error) {
      console.error('Error marking review as helpful:', error)
      toast.error('Failed to mark review as helpful')
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={review.user?.profile} 
                    alt={getUserName(review.user)}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(review.user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{getUserName(review.user)}</h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${
                        helpfulStates[review._id] 
                          ? 'text-primary hover:text-primary/80' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={(e) => handleMarkHelpful(review._id, e)}
                    >
                      <ThumbsUp className={`w-3 h-3 mr-1 ${
                        helpfulStates[review._id] ? 'fill-current' : ''
                      }`} />
                      Helpful ({review.helpful || 0})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
         
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductReviewsSection
