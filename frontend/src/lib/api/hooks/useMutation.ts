/**
 * useMutation Hook
 * Custom React hook for API mutations (POST, PUT, DELETE)
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { ApiError } from '../types';

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseMutationReturn<T, V> extends UseMutationState<T> {
  mutate: (variables: V) => Promise<T | undefined>;
  mutateAsync: (variables: V) => Promise<T>;
  reset: () => void;
}

/**
 * Hook for API mutations
 * @param mutationFunction - Function that performs the mutation
 * @param options - Additional options
 * @returns Object with data, loading, error states and mutate function
 */
export function useMutation<T = unknown, V = unknown>(
  mutationFunction: (variables: V) => Promise<T>,
  options: UseMutationOptions<T> = {}
): UseMutationReturn<T, V> {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: V) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await mutationFunction(variables);
        setState({ data: response, loading: false, error: null });
        onSuccess?.(response);
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
        onError?.(apiError);
        return undefined;
      } finally {
        onSettled?.();
      }
    },
    [mutationFunction, onSuccess, onError, onSettled]
  );

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await mutationFunction(variables);
        setState({ data: response, loading: false, error: null });
        onSuccess?.(response);
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
        onError?.(apiError);
        throw apiError;
      } finally {
        onSettled?.();
      }
    },
    [mutationFunction, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}
