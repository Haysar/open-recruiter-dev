import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display hero section with correct content', async ({ page }) => {
    await page.goto('/')

    // Check hero section content
    await expect(page.locator('h1')).toContainText('Rate your recruiter.')
    await expect(page.locator('p')).toContainText('Verified reviews by real candidates')
    
    // Check stats section
    await expect(page.locator('text=Recruiters rated')).toBeVisible()
    await expect(page.locator('text=Verified reviews')).toBeVisible()
    await expect(page.locator('text=Companies tracked')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=Sign in')
    await expect(page).toHaveURL('/sign-in')
  })

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=Find recruiters')
    await expect(page).toHaveURL('/search')
  })

  test('should display how it works section', async ({ page }) => {
    await page.goto('/')
    
    // Scroll to how it works section
    await page.click('text=How it works')
    
    // Check steps are visible
    await expect(page.locator('text=Step 1')).toBeVisible()
    await expect(page.locator('text=Step 2')).toBeVisible()
    await expect(page.locator('text=Step 3')).toBeVisible()
  })

  test('should display candidates section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=For candidates')).toBeVisible()
    await expect(page.locator('text=Your experience matters')).toBeVisible()
    await expect(page.locator('text=Make it count')).toBeVisible()
  })

  test('should display recruiters section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=For recruiters')).toBeVisible()
    await expect(page.locator('text=Your reputation')).toBeVisible()
    await expect(page.locator('text=belongs to you')).toBeVisible()
  })
})