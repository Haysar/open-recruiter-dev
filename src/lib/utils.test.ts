import { describe, it, expect } from 'vitest'
import {
  formatDate,
  truncateString,
  calculateAverageRating,
  validateEmail,
  generateInviteCode,
  formatReviewStats,
} from './utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('January 15, 2024')
    })
  })

  describe('truncateString', () => {
    it('should return original string if length is within limit', () => {
      expect(truncateString('Hello', 10)).toBe('Hello')
    })

    it('should truncate string and add ellipsis if length exceeds limit', () => {
      expect(truncateString('Hello World', 8)).toBe('Hello Wo...')
    })
  })

  describe('calculateAverageRating', () => {
    it('should return 0 for empty array', () => {
      expect(calculateAverageRating([])).toBe(0)
    })

    it('should calculate average rating correctly', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 5 },
      ]
      expect(calculateAverageRating(reviews)).toBe(4.2)
    })

    it('should round to one decimal place', () => {
      const reviews = [
        { rating: 4 },
        { rating: 4 },
        { rating: 5 },
      ]
      expect(calculateAverageRating(reviews)).toBe(4.3)
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })

    it('should return false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false)
    })

    it('should return false for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false)
    })
  })

  describe('generateInviteCode', () => {
    it('should generate invite code from name', () => {
      const name = 'John Doe'
      const code = generateInviteCode(name)
      expect(code).toMatch(/^JOHND-24$/)
    })

    it('should handle special characters in name', () => {
      const name = "John O'Connor-Smith"
      const code = generateInviteCode(name)
      expect(code).toMatch(/^JOHNOCON-24$/)
    })

    it('should limit name to 8 characters', () => {
      const name = 'Very Long Name That Exceeds Limit'
      const code = generateInviteCode(name)
      expect(code).toMatch(/^VERYLO-24$/)
    })
  })

  describe('formatReviewStats', () => {
    it('should format stats correctly', () => {
      const stats = {
        totalReviews: 25,
        averageRating: 4.2,
        oneStar: 2,
        twoStar: 3,
        threeStar: 5,
        fourStar: 8,
        fiveStar: 7,
      }
      expect(formatReviewStats(stats)).toBe('25 reviews • 4.2/5 avg')
    })
  })
})