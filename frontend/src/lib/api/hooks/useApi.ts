/**
 * useApi Hook
 * Custom React hook for making API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { ApiError } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Generic hook for API calls
 * @param apiFunction - The API function to call
 * @returns Object with data, loading, error states and execute function
 */
export function useApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiFunction(...args);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
          errors: error.response?.data?.errors,
        };
        setState({ data: null, loading: false, error: apiError });
        throw apiError;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
