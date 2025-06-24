import { POOLS_USER_KEY } from '@/hooks/query-keys'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

export interface UserPoolsResult {
    pools: PoolItem[]
    metadata: {
        totalUserPools: number
        upcomingUserPools: number
        visibleUserPools: number
        hasValidUser: boolean
    }
}

const fetchUserPools = async (chainId: number): Promise<UserPoolsResult> => {
    const url = new URL('/api/pools/user-pools', window.location.origin)
    url.searchParams.append('chainId', chainId.toString())
    const response = await fetch(url)
    if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || 'Failed to fetch user pools')
    }
    return response.json() as Promise<UserPoolsResult>
}

/**
 * Enhanced hook for fetching user's next pools with robust error handling and caching
 * Follows the same pattern as useUpcomingPoolsV2 for consistency
 */
export const useUserPools = () => {
    const { ready, authenticated, user } = usePrivy()
    const chainId = useChainId()
    const userAddress = user?.wallet?.address

    // Memoize the enabled condition to prevent unnecessary re-renders
    const enabled = useMemo(() => {
        return Boolean(ready && authenticated && userAddress && chainId)
    }, [ready, authenticated, userAddress, chainId])

    const queryResult = useQuery({
        queryKey: [POOLS_USER_KEY, user?.id, chainId],
        queryFn: () => fetchUserPools(chainId),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnMount: false, // Don't refetch if we have fresh data
        refetchInterval: false, // No automatic polling
        retry: (failureCount, error) => {
            // Don't retry if user is not authenticated
            if (!authenticated || !userAddress) return false

            // With improved server action error handling, retries are less necessary
            // but we keep minimal retry for genuine network issues
            if (failureCount >= 1) return false

            // Only retry for actual network/connection errors
            const errorMessage = error?.message || ''
            return (
                errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')
            )
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Shorter max delay
    })

    const { data, isLoading, isFetching, isError, error, isSuccess } = queryResult

    // Memoize computed states to prevent unnecessary re-renders
    const computedStates = useMemo(() => {
        const isEmpty = isSuccess && (!data?.pools || data.pools.length === 0)
        const hasData = isSuccess && !!data?.pools && data.pools.length > 0
        const showSkeleton = !ready || isLoading

        return {
            isEmpty,
            hasData,
            showSkeleton,
        }
    }, [isSuccess, data?.pools, ready, isLoading])

    // Memoize metadata with fallback
    const metadata = useMemo(() => {
        return (
            data?.metadata || {
                totalUserPools: 0,
                upcomingUserPools: 0,
                visibleUserPools: 0,
                hasValidUser: Boolean(ready && authenticated && userAddress && chainId),
            }
        )
    }, [data?.metadata, ready, authenticated, userAddress, chainId])

    // Enhanced logging for development debugging (only when verbose logging is enabled)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        // Only log significant state changes, not every render
        const logKey = `${isLoading}-${isFetching}-${isError}-${computedStates.hasData}-${enabled}`
        if (!globalThis.__lastUserPoolsLogKey || globalThis.__lastUserPoolsLogKey !== logKey) {
            console.log('[useUserPools] 🔍 Hook State:', {
                // Query state
                isLoading,
                isFetching,
                isError,
                isStale: queryResult.isStale,
                enabled,

                // Data state
                hasData: computedStates.hasData,
                poolsCount: data?.pools?.length || 0,

                // Auth state
                ready,
                authenticated,
                hasUserAddress: !!userAddress,

                // Timing issue diagnosis
                authTiming: {
                    privyReady: ready,
                    privyAuthenticated: authenticated,
                    hasUserWallet: !!user?.wallet,
                    hasUserAddress: !!userAddress,
                    enabledToQuery: enabled,
                },
            })

            if (data?.metadata) {
                console.log('[useUserPools] 📊 Detailed Metadata Analysis:', data.metadata)
            }

            if (isError && error) {
                console.error('[useUserPools] ❌ Query Error Details:', {
                    message: error.message,
                    authStatus: { ready, authenticated, hasUserAddress: !!userAddress },
                    possibleCause: !ready
                        ? 'Privy not ready yet'
                        : !authenticated
                          ? 'User not authenticated'
                          : !userAddress
                            ? 'No user address available'
                            : 'Server/network error',
                })
            }

            globalThis.__lastUserPoolsLogKey = logKey
        }
    }

    // Return structure optimized for UI components
    return {
        // Core data
        pools: data?.pools || [],
        metadata,

        // Query states
        isLoading,
        isFetching,
        isError,
        isSuccess,
        error,

        // Computed states for UI (memoized)
        ...computedStates,

        // Auth states
        ready,
        authenticated,
        hasUserAddress: !!userAddress,

        // Utility functions
        refetch: queryResult.refetch,
    }
}

export type UseUserNextPoolsV2Return = ReturnType<typeof useUserPools>
