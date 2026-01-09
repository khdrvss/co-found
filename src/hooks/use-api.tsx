/**
 * Custom hooks for API interactions with error handling and retry logic
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

/**
 * Hook for managing async operations with automatic retry logic
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError, retries = 3, retryDelay = 1000 } = options;

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await api.retry(asyncFunction, retries, retryDelay);
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: err });
      onError?.(err);
      throw err;
    }
  }, [asyncFunction, onSuccess, onError, retries, retryDelay]);

  return { ...state, execute };
}

/**
 * Hook for API GET requests
 */
export function useApiGet<T>(
  endpoint: string,
  token?: string,
  options: UseAsyncOptions = {}
) {
  return useAsync(
    () => api.get<T>(endpoint, token),
    options
  );
}

/**
 * Hook for API POST requests
 */
export function useApiPost<T>(options: UseAsyncOptions = {}) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError, retries = 2, retryDelay = 500 } = options;

  const execute = useCallback(
    async (endpoint: string, data: any, token?: string) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await api.retry(
          () => api.post<T>(endpoint, data, token),
          retries,
          retryDelay
        );
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        onError?.(err);
        throw err;
      }
    },
    [onSuccess, onError, retries, retryDelay]
  );

  return { ...state, execute };
}

/**
 * Hook for handling mutation operations (POST, PUT, DELETE) with error handling
 */
export function useMutation<T>(options: UseAsyncOptions = {}) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError } = options;

  const mutate = useCallback(
    async (
      method: 'post' | 'put' | 'patch' | 'delete',
      endpoint: string,
      data?: any,
      token?: string
    ) => {
      setState({ data: null, loading: true, error: null });

      try {
        let result: T;

        switch (method) {
          case 'post':
            result = await api.post<T>(endpoint, data, token);
            break;
          case 'put':
            result = await api.put<T>(endpoint, data, token);
            break;
          case 'patch':
            result = await api.patch<T>(endpoint, data, token);
            break;
          case 'delete':
            result = await api.delete<T>(endpoint, token);
            break;
        }

        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        onError?.(err);
        throw err;
      }
    },
    [onSuccess, onError]
  );

  return { ...state, mutate };
}

/**
 * Helper to get user-friendly error messages
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    // Don't expose server details in production
    if (process.env.NODE_ENV === 'development' && error.details) {
      return `${error.message}: ${error.details}`;
    }
    return error.message;
  }

  if (error.message.includes('Failed to fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }

  if (error.message.includes('Network error')) {
    return 'Network error. Please try again.';
  }

  return error.message || 'An unexpected error occurred';
}
