'use client'

import { getUpcomingPoolsAction } from '@/app/(pages)/pools/actions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { useDeveloperStore } from '@/stores/developer.store'
import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'

interface PoolsQueryResult {
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
    }
}

export function useUpcomingPoolsV2() {
    const chainId = useChainId()
    const { settings } = useDeveloperStore()

    return useQuery<PoolsQueryResult, Error>({
        queryKey: ['upcoming-pools-v2', chainId, settings.poolFilterMode],
        queryFn: () => getUpcomingPoolsAction(chainId),
        staleTime: 30_000, // 30 seconds - pools don't change frequently
        gcTime: 5 * 60 * 1000, // 5 minutes cache
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: false, // No polling by default
        retry: (failureCount, error) => {
            // Retry up to 2 times for network errors, but not for validation errors
            if (failureCount >= 2) return false
            if (error.message.includes('Failed to fetch')) return true
            return false
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    })
}

/**
 * Hook for pools data with built-in debugging
 */
export function useUpcomingPoolsWithDebug() {
    const queryResult = useUpcomingPoolsV2()
    const { data, isLoading, isError, error, isFetching, isStale } = queryResult

    // Development debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('[useUpcomingPoolsV2] 🔍 Hook State:', {
            // Query state
            isLoading,
            isFetching,
            isError,
            isStale,
            hasData: !!data,

            // Pool data
            poolsCount: data?.pools?.length || 0,
            metadata: data?.metadata,

            // First few pools for inspection
            samplePools: data?.pools?.slice(0, 3),

            // Error details
            errorMessage: error?.message,
            errorStack: error?.stack,
        })

        // Log sync issues with detailed breakdown
        if (data?.metadata) {
            const { totalContractPools, totalDbPools, syncedPools, visiblePools } = data.metadata

            console.log('[useUpcomingPoolsV2] 📊 Detailed Metadata Analysis:', {
                contractPools: totalContractPools,
                dbPools: totalDbPools,
                syncedPools,
                visiblePools,
                syncPercentage: totalContractPools > 0 ? Math.round((syncedPools / totalContractPools) * 100) : 0,
                visibilityPercentage: syncedPools > 0 ? Math.round((visiblePools / syncedPools) * 100) : 0,
            })

            if (totalContractPools > 0 && visiblePools === 0) {
                console.warn('[useUpcomingPoolsV2] ⚠️ SYNC ISSUE DETECTED:', {
                    issue: 'Pools exist in contract but none are visible',
                    possibleCauses: [
                        'Pool status filtering (check POOLSTATUS values)',
                        'Database-contract sync issues',
                        'Pool visibility filtering (isPoolStatusVisible)',
                        'Contract pool status > DEPOSIT_ENABLED',
                    ],
                })
            }

            if (totalContractPools === 0) {
                console.warn('[useUpcomingPoolsV2] ⚠️ NO CONTRACT POOLS:', {
                    issue: 'No pools found in smart contract',
                    possibleCauses: [
                        'Wrong chain ID (check chainId)',
                        'Contract address incorrect',
                        'RPC connection issues',
                        'No pools deployed on this chain',
                    ],
                })
            }
        }
    }

    return queryResult
}
