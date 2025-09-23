import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  ChevronLeft, 
  Filter, 
  MessageSquare,
  ThumbsUp
} from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'
import NavComp from '@/components/origin/navcomp'
import Footer from '@/pages/home/components/Footer'

const ProductReviewsPage = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    rating: 'all',
    sort: 'newest'
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  })

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [filters, pagination.currentPage])

  const fetchProduct = async () => {
    try {
      const response = await userApi.products.getProductById(productId)
      setProduct(response.data.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product details')
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await userApi.reviews.getReviews(productId, {
        page: pagination.currentPage,
        limit: 10,
        rating: filters.rating !== 'all' ? filters.rating : undefined,
        sort: filters.sort
      })
      
      setReviews(response.data.data.reviews)
      setPagination(response.data.data.pagination)
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
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

  const getRatingPercentage = (rating) => {
    if (reviewStats.totalReviews === 0) return 0
    const count = reviewStats.ratingDistribution.find(r => r.rating === rating)?.count || 0
    return Math.round((count / reviewStats.totalReviews) * 100)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavComp />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
              <div className="lg:col-span-3 space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/products/${productId}`)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Product
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Reviews</h1>
            {product && (
              <p className="text-muted-foreground">{product.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Review Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {reviewStats.averageRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(reviewStats.averageRating))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {reviewStats.totalReviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Rating Breakdown</h4>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-6">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Progress 
                        value={getRatingPercentage(rating)} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {getRatingPercentage(rating)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter by:</span>
              </div>
              
              <Select
                value={filters.rating}
                onValueChange={(value) => handleFilterChange('rating', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews */}
            {loading ? (
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
            ) : reviews.length > 0 ? (
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
                          
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {review.comment}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Helpful
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                <p className="text-muted-foreground">
                  No reviews match your current filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductReviewsPage
