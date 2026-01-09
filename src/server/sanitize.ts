/**
 * Input sanitization and XSS prevention utilities
 * Sanitizes user input to prevent XSS attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed)[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/(iframe|object|embed)>/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized.trim();
}

/**
 * Sanitize plain text to prevent XSS
 * Escapes HTML special characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Remove leading/trailing whitespace and convert to lowercase
  return email.trim().toLowerCase();
}

/**
 * Sanitize a single string input (for form fields, etc.)
 * Escapes HTML and trims whitespace
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML special characters
  sanitized = sanitizeText(sanitized);

  return sanitized;
}

/**
 * Sanitize an object's string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as any;

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize user input for common fields
 */
export const sanitizers = {
  /**
   * Validate and sanitize email
   */
  email: (email: unknown): string => {
    if (typeof email !== 'string') return '';
    const sanitized = sanitizeEmail(email);
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  },

  /**
   * Validate and sanitize username (alphanumeric, underscore, dash)
   */
  username: (username: unknown): string => {
    if (typeof username !== 'string') return '';
    const sanitized = sanitizeInput(username).toLowerCase();
    // Allow alphanumeric, underscore, dash
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    return usernameRegex.test(sanitized) ? sanitized : '';
  },

  /**
   * Validate and sanitize name (letters, spaces, common punctuation)
   */
  name: (name: unknown): string => {
    if (typeof name !== 'string') return '';
    return sanitizeInput(name);
  },

  /**
   * Validate and sanitize phone number
   */
  phone: (phone: unknown): string => {
    if (typeof phone !== 'string') return '';
    // Remove all non-digit characters except +
    const sanitized = phone.replace(/[^\d+]/g, '');
    // Check if it looks like a valid phone number (7-15 digits)
    return /^(\+?\d{7,15})$/.test(sanitized) ? sanitized : '';
  },

  /**
   * Validate and sanitize URL
   */
  url: (url: unknown): string => {
    if (typeof url !== 'string') return '';
    return sanitizeUrl(url);
  },

  /**
   * Validate and sanitize description/bio (allows some HTML)
   */
  bio: (bio: unknown): string => {
    if (typeof bio !== 'string') return '';
    const sanitized = sanitizeInput(bio);
    // Limit length
    return sanitized.substring(0, 500);
  },
};

/**
 * Middleware to sanitize all request body inputs
 */
export function sanitizeRequestBody(req: any, res: any, next: any) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}

/**
 * Sanitize array of strings
 */
export function sanitizeArray(arr: unknown[]): string[] {
  if (!Array.isArray(arr)) return [];

  return arr
    .filter((item) => typeof item === 'string')
    .map((item) => sanitizeInput(item))
    .filter((item) => item.length > 0);
}
