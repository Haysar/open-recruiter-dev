import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

/**
 * Custom render function that includes common providers
 */
export const customRender = (ui: React.ReactElement, options = {}) => {
  // You can add providers here like AuthProvider, ThemeProvider, etc.
  return render(ui, options)
}

/**
 * Mock session data for testing
 */
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: '2024-12-31T23:59:59.000Z',
}

/**
 * Mock user for testing
 */
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'CANDIDATE',
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Mock company for testing
 */
export const mockCompany = {
  id: '1',
  name: 'Test Company',
  description: 'A test company',
  website: 'https://testcompany.com',
  logoUrl: 'https://testcompany.com/logo.png',
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Mock recruiter for testing
 */
export const mockRecruiter = {
  id: '1',
  name: 'Test Recruiter',
  email: 'recruiter@testcompany.com',
  inviteCode: 'TEST-RECRUITER-2024',
  companyId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Mock review for testing
 */
export const mockReview = {
  id: '1',
  rating: 5,
  comment: 'Great recruiter!',
  experience: 5,
  speed: 5,
  transparency: 5,
  knowledge: 5,
  evidenceUrl: null,
  userId: '1',
  recruiterId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Helper to mock Next.js auth
 */
export const mockAuth = (session: any = null) => {
  vi.mocked(require('next-auth').auth).mockResolvedValue(session)
}

/**
 * Helper to mock Next.js session hook
 */
export const mockUseSession = (session: any = null) => {
  vi.mocked(require('next-auth/react').useSession).mockReturnValue({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  })
}

/**
 * Helper to mock Prisma operations
 */
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  company: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  recruiter: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  review: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

export * from '@testing-library/react'
export { userEvent }