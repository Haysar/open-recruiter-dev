import { PrismaClient } from '@prisma/client'

/**
 * Test database utilities
 */
export class TestDB {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!TestDB.instance) {
      TestDB.instance = new PrismaClient({
        log: ['query', 'error', 'warn'],
      })
    }
    return TestDB.instance
  }

  /**
   * Clean all data from the database
   */
  static async cleanDatabase() {
    const db = TestDB.getInstance()

    // Delete in order to respect foreign key constraints
    await db.review.deleteMany({})
    await db.recruiter.deleteMany({})
    await db.company.deleteMany({})
    await db.user.deleteMany({})
  }

  /**
   * Seed test data
   */
  static async seedTestData() {
    const db = TestDB.getInstance()

    // Create test user
    const user = await db.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'CANDIDATE',
        emailVerified: new Date(),
      },
    })

    // Create test company
    const company = await db.company.create({
      data: {
        name: 'Test Company',
        description: 'A test company',
        website: 'https://testcompany.com',
        logoUrl: 'https://testcompany.com/logo.png',
      },
    })

    // Create test recruiter
    const recruiter = await db.recruiter.create({
      data: {
        name: 'Test Recruiter',
        email: 'recruiter@testcompany.com',
        inviteCode: 'TEST-RECRUITER-2024',
        companyId: company.id,
      },
    })

    // Create test review
    const review = await db.review.create({
      data: {
        rating: 5,
        comment: 'Great recruiter!',
        experience: 5,
        speed: 5,
        transparency: 5,
        knowledge: 5,
        userId: user.id,
        recruiterId: recruiter.id,
      },
    })

    return { user, company, recruiter, review }
  }
}

/**
 * Test helper to setup and teardown database
 */
export async function withTestDB<T>(testFn: (db: PrismaClient) => Promise<T>): Promise<T> {
  const db = TestDB.getInstance()

  try {
    await TestDB.cleanDatabase()
    return await testFn(db)
  } finally {
    await TestDB.cleanDatabase()
  }
}