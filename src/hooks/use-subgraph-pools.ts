import type { PoolItem } from '@/lib/entities/models/pool-item'
import {
    checkUserParticipation,
    fetchAllPools,
    fetchPoolData,
    fetchUserPools,
    formatSubgraphAmount,
    subgraphTimestampToDate,
} from '@/lib/subgraph/client'
import type { SubgraphPoolData } from '@/lib/subgraph/types'
import { useDebugStore } from '@/stores/debug.store'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to fetch all pools from subgraph
 * Replaces onchain contract calls with indexed data
 */
export function useSubgraphPools() {
    const { trackRequest } = useDebugStore()

    return useQuery({
        queryKey: ['subgraph-pools'],
        queryFn: async () => {
            // Track this request for debugging
            if (process.env.NODE_ENV === 'development') {
                trackRequest('useSubgraphPools', 'fetch', {
                    token: 'subgraph',
                    address: 'pools',
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                })
            }

            const response = await fetchAllPools()

            // Convert to PoolItem format for compatibility
            const pools: PoolItem[] = response.poolCreateds.map(pool => ({
                id: pool.poolId,
                name: pool.poolName,
                startDate: subgraphTimestampToDate(pool.timestamp_), // Using creation time as temp start date
                endDate: new Date(subgraphTimestampToDate(pool.timestamp_).getTime() + 24 * 60 * 60 * 1000), // +24hrs as temp end date
                numParticipants: 0, // Will be calculated in detailed queries
                status: 0, // Default INACTIVE, will be updated from PoolStatusChanged events
                image: '', // Not available in subgraph
                softCap: formatSubgraphAmount(pool.depositAmountPerPerson) * 10, // Assuming 10 participants as temp soft cap
            }))

            return {
                pools,
                metadata: {
                    totalContractPools: pools.length,
                    totalDbPools: pools.length,
                    visiblePools: pools.length,
                    syncedPools: pools.length,
                    fetchTime: Date.now(),
                    cacheStatus: 'subgraph' as const,
                },
            }
        },
        staleTime: 30_000, // 30 seconds
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })
}

/**
 * Hook to fetch detailed pool data from subgraph
 * Replaces multiple onchain calls with single subgraph query
 */
export function useSubgraphPoolData(poolId: string | undefined) {
    const { trackRequest } = useDebugStore()

    return useQuery({
        queryKey: ['subgraph-pool-data', poolId],
        queryFn: async (): Promise<SubgraphPoolData> => {
            if (!poolId) throw new Error('Pool ID is required')

            // Track this request for debugging
            if (process.env.NODE_ENV === 'development') {
                trackRequest('useSubgraphPoolData', 'fetch', {
                    token: 'subgraph',
                    address: `pool-${poolId}`,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                })
            }

            return await fetchPoolData(poolId)
        },
        enabled: Boolean(poolId),
        staleTime: 60_000, // 1 minute
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })
}

/**
 * Hook to fetch user's pools from subgraph
 * Replaces onchain getUserPools calls
 */
export function useSubgraphUserPools(userAddress: string | undefined, status: 'upcoming' | 'past' = 'upcoming') {
    const { trackRequest } = useDebugStore()

    return useQuery({
        queryKey: ['subgraph-user-pools', userAddress, status],
        queryFn: async (): Promise<PoolItem[]> => {
            if (!userAddress) throw new Error('User address is required')

            // Track this request for debugging
            if (process.env.NODE_ENV === 'development') {
                trackRequest('useSubgraphUserPools', 'fetch', {
                    token: 'subgraph',
                    address: userAddress,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                })
            }

            const response = await fetchUserPools(userAddress)

            // Convert hosted pools to PoolItem format
            const pools: PoolItem[] = response.poolCreateds.map(pool => ({
                id: pool.poolId,
                name: pool.poolName,
                startDate: subgraphTimestampToDate(pool.timestamp_),
                endDate: new Date(subgraphTimestampToDate(pool.timestamp_).getTime() + 24 * 60 * 60 * 1000),
                numParticipants: 0, // Would need to be calculated from deposits
                status: 0, // Default INACTIVE
                image: '',
                softCap: formatSubgraphAmount(pool.depositAmountPerPerson) * 10,
            }))

            return pools
        },
        enabled: Boolean(userAddress),
        staleTime: 60_000, // 1 minute
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })
}

/**
 * Hook to check if user is participant in a pool using subgraph
 * Replaces onchain isParticipant calls
 */
export function useSubgraphUserParticipation(poolId: string | undefined, userAddress: string | undefined) {
    const { trackRequest } = useDebugStore()

    return useQuery({
        queryKey: ['subgraph-user-participation', poolId, userAddress],
        queryFn: async (): Promise<boolean> => {
            if (!poolId || !userAddress) return false

            // Track this request for debugging
            if (process.env.NODE_ENV === 'development') {
                trackRequest('useSubgraphUserParticipation', 'fetch', {
                    token: 'subgraph',
                    address: `${userAddress}-${poolId}`,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                })
            }

            return await checkUserParticipation(poolId, userAddress)
        },
        enabled: Boolean(poolId && userAddress),
        staleTime: 60_000, // 1 minute
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })
}
