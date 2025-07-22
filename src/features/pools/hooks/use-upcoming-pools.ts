'use client'

import { POOLS_UPCOMING_KEY } from '@/hooks/query-keys'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { useDeveloperStore } from '@/stores/developer.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

interface PoolsQueryResult {
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
        fetchTime: number
        cacheStatus: string
    }
}

const fetchUpcomingPools = async (chainId?: number): Promise<PoolsQueryResult> => {
    const url = new URL('/api/pools/upcoming', window.location.origin)
    if (chainId) {
        url.searchParams.append('chainId', chainId.toString())
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || 'Failed to fetch upcoming pools')
    }
    return (await response.json()) as PoolsQueryResult
}

export function useUpcomingPools(initialData?: PoolsQueryResult) {
    const chainId = useChainId()
    const { settings } = useDeveloperStore()
    const queryClient = useQueryClient()

    // Memoized query key for stable references
    const queryKey = useMemo(
        () => [POOLS_UPCOMING_KEY, chainId, settings.poolFilterMode] as const,
        [chainId, settings.poolFilterMode],
    )

    // Prefetch next likely queries for smoother UX
    const prefetchRelatedQueries = useMemo(() => {
        const prefetch = () => {
            if (typeof window !== 'undefined' && chainId) {
                // Only prefetch on client-side after initial load and with a valid chainId
                setTimeout(() => {
                    queryClient
                        .prefetchQuery({
                            queryKey: ['user-pools', chainId, 'upcoming'],
                            queryFn: () =>
                                fetch(`/api/pools/user-pools?status=upcoming&chainId=${chainId}`).then(res =>
                                    res.json(),
                                ),
                            staleTime: 60_000, // 1 minute for user-specific data
                        })
                        .catch(() => {
                            // Silent fail for prefetch
                        })
                }, 1000)
            }
        }
        return prefetch
    }, [queryClient, chainId])

    const query = useQuery<PoolsQueryResult, Error>({
        queryKey: [POOLS_UPCOMING_KEY, chainId, settings.poolFilterMode] as const,
        queryFn: () => fetchUpcomingPools(chainId),
        initialData: initialData,

        // Performance optimizations
        staleTime: 30_000, // 30 seconds - pools don't change frequently
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        refetchOnWindowFocus: true, // Fresh data on tab focus
        refetchOnMount: 'always', // Always get fresh data on mount
        refetchInterval: false, // No automatic polling (user-triggered only)

        // Smart retry logic based on error type
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx)
            if (error.message.includes('Rate limit') || error.message.includes('(4')) {
                return false
            }

            // Retry network errors and server errors up to 2 times
            if (error.message.includes('Network error') || error.message.includes('Server error')) {
                return failureCount < 2
            }

            // Default: retry once for other errors
            return failureCount < 1
        },

        // Exponential backoff with jitter for retries
        retryDelay: attemptIndex => {
            const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000)
            const jitter = Math.random() * 0.1 * baseDelay
            return baseDelay + jitter
        },

        // Enable background updates for better UX
        refetchOnReconnect: true,

        // Optimize for React 18 concurrent features
        notifyOnChangeProps: ['data', 'error', 'isLoading'],
    })

    // Trigger prefetch after successful data load
    if (query.isSuccess && !query.isFetching) {
        prefetchRelatedQueries()
    }

    // Enhanced debugging in development
    if (process.env.NODE_ENV === 'development' && query.data?.metadata) {
        const { metadata } = query.data

        // Log performance metrics
        if (metadata.fetchTime > 1000) {
            console.warn('[useUpcomingPools] ⚠️ Slow query detected:', {
                fetchTime: `${metadata.fetchTime}ms`,
                chainId,
                cacheStatus: metadata.cacheStatus,
            })
        }

        // Log sync issues
        if (metadata.totalContractPools > 0 && metadata.visiblePools === 0) {
            console.warn('[useUpcomingPools] ⚠️ No visible pools detected:', {
                contractPools: metadata.totalContractPools,
                syncedPools: metadata.syncedPools,
                visiblePools: metadata.visiblePools,
            })
        }
    }

    return {
        ...query,
        // Additional convenience properties
        hasData: Boolean(query.data?.pools?.length),
        isEmpty: query.isSuccess && (!query.data?.pools || query.data.pools.length === 0),
        metadata: query.data?.metadata,

        // Performance metrics for debugging
        isStale: query.isStale,
        isFetchedAfterMount: query.isFetchedAfterMount,

        // Helper methods
        invalidate: () => queryClient.invalidateQueries({ queryKey }),
        refresh: () => queryClient.refetchQueries({ queryKey }),
    }
}

// TODO: only load in developer mode or combine both hooks
/**
 * Hook for pools data with built-in debugging
 */
// export function useUpcomingPoolsWithDebug() {
//     // This hook will need to be adapted if it's still needed,
//     // as it doesn't have access to initialData directly.
//     // For now, it might not work as intended without being passed initialData.
//     const queryResult = useUpcomingPools(undefined as any) // This will now fail, needs refactoring.
//     const { data, isLoading, isError, error, isFetching, isStale } = queryResult

//     // Development debugging
//     if (process.env.NODE_ENV === 'development') {
//         console.log('[useUpcomingPools] 🔍 Hook State:', {
//             // Query state
//             isLoading,
//             isFetching,
//             isError,
//             isStale,
//             hasData: !!data,

//             // Pool data
//             poolsCount: data?.pools?.length || 0,
//             metadata: data?.metadata,

//             // First few pools for inspection
//             samplePools: data?.pools?.slice(0, 3),

//             // Error details
//             errorMessage: error?.message,
//             errorStack: error?.stack,
//         })

//         // Log sync issues with detailed breakdown
//         if (data?.metadata) {
//             const { totalContractPools, totalDbPools, syncedPools, visiblePools } = data.metadata

//             console.log('[useUpcomingPools] 📊 Detailed Metadata Analysis:', {
//                 contractPools: totalContractPools,
//                 dbPools: totalDbPools,
//                 syncedPools,
//                 visiblePools,
//                 syncPercentage: totalContractPools > 0 ? Math.round((syncedPools / totalContractPools) * 100) : 0,
//                 visibilityPercentage: syncedPools > 0 ? Math.round((visiblePools / syncedPools) * 100) : 0,
//             })

//             if (totalContractPools > 0 && visiblePools === 0) {
//                 console.warn('[useUpcomingPools] ⚠️ SYNC ISSUE DETECTED:', {
//                     issue: 'Pools exist in contract but none are visible',
//                     possibleCauses: [
//                         'Pool status filtering (check POOLSTATUS values)',
//                         'Database-contract sync issues',
//                         'Pool visibility filtering (isPoolStatusVisible)',
//                         'Contract pool status > DEPOSIT_ENABLED',
//                     ],
//                 })
//             }

//             if (totalContractPools === 0) {
//                 console.warn('[useUpcomingPools] ⚠️ NO CONTRACT POOLS:', {
//                     issue: 'No pools found in smart contract',
//                     possibleCauses: [
//                         'Wrong chain ID (check chainId)',
//                         'Contract address incorrect',
//                         'RPC connection issues',
//                         'No pools deployed on this chain',
//                     ],
//                 })
//             }
//         }
//     }

//     return queryResult
// }
