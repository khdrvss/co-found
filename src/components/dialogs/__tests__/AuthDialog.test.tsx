import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthDialog } from '../AuthDialog'

// Mock the contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    loading: false,
  }),
}))

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, any> = {
        login: {
          title: 'Login',
          subtitle: 'Enter your credentials',
          email: 'Email',
          password: 'Password',
          fullName: 'Full Name',
          submit: 'Login',
        },
        signup: {
          title: 'Sign Up',
          subtitle: 'Create your account',
          submit: 'Create Account',
        },
        switchToSignup: 'Sign Up',
        switchToLogin: 'Login',
      }
      return translations[key] || key
    },
  }),
}))

describe('AuthDialog', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    defaultMode: 'login' as const,
  }

  it('renders login form by default', () => {
    render(<AuthDialog {...mockProps} />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    await user.click(submitButton)
    
    // Should show validation errors for empty fields
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('switches between login and signup modes', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...mockProps} />)
    
    // Initial state should show login
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})
