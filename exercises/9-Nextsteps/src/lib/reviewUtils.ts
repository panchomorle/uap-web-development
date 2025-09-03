import { Review } from './types'

/**
 * Utility functions for book review calculations and validation
 */

export function calculateReviewScore(review: Review): number {
  const netVotes = review.upvotes - review.downvotes
  const totalVotes = review.upvotes + review.downvotes
  
  if (totalVotes === 0) return review.rating
  
  // Weight the rating by community votes
  // Base score from rating (1-5), adjusted by vote ratio
  const baseScore = review.rating
  const voteRatio = totalVotes > 0 ? netVotes / totalVotes : 0
  const voteMultiplier = 1 + (voteRatio * 0.5) // Maximum 50% boost/penalty
  
  return Math.max(0, Math.min(5, baseScore * voteMultiplier))
}

export function sortReviewsByRelevance(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => {
    const scoreA = calculateReviewScore(a)
    const scoreB = calculateReviewScore(b)
    
    // Primary sort by score
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }
    
    // Secondary sort by total engagement (upvotes + downvotes)
    const engagementA = a.upvotes + a.downvotes
    const engagementB = b.upvotes + b.downvotes
    
    if (engagementA !== engagementB) {
      return engagementB - engagementA
    }
    
    // Tertiary sort by date (newer first)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function validateReviewContent(content: string): { isValid: boolean; error?: string } {
  if (!content.trim()) {
    return { isValid: false, error: 'Review content cannot be empty' }
  }
  
  if (content.length < 10) {
    return { isValid: false, error: 'Review must be at least 10 characters long' }
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: 'Review cannot exceed 1000 characters' }
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{4,}/i, // Repeated characters (5 or more)
    /^[A-Z\s!]{20,}$/i, // All caps with minimal variety
    /(buy now|click here|visit website)/i, // Common spam phrases
  ]
  
  const hasSpam = spamPatterns.some(pattern => pattern.test(content))
  if (hasSpam) {
    return { isValid: false, error: 'Review content appears to be spam' }
  }
  
  return { isValid: true }
}

export function validateRating(rating: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(rating)) {
    return { isValid: false, error: 'Rating must be a whole number' }
  }
  
  if (rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' }
  }
  
  return { isValid: true }
}

export function formatReviewDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    }
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    }
    
    const years = Math.floor(diffDays / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
  } catch {
    return 'Unknown date'
  }
}

export function calculateAverageRatingWithWeights(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  
  let totalWeightedRating = 0
  let totalWeight = 0
  
  reviews.forEach(review => {
    // Weight reviews based on community engagement
    const engagementScore = review.upvotes + review.downvotes
    const weight = Math.max(1, 1 + Math.log(1 + engagementScore)) // Logarithmic weight
    
    totalWeightedRating += review.rating * weight
    totalWeight += weight
  })
  
  return totalWeightedRating / totalWeight
}

export function getReviewStatistics(reviews: Review[]) {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      totalUpvotes: 0,
      totalDownvotes: 0,
      engagementRate: 0
    }
  }
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let totalUpvotes = 0
  let totalDownvotes = 0
  
  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    totalUpvotes += review.upvotes
    totalDownvotes += review.downvotes
  })
  
  const averageRating = calculateAverageRatingWithWeights(reviews)
  const engagementRate = (totalUpvotes + totalDownvotes) / reviews.length
  
  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    totalUpvotes,
    totalDownvotes,
    engagementRate
  }
}
