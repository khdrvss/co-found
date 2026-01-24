// API URL configuration supporting both development and production
const getApiUrl = () => {
  // Always use the configured API URL (defaults to co-found.uz)
  return import.meta.env.VITE_API_URL || 'https://api.co-found.uz/api';
};

const API_URL = getApiUrl();

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handles API error responses with detailed information
 */
async function handleErrorResponse(response: Response): Promise<never> {
  try {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.error || `HTTP ${response.status}`,
      error.details || error.message
    );
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw new ApiError(
      response.status,
      `HTTP ${response.status}: ${response.statusText}`,
      'Failed to parse error response'
    );
  }
}

/**
 * Makes a fetch request with automatic token handling and error handling
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers = (fetchOptions.headers as Record<string, string>) || {};

  // Add auth token if provided
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or parsing error
    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(
      0,
      'Connection failed',
      message
    );
  }
}

export const api = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, token?: string): Promise<T> {
    return makeRequest<T>(endpoint, {
      method: 'GET',
      token,
    });
  },

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data: any, token?: string): Promise<T> {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      token,
    });
  },

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data: any, token?: string): Promise<T> {
    return makeRequest<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      token,
    });
  },

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data: any, token?: string): Promise<T> {
    return makeRequest<T>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token,
    });
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, token?: string): Promise<T> {
    return makeRequest<T>(endpoint, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Retry logic for failed requests
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode !== 429) {
          throw error;
        }

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying (${attempt}/${maxRetries}) in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  },
};

