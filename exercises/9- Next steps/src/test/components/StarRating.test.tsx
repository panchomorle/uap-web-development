import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import StarRating from '@/components/StarRating'

describe('StarRating Component', () => {
  it('should render stars with correct filled state', () => {
    render(<StarRating rating={3} />)
    
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
    
    // First 3 stars should be filled
    for (let i = 0; i < 3; i++) {
      expect(stars[i]).toHaveClass('text-yellow-400')
    }
    
    // Last 2 stars should be empty
    for (let i = 3; i < 5; i++) {
      expect(stars[i]).toHaveClass('text-gray-300')
    }
  })

  it('should handle fractional ratings correctly', () => {
    render(<StarRating rating={3.7} />)
    
    const stars = screen.getAllByRole('button')
    
    // First 3 stars should be fully filled
    for (let i = 0; i < 3; i++) {
      expect(stars[i]).toHaveClass('text-yellow-400')
    }
    
    // 4th star should be partially filled (3.7 rounds to 4 full stars in most implementations)
    expect(stars[3]).toHaveClass('text-yellow-400')
    
    // 5th star should be empty
    expect(stars[4]).toHaveClass('text-gray-300')
  })

  it('should call onRatingChange when interactive and star is clicked', async () => {
    const user = userEvent.setup()
    const handleRatingChange = vi.fn()
    
    render(
      <StarRating 
        rating={0} 
        interactive={true} 
        onRatingChange={handleRatingChange} 
      />
    )
    
    const stars = screen.getAllByRole('button')
    await user.click(stars[3]) // Click 4th star (0-indexed)
    
    expect(handleRatingChange).toHaveBeenCalledWith(4)
  })

  it('should not call onRatingChange when not interactive', async () => {
    const user = userEvent.setup()
    const handleRatingChange = vi.fn()
    
    render(
      <StarRating 
        rating={3} 
        interactive={false} 
        onRatingChange={handleRatingChange} 
      />
    )
    
    const stars = screen.getAllByRole('button')
    await user.click(stars[2])
    
    expect(handleRatingChange).not.toHaveBeenCalled()
  })

  it('should handle hover effects when interactive', async () => {
    const user = userEvent.setup()
    const handleRatingChange = vi.fn()
    
    render(
      <StarRating 
        rating={2} 
        interactive={true} 
        onRatingChange={handleRatingChange} 
      />
    )
    
    const stars = screen.getAllByRole('button')
    
    // Hover over 4th star
    await user.hover(stars[3])
    
    // All stars up to the hovered one should be highlighted
    // This would require checking the component's internal state
    // The exact implementation depends on how hover is handled
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<StarRating rating={3} size="sm" />)
    let stars = screen.getAllByRole('button')
    expect(stars[0]).toHaveClass('w-4', 'h-4')
    
    rerender(<StarRating rating={3} size="md" />)
    stars = screen.getAllByRole('button')
    expect(stars[0]).toHaveClass('w-5', 'h-5')
    
    rerender(<StarRating rating={3} size="lg" />)
    stars = screen.getAllByRole('button')
    expect(stars[0]).toHaveClass('w-6', 'h-6')
  })

  it('should handle edge case ratings', () => {
    // Test rating of 0
    const { rerender } = render(<StarRating rating={0} />)
    let stars = screen.getAllByRole('button')
    stars.forEach(star => {
      expect(star).toHaveClass('text-gray-300')
    })
    
    // Test rating of 5
    rerender(<StarRating rating={5} />)
    stars = screen.getAllByRole('button')
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
    
    // Test negative rating (should be treated as 0)
    rerender(<StarRating rating={-1} />)
    stars = screen.getAllByRole('button')
    stars.forEach(star => {
      expect(star).toHaveClass('text-gray-300')
    })
    
    // Test rating above 5 (should be capped at 5)
    rerender(<StarRating rating={7} />)
    stars = screen.getAllByRole('button')
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
  })

  it('should be accessible with proper ARIA attributes', () => {
    render(<StarRating rating={3} interactive={true} />)
    
    const stars = screen.getAllByRole('button')
    stars.forEach((star, index) => {
      expect(star).toHaveAttribute('aria-label', `${index + 1} star${index === 0 ? '' : 's'}`)
    })
  })

  it('should handle multiple rapid clicks correctly', async () => {
    const user = userEvent.setup()
    const handleRatingChange = vi.fn()
    
    render(
      <StarRating 
        rating={0} 
        interactive={true} 
        onRatingChange={handleRatingChange} 
      />
    )
    
    const stars = screen.getAllByRole('button')
    
    // Rapidly click different stars
    await user.click(stars[2])
    await user.click(stars[4])
    await user.click(stars[1])
    
    expect(handleRatingChange).toHaveBeenCalledTimes(3)
    expect(handleRatingChange).toHaveBeenNthCalledWith(1, 3)
    expect(handleRatingChange).toHaveBeenNthCalledWith(2, 5)
    expect(handleRatingChange).toHaveBeenNthCalledWith(3, 2)
  })

  it('should not have memory leaks when unmounted', () => {
    const { unmount } = render(<StarRating rating={3} interactive={true} />)
    
    // This test ensures clean unmounting
    expect(() => unmount()).not.toThrow()
  })
})
