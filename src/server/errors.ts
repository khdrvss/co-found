/**
 * Error handling utilities and middleware for Express server
 * Provides consistent error responses and logging
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: string) {
    super(400, message, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Database error class
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: string) {
    super(500, message, details);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Logging utility for errors
 */
export function logError(error: Error, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  console.error(`❌ ERROR${contextStr} at ${timestamp}:`);
  console.error(`  Name: ${error.name}`);
  console.error(`  Message: ${error.message}`);
  if (error instanceof ApiError && error.details) {
    console.error(`  Details: ${error.details}`);
  }
  if (error.stack) {
    console.error(`  Stack: ${error.stack}`);
  }
}

/**
 * Express error handling middleware
 * Should be used as the last middleware in the app
 */
export function errorHandler(
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logError(error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Unexpected error
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Async route wrapper to catch errors and pass to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Retry logic for database operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw new DatabaseError(
    'Operation failed after maximum retries',
    lastError?.message
  );
}
