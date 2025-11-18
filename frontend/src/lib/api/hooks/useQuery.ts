/**
 * useQuery Hook
 * Custom React hook for fetching data on component mount
 */

import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { ApiError } from '../types';

interface UseQueryOptions<T = unknown> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseQueryReturn<T> extends UseQueryState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fetching data with automatic execution
 * @param _queryKey - Unique key for the query (reserved for future caching)
 * @param queryFunction - Function that fetches the data
 * @param options - Additional options
 * @returns Object with data, loading, error states and refetch function
 */
export function useQuery<T = unknown>(
  _queryKey: string | unknown[],
  queryFunction: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryReturn<T> {
  const { enabled = true, refetchOnMount = true, onSuccess, onError } = options;

  const [state, setState] = useState<UseQueryState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await queryFunction();
      setState({ data: response, loading: false, error: null });
      onSuccess?.(response);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An error occurred',
        statusCode: error.response?.status || 500,
        error: error.response?.data?.error,
        errors: error.response?.data?.errors,
      };
      setState({ data: null, loading: false, error: apiError });
      onError?.(apiError);
    }
  }, [enabled, queryFunction, onSuccess, onError]);

  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
  }, [fetchData, refetchOnMount]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    refetch: fetchData,
    reset,
  };
}
