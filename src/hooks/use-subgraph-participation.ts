import { checkUserParticipation } from '@/lib/subgraph/client'
import { useDebugStore } from '@/stores/debug.store'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to check if user is participant in a pool using subgraph
 * Replaces the expensive onchain isParticipant calls in BottomBarHandler
 */
export function useSubgraphParticipation(poolId: string | undefined, userAddress: string | undefined) {
    const { trackRequest } = useDebugStore()

    return useQuery({
        queryKey: ['subgraph-participation', poolId, userAddress],
        queryFn: async (): Promise<boolean> => {
            if (!poolId || !userAddress) return false

            // Track this request for debugging
            if (process.env.NODE_ENV === 'development') {
                trackRequest('useSubgraphParticipation', 'fetch', {
                    token: 'subgraph',
                    address: `${userAddress}-${poolId}`,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                })
            }

            console.log(`[useSubgraphParticipation] 📊 Checking participation: user=${userAddress} pool=${poolId}`)

            const isParticipant = await checkUserParticipation(poolId, userAddress)

            console.log(
                `[useSubgraphParticipation] ✅ User ${userAddress} is ${isParticipant ? '' : 'NOT '}participant in pool ${poolId}`,
            )

            return isParticipant
        },
        enabled: Boolean(poolId && userAddress),
        staleTime: 60_000, // 1 minute - participation status doesn't change frequently
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        // Add retry logic for network issues
        retry: (failureCount, error) => {
            // Don't retry on client errors
            if (error?.message?.includes('400') || error?.message?.includes('404')) {
                return false
            }
            // Retry network errors up to 2 times
            return failureCount < 2
        },
    })
}
