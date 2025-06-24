import { POOLS_USER_KEY } from '@/hooks/query-keys'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

const fetchUserPools = async (status: 'upcoming' | 'past', chainId: number): Promise<PoolItem[]> => {
    const url = new URL('/api/pools/user-pools', window.location.origin)
    url.searchParams.append('status', status)
    url.searchParams.append('chainId', chainId.toString())
    const response = await fetch(url)
    if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || 'Failed to fetch user pools')
    }
    return response.json() as Promise<PoolItem[]>
}

/**
 * Enhanced hook for fetching user's pools with robust error handling and caching
 * @param status - The status of pools to fetch ('upcoming' or 'past').
 */
export const useUserPools = (status: 'upcoming' | 'past', options?: { initialData?: PoolItem[] }) => {
    const { ready, authenticated, user } = usePrivy()
    const chainId = useChainId()
    const userAddress = user?.wallet?.address

    const enabled = useMemo(() => {
        return Boolean(ready && authenticated && userAddress && chainId)
    }, [ready, authenticated, userAddress, chainId])

    const queryResult = useQuery({
        queryKey: [POOLS_USER_KEY, user?.id, chainId, status],
        queryFn: () => fetchUserPools(status, chainId),
        initialData: options?.initialData,
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 1,
    })

    const { data: pools, isLoading, isFetching, isError, error, isSuccess } = queryResult

    const computedStates = useMemo(() => {
        const isEmpty = isSuccess && (!pools || pools.length === 0)
        const hasData = isSuccess && !!pools && pools.length > 0
        const showSkeleton = !ready || isLoading

        return {
            isEmpty,
            hasData,
            showSkeleton,
        }
    }, [isSuccess, pools, ready, isLoading])

    // Return structure optimized for UI components
    return {
        pools: pools || [],
        isLoading,
        isFetching,
        isError,
        isSuccess,
        error,
        ...computedStates,
        ready,
        authenticated,
        hasUserAddress: !!userAddress,
        refetch: queryResult.refetch,
    }
}

export type UseUserNextPoolsV2Return = ReturnType<typeof useUserPools>
