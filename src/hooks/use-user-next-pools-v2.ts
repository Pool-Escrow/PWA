import { getUserNextPoolsAction } from '@/app/(pages)/pools/actions'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

/**
 * Enhanced hook for fetching user's next pools with robust error handling and caching
 * Follows the same pattern as useUpcomingPoolsV2 for consistency
 */
export const useUserNextPoolsV2 = () => {
    const { ready, authenticated, user } = usePrivy()
    const userAddress = user?.wallet?.address

    const queryResult = useQuery({
        queryKey: ['user-next-pools-v2', userAddress],
        queryFn: getUserNextPoolsAction,
        enabled: Boolean(ready && authenticated && userAddress),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, _error) => {
            // Don't retry if user is not authenticated
            if (!authenticated || !userAddress) return false

            // Exponential backoff for other errors
            return failureCount < 3
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    const { data, isLoading, isFetching, isError, error, isSuccess } = queryResult

    // Enhanced logging for development debugging
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[useUserNextPoolsV2] 🔍 Hook State:', {
            isLoading,
            isFetching,
            isError,
            isStale: queryResult.isStale,
            hasData: !!data,
            poolsCount: data?.pools?.length || 0,
            ready,
            authenticated,
            hasUserAddress: !!userAddress,
            enabled: Boolean(ready && authenticated && userAddress),
        })

        if (data?.metadata) {
            console.log('[useUserNextPoolsV2] 📊 Detailed Metadata Analysis:', data.metadata)
        }

        if (isError && error) {
            console.error('[useUserNextPoolsV2] ❌ Query Error:', error)
        }
    }

    // Return structure optimized for UI components
    return {
        // Core data
        pools: data?.pools || [],
        metadata: data?.metadata || {
            totalUserPools: 0,
            upcomingUserPools: 0,
            visibleUserPools: 0,
            hasValidUser: Boolean(ready && authenticated && userAddress),
        },

        // Query states
        isLoading: isLoading,
        isFetching: isFetching,
        isError: isError,
        isSuccess: isSuccess,
        error: error,

        // Computed states for UI
        isEmpty: isSuccess && (!data?.pools || data.pools.length === 0),
        hasData: isSuccess && !!data?.pools && data.pools.length > 0,
        showSkeleton: !ready || isLoading,

        // Auth states
        ready,
        authenticated,
        hasUserAddress: !!userAddress,

        // Utility functions
        refetch: queryResult.refetch,
    }
}

export type UseUserNextPoolsV2Return = ReturnType<typeof useUserNextPoolsV2>
