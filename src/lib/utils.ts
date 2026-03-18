/**
 * Utility functions for the application
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength) + '...'
}

export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) {
    return 0
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateInviteCode(name: string): string {
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  const year = new Date().getFullYear().toString().slice(-2)
  return `${cleanName}-${year}`
}

export function formatReviewStats(stats: {
  totalReviews: number
  averageRating: number
  oneStar: number
  twoStar: number
  threeStar: number
  fourStar: number
  fiveStar: number
}): string {
  const { totalReviews, averageRating } = stats
  return `${totalReviews} reviews • ${averageRating}/5 avg`
}