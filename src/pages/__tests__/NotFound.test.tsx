import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '../NotFound'
import { TestWrapper } from '@/test/test-utils'

describe('NotFound Page', () => {
  it('renders not found message', () => {
    render(
      <TestWrapper>
        <NotFound />
      </TestWrapper>
    )
    
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('renders home navigation link', () => {
    render(
      <TestWrapper>
        <NotFound />
      </TestWrapper>
    )
    
    expect(screen.getByText(/go home/i)).toBeInTheDocument()
  })
})
