import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MessageSquare, ThumbsUp, MoreHorizontal } from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'

const ProductReviews = ({ productId, showLimited = true }) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  })
  const [helpfulStates, setHelpfulStates] = useState({})

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await userApi.reviews.getReviews(productId, { 
        page: 1, 
        limit: showLimited ? 3 : 10 
      })
      
      setReviews(response.data.data.reviews)
      setReviewStats({
        averageRating: response.data.data.averageRating,
        totalReviews: response.data.data.totalReviews,
        ratingDistribution: response.data.data.ratingDistribution
      })
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

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'U'
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating, size = 'sm') => {
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
      
      // Update the specific review in the reviews array instead of refetching
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

  const handleViewAllReviews = () => {
    navigate(`/products/${productId}/reviews`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Review Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {renderStars(Math.round(reviewStats.averageRating))}
            <span className="ml-2 text-sm text-muted-foreground">
              {reviewStats.averageRating} ({reviewStats.totalReviews} reviews)
            </span>
          </div>
        </div>
        {showLimited && reviewStats.totalReviews > 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAllReviews}
            className="text-primary"
          >
            View All Reviews
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={review.user?.profileImage} 
                    alt={review.user?.fullname || 'User'}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(review.user?.fullname)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{review.user?.fullname || 'Anonymous User'}</h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
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
                          ? 'text-yellow-500 hover:text-yellow-600' 
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

      {/* View More Button for Limited View */}
      {showLimited && reviewStats.totalReviews > 3 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={handleViewAllReviews}
            className="w-full"
          >
            View All {reviewStats.totalReviews} Reviews
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductReviews
