// Query utility functions for debugging and development

/**
 * Query Keys - Centralized query key definitions
 * This helps maintain consistency and makes debugging easier
 */
export const queryKeys = {
  // Counselor queries
  counselors: {
    all: ['counselors'] as const,
    stats: () => [...queryKeys.counselors.all, 'stats'] as const,
    options: () => [...queryKeys.counselors.all, 'options'] as const,
  },

  // Application queries
  applications: {
    all: ['applications'] as const,
    withCounselors: (userId: string, isAdmin: boolean, isCounselor: boolean) =>
      [...queryKeys.applications.all, 'with-counselors', userId, isAdmin, isCounselor] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboardData'] as const,
    data: (userId: string, isAdmin: boolean, isCounselor: boolean, isAgent: boolean) =>
      [...queryKeys.dashboard.all, userId, isAdmin, isCounselor, isAgent] as const,
  },
} as const;

/**
 * Development helper to log query information
 * Only works in development mode
 */
export const logQueryInfo = (queryKey: readonly unknown[], data: unknown, status: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Query: ${JSON.stringify(queryKey)}`);
    console.log('Status:', status);
    console.log('Data:', data);
    console.groupEnd();
  }
};

/**
 * Development helper to log mutation information
 * Only works in development mode
 */
export const logMutationInfo = (mutationKey: string, variables: unknown, status: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 Mutation: ${mutationKey}`);
    console.log('Status:', status);
    console.log('Variables:', variables);
    console.groupEnd();
  }
};

/**
 * Helper to create consistent error messages
 */
export const createErrorMessage = (operation: string, error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return `Failed to ${operation}: ${errorMessage}`;
};

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * Query configuration presets
 */
export const queryConfig = {
  // Fast refresh for real-time data
  realtime: {
    staleTime: 0,
    refetchInterval: 5000,
  },

  // Standard caching for most queries
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  },

  // Long-term caching for static data
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  },

  // No caching for sensitive data
  noCache: {
    staleTime: 0,
    cacheTime: 0,
    retry: 0,
  },
} as const;

/**
 * Mutation configuration presets
 */
export const mutationConfig = {
  // Standard mutation settings
  standard: {
    retry: 1,
  },

  // Critical mutations (no retry)
  critical: {
    retry: 0,
  },

  // Background mutations (multiple retries)
  background: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;
