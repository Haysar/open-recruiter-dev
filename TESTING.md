# Testing Guide

This document outlines the testing strategy and setup for the Open-Recruiter project.

## Testing Stack

- **Unit & Integration Tests**: [Vitest](https://vitest.dev/) with React Testing Library
- **End-to-End Tests**: [Playwright](https://playwright.dev/)
- **Coverage**: Vitest built-in coverage with V8 provider
- **CI/CD**: GitHub Actions

## Test Structure

```
src/
├── lib/
│   ├── utils.test.ts          # Utility function tests
│   ├── auth.test.ts           # Authentication tests
│   └── storage.test.ts        # File storage tests
├── app/
│   └── api/
│       └── **/*.test.ts       # API route tests
└── test/
    ├── setup.ts               # Test configuration and mocks
    ├── utils.ts               # Test utilities and helpers
    └── db.ts                  # Database testing utilities

tests/
└── e2e/
    └── **/*.spec.ts           # End-to-end tests
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test utils.test.ts

# Run tests in watch mode
npm test -- --watch
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e home.spec.ts

# Run tests in headed mode
npm run test:e2e -- --headed
```

### All Tests

```bash
# Run unit, integration, and E2E tests
npm run test:all
```

## Test Configuration

### Vitest Configuration

The `vitest.config.ts` file configures:

- **Environment**: jsdom for React component testing
- **Setup**: Global test setup and mocks in `src/test/setup.ts`
- **Coverage**: V8 provider with HTML, JSON, and text reporters
- **Aliases**: Path aliases for easier imports

### Playwright Configuration

The `playwright.config.ts` file configures:

- **Test Directory**: `tests/e2e/`
- **Browsers**: Chromium, Firefox, and WebKit
- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts dev server
- **Trace**: Enabled on first retry for debugging

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('January 15, 2024')
  })
})
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { customRender } from '@/test/utils'
import { Button } from './Button'

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### API Tests

```typescript
import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('/api/auth/session', () => {
  it('should return session when authenticated', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to sign in page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sign in')
  await expect(page).toHaveURL('/sign-in')
})
```

## Test Utilities

### Mock Helpers

```typescript
import { mockSession, mockUseSession } from '@/test/utils'

// Mock authentication
mockUseSession(mockSession)

// Mock Prisma operations
mockPrisma.user.findUnique.mockResolvedValue(mockUser)
```

### Database Testing

```typescript
import { withTestDB } from '@/test/db'

describe('User operations', () => {
  it('should create user', async () => {
    await withTestDB(async (db) => {
      const user = await db.user.create({
        data: { name: 'Test', email: 'test@example.com' }
      })
      expect(user.name).toBe('Test')
    })
  })
})
```

## Mocking

The test setup includes mocks for:

- **Next.js**: Router, auth, and navigation
- **Prisma**: Database operations
- **External APIs**: AWS S3, Supabase, Nodemailer
- **Browser APIs**: ResizeObserver, matchMedia

## Coverage

Coverage reports are generated in:

- `coverage/lcov.info` - LCOV format for CI
- `coverage/html/` - HTML report for local viewing
- `coverage/coverage-final.json` - JSON summary

## Continuous Integration

The GitHub Actions workflow:

1. **Unit Tests**: Runs on Node.js 18.x and 20.x
2. **Linting**: ESLint validation
3. **Coverage**: Uploads to Codecov
4. **E2E Tests**: Runs on Ubuntu with all browsers
5. **Artifacts**: Saves test reports on failure

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the behavior
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock External Dependencies**: Avoid network calls in unit tests
4. **Test One Thing**: Each test should verify a single behavior
5. **Use Test Utilities**: Leverage shared helpers and mocks
6. **Coverage Goals**: Aim for 80%+ coverage on business logic
7. **E2E Focus**: Test critical user journeys, not every interaction

## Debugging Tests

### Unit Tests

```bash
# Run with debugger
npm test -- --inspect-brk

# Run specific test with verbose output
npm test utils.test.ts -- --reporter=verbose
```

### E2E Tests

```bash
# Run with browser visible
npm run test:e2e -- --headed

# Run with slow motion
npm run test:e2e -- --slowmo=1000

# Debug specific test
npm run test:e2e -- --debug home.spec.ts
```

## Troubleshooting

### Common Issues

1. **Module Resolution**: Ensure all dependencies are installed
2. **TypeScript Errors**: Check `tsconfig.json` includes test files
3. **Database Tests**: Ensure test database is clean between tests
4. **E2E Failures**: Check if dev server is running for local tests

### Reset Test Environment

```bash
# Clean node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean coverage reports
rm -rf coverage/

# Reset test database
npm run db:reset