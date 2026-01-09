/**
 * Server-side input validation utilities using Zod
 * Provides schema validation for all API endpoints
 */

import { z } from 'zod';

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Credential is required'),
  clientId: z.string().optional(),
});

// Profile schemas
export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  viloyat: z.string().optional(),
  role: z.string().optional(),
  skills: z.array(z.string()).optional(),
  lookingFor: z.string().optional(),
  available: z.boolean().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  stage: z.string().min(1, 'Stage is required'),
  viloyat: z.string().min(1, 'Location is required'),
  workType: z.enum(['office', 'remote', 'hybrid']).default('office'),
  lookingFor: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

// Message schemas
export const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  recipientId: z.string().uuid('Invalid recipient ID format'),
});

// Join request schemas
export const joinRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// Bookmark schemas
export const bookmarkSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format').optional(),
  profileId: z.string().uuid('Invalid profile ID format').optional(),
}).refine(
  (data) => data.projectId || data.profileId,
  { message: 'Either projectId or profileId must be provided' }
);

// Type exports for runtime usage
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;

/**
 * Helper function to validate input and return typed data or throw error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Validation error: ${errors}`);
  }
  return result.data;
}
