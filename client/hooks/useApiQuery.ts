/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';


import {
  useMutation,
  useQuery,
  UseQueryOptions,
  QueryKey,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import api from '../lib/axios';
import { handleError } from '../utils';
import { ApiResponse } from '../types';

// Helper type for query parameters
export type QueryParams = Record<string, string | number | boolean | undefined>;

// ==================== GET Hook ====================
interface UseGetOptions<T> extends Partial<UseQueryOptions<T>> {
  params?: QueryParams;
  enabled?: boolean;
}

export const useGet = <T = any>(
  resourceUrl: string | null,
  options?: UseGetOptions<T>
) => {
  const [apiError, setApiError] = useState('');

  const queryKey: QueryKey = useMemo(() => {
    if (!resourceUrl) return [];
    return options?.params
      ? [resourceUrl, options.params]
      : [resourceUrl];
  }, [resourceUrl, options?.params]);

  const queryResult = useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      if (!resourceUrl) throw new Error('Invalid resource URL');
      try {
        const response = await api.get<ApiResponse<T>>(
          resourceUrl,
          { params: options?.params }
        );
        return response.data.data; // Extract nested data
      } catch (error) {
        handleError(error, setApiError);
        throw error;
      }
    },
    enabled: !!resourceUrl && (options?.enabled ?? true),
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options, // Allow overriding defaults
  });

  const stableResult = useMemo(
    () => ({
      data: queryResult.data,
      loading: queryResult.isFetching || queryResult.isPending,
      error: apiError || queryResult.error?.message || '',
      isError: queryResult.isError,
      refetch: queryResult.refetch,
      status: queryResult.status,
    }),
    [queryResult, apiError]
  );

  return stableResult;
};

// ==================== POST Hook ====================
interface UsePostOptions<T, U> extends Partial<UseMutationOptions<U, Error, T>> {
  onSuccess?: (data: U) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: QueryKey[];
}

export const usePost = <T = any, U = any>(
  postResourceUrl: string,
  options?: UsePostOptions<T, U>
) => {
  const [apiError, setApiError] = useState<string>('');

  const mutation = useMutation<U, Error, T>({
    mutationFn: async (payload: T): Promise<U> => {
      const response = await api.post<ApiResponse<U>>(postResourceUrl, payload);
      return response.data.data; // Extract nested data
    },
    onSuccess: (data) => {
      setApiError('');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleError(error, setApiError);
      options?.onError?.(error);
    },
    ...options,
  });

  const handlePost = useCallback(
    async (payload: T) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch (error) {
        // Error is already handled in onError
        return undefined;
      }
    },
    [mutation]
  );

  return {
    post: handlePost,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: apiError,
    data: mutation.data,
    reset: mutation.reset,
  };
};

// ==================== PUT Hook ====================
interface UsePutReturn<T, U> {
  put: (payload: T) => Promise<U | undefined>;
  isPending: boolean;
  isSuccess: boolean;
  error: string;
  data?: U;
  reset: () => void;
}

export const usePut = <T = any, U = any>(
  putUrl: string,
  options?: UsePostOptions<T, U> // Reuse same options as POST
): UsePutReturn<T, U> => {
  const [apiError, setApiError] = useState('');

  const mutation = useMutation<U, Error, T>({
    mutationFn: async (payload: T): Promise<U> => {
      const response = await api.put<ApiResponse<U>>(putUrl, payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      setApiError('');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleError(error, setApiError);
      options?.onError?.(error);
    },
    ...options,
  });

  const handlePut = useCallback(
    async (payload: T) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch (error) {
        return undefined;
      }
    },
    [mutation]
  );

  return {
    put: handlePut,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: apiError,
    data: mutation.data,
    reset: mutation.reset,
  };
};

// ==================== DELETE Hook ====================
interface UseDeleteOptions<U> extends Partial<UseMutationOptions<U, Error, string | number>> {
  onSuccess?: (data: U) => void;
  onError?: (error: Error) => void;
}

export const useDelete = <U = any>(
  resourceUrl: string | ((id: string | number) => string),
  options?: UseDeleteOptions<U>
) => {
  const [apiError, setApiError] = useState('');

  const mutation = useMutation<U, Error, string | number>({
    mutationFn: async (id: string | number): Promise<U> => {
      const url = typeof resourceUrl === 'function'
        ? resourceUrl(id)
        : `${resourceUrl}/${id}`;

      const response = await api.delete<ApiResponse<U>>(url);
      return response.data.data;
    },
    onSuccess: (data) => {
      setApiError('');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleError(error, setApiError);
      options?.onError?.(error);
    },
    ...options,
  });

  const handleDelete = useCallback(
    async (id: string | number) => {
      try {
        return await mutation.mutateAsync(id);
      } catch (error) {
        return undefined;
      }
    },
    [mutation]
  );

  return {
    delete: handleDelete,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: apiError,
    data: mutation.data,
    reset: mutation.reset,
  };
};

// ==================== PATCH Hook (Optional) ====================
export const usePatch = <T = any, U = any>(
  patchUrl: string,
  options?: UsePostOptions<T, U>
) => {
  const [apiError, setApiError] = useState('');

  const mutation = useMutation<U, Error, T>({
    mutationFn: async (payload: T): Promise<U> => {
      const response = await api.patch<ApiResponse<U>>(patchUrl, payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      setApiError('');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleError(error, setApiError);
      options?.onError?.(error);
    },
    ...options,
  });

  const handlePatch = useCallback(
    async (payload: T) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch (error) {
        return undefined;
      }
    },
    [mutation]
  );

  return {
    patch: handlePatch,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: apiError,
    data: mutation.data,
    reset: mutation.reset,
  };
};