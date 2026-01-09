/**
 * Rate limiting middleware for Express
 * Protects against brute force attacks on sensitive endpoints
 * 
 * Note: Requires: npm install express-rate-limit @types/express-rate-limit
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      details: 'You have exceeded the rate limit. Please try again later.',
      statusCode: 429,
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests too
  keyGenerator: (req) => {
    // Rate limit by email + IP combination for more granular control
    const email = req.body?.email || req.ip;
    return `${email}:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      details: 'Your account has been temporarily locked. Please try again in 15 minutes.',
      statusCode: 429,
    });
  },
});

/**
 * Strict rate limiter for signup endpoint
 * 3 attempts per hour per IP
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many accounts created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many signup attempts',
      details: 'Too many signup attempts from this IP. Please try again in 1 hour.',
      statusCode: 429,
    });
  },
});

/**
 * Moderate rate limiter for API mutations
 * 30 requests per minute per IP
 */
export const mutationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      details: 'Please slow down and try again.',
      statusCode: 429,
    });
  },
});

/**
 * Lenient rate limiter for GET requests
 * 200 requests per minute per IP
 */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
