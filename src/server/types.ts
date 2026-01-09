/**
 * TypeScript interfaces for all API responses
 * Provides type safety throughout the application
 */

import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.string().datetime().optional(),
});

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  viloyat: z.string().optional(),
  role: z.string().optional(),
  skills: z.array(z.string()).optional(),
  lookingFor: z.string().optional(),
  available: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UserWithProfileSchema = UserSchema.extend({
  profile: ProfileSchema.optional(),
});

// Project types
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  stage: z.string(),
  viloyat: z.string(),
  workType: z.string().default('office'),
  lookingFor: z.array(z.string()).optional(),
  recommended: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const ProjectWithUserSchema = ProjectSchema.extend({
  user: UserWithProfileSchema.optional(),
});

// Message types
export const MessageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().uuid(),
  recipientId: z.string().uuid(),
  message: z.string(),
  createdAt: z.string().datetime(),
  senderName: z.string().optional(),
  senderAvatar: z.string().optional(),
});

// Join request types
export const JoinRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  message: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Bookmark types
export const BookmarkSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  profileId: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
});

// API Response wrapper for consistency
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Error response
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  statusCode: z.number().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type UserWithProfile = z.infer<typeof UserWithProfileSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithUser = z.infer<typeof ProjectWithUserSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type JoinRequest = z.infer<typeof JoinRequestSchema>;
export type Bookmark = z.infer<typeof BookmarkSchema>;
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Runtime validation for API responses from database
 */
export function validateUserResponse(data: unknown): User {
  return UserSchema.parse(data);
}

export function validateProfileResponse(data: unknown): Profile {
  return ProfileSchema.parse(data);
}

export function validateProjectResponse(data: unknown): Project {
  return ProjectSchema.parse(data);
}

export function validateMessageResponse(data: unknown): Message {
  return MessageSchema.parse(data);
}
