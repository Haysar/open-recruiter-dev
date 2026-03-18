import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { auth } from '@/lib/auth'

// Mock NextAuth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

describe('/api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return session when authenticated', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: '2024-12-31T23:59:59.000Z',
      }

      vi.mocked(auth).mockResolvedValue(mockSession)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSession)
    })

    it('should return null when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'))

      const response = await GET()

      expect(response.status).toBe(500)
    })
  })
})