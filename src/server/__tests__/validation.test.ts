import { describe, it, expect } from 'vitest'
import { validateInput, signUpSchema, loginSchema } from '../validation'

describe('Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('validates correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'John Doe'
      }
      
      expect(() => validateInput(signUpSchema, validData)).not.toThrow()
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      expect(() => validateInput(signUpSchema, invalidData)).toThrow('Validation error')
    })

    it('rejects short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      }
      
      expect(() => validateInput(signUpSchema, invalidData)).toThrow('Validation error')
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      expect(() => validateInput(loginSchema, validData)).not.toThrow()
    })

    it('rejects missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }
      
      expect(() => validateInput(loginSchema, invalidData)).toThrow('Validation error')
    })
  })
})
