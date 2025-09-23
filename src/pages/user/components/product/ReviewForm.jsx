import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Send } from 'lucide-react'
import { userApi } from '@/api/api'
import { toast } from 'sonner'

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    try {
      setSubmitting(true)
      const reviewData = {
        rating,
        comment: comment.trim()
      }
      console.log('Sending review data:', reviewData)
      console.log('Product ID:', productId)
      await userApi.reviews.addReview(productId, reviewData)
      
      toast.success('Review added successfully!')
      setRating(0)
      setComment('')
      onReviewAdded?.()
    } catch (error) {
      console.error('Error adding review:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to add review')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        className="focus:outline-none"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            star <= (hoveredRating || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        />
      </button>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  rating === 1 ? 'Poor' :
                  rating === 2 ? 'Fair' :
                  rating === 3 ? 'Good' :
                  rating === 4 ? 'Very Good' : 'Excellent'
                )}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment *</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || rating === 0 || !comment.trim()}
            className="w-full"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ReviewForm
