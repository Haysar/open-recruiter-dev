import { describe, it, expect, beforeEach, vi } from 'vitest'
import { auth } from './auth'

// Mock NextAuth
vi.mock('next-auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}))

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('auth function', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: '2024-12-31T23:59:59.000Z',
      }

      vi.mocked(require('next-auth').auth).mockResolvedValue(mockSession)

      const result = await auth()
      expect(result).toEqual(mockSession)
    })

    it('should return null when user is not authenticated', async () => {
      vi.mocked(require('next-auth').auth).mockResolvedValue(null)

      const result = await auth()
      expect(result).toBeNull()
    })
  })
})