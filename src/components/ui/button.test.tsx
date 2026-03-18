import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should render button with variant', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button', { name: 'Outline Button' })
    expect(button).toHaveClass('border')
  })

  it('should render button with size', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button', { name: 'Large Button' })
    expect(button).toHaveClass('h-11')
  })

  it('should render button as disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await userEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render button as link when href is provided', () => {
    render(<Button asChild><a href="/test">Link Button</a></Button>)
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toHaveAttribute('href', '/test')
  })
})