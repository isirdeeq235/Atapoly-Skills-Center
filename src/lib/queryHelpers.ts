/**
 * React Query utilities and helpers
 * Provides common patterns and configurations for query management
 */

import { useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Invalidate multiple query keys at once
 * Useful for mutations that affect multiple data sources
 */
export const createMultipleInvalidateCallback = (queryKeys: (string | any[])[]) => {
  return (queryClient: ReturnType<typeof useQueryClient>) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    });
  };
};

/**
 * Generic fetch function for Supabase tables
 * Reduces boilerplate for simple fetch operations
 */
export const createTableFetch = (supabase: SupabaseClient) => {
  return async <T,>(
    table: string,
    select: string = '*',
    filters?: { column: string; value: any; operator?: 'eq' | 'gt' | 'lt' }[]
  ): Promise<T[]> => {
    let query = supabase.from(table).select(select);

    if (filters) {
      filters.forEach(({ column, value, operator = 'eq' }) => {
        query = query[operator](column, value);
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as T[];
  };
};

/**
 * Default query options for often-used configurations
 */
export const queryOptions = {
  // Short cache for frequently changing data
  short: {
    staleTime: 10000, // 10 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  } satisfies UseQueryOptions,

  // Medium cache for moderately changing data
  medium: {
    staleTime: 30000, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
  } satisfies UseQueryOptions,

  // Long cache for stable data
  long: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 30, // 30 minutes
  } satisfies UseQueryOptions,

  // Very long cache for rarely changing data
  veryLong: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  } satisfies UseQueryOptions,
} as const;

/**
 * Default mutation options with common patterns
 */
export const mutationOptions = {
  withInvalidation: (queryClient: ReturnType<typeof useQueryClient>, keys: (string | any[])[]) => ({
    onSuccess: () => {
      keys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    },
  }) satisfies UseMutationOptions,
} as const;
