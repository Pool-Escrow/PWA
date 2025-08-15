import type { Address } from 'viem'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import { createPool, depositToPool, fetchPoolDetails, fetchPoolInfo } from './use-pool-contract'

/**
 * Hook to fetch pool data from API
 * Supports SSR with prefetching
 */
export function usePool(poolId: string | number, chainId: number = 84532) {
  const id = typeof poolId === 'string' ? poolId : poolId.toString()

  return useQuery({
    queryKey: QUERY_KEYS.POOL(id),
    queryFn: async (): Promise<App.PoolData> => {
      return fetchPoolInfo(BigInt(id), chainId)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook to fetch pool data with SSR support
 * Use this in pages that need SSR
 */
export function usePoolSSR(poolId: string | number, initialData?: App.PoolData, chainId: number = 84532) {
  const id = typeof poolId === 'string' ? poolId : poolId.toString()

  return useQuery({
    queryKey: QUERY_KEYS.POOL(id),
    queryFn: async (): Promise<App.PoolData> => {
      return fetchPoolInfo(BigInt(id), chainId)
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook to fetch pool details (lighter endpoint)
 */
export function usePoolDetails(poolId: string | number, chainId: number = 84532) {
  const id = typeof poolId === 'string' ? poolId : poolId.toString()

  return useQuery({
    queryKey: [...QUERY_KEYS.POOL(id), 'details'],
    queryFn: async (): Promise<App.PoolData> => {
      return fetchPoolDetails(BigInt(id), chainId)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook to create a new pool
 */
export function useCreatePool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      params,
      chainId = 84532,
    }: {
      params: {
        timeStart: number
        timeEnd: number
        poolName: string
        depositAmountPerPerson: bigint
        penaltyFeeRate: number
        token: Address
      }
      chainId?: number
    }) => {
      return createPool(params, chainId)
    },
    onSuccess: (data) => {
      // Invalidate and refetch pools list
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POOLS })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POOLS_UPCOMING })

      // If we have a pool ID, we can also invalidate that specific pool
      if (data.poolId) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POOL(data.poolId) })
      }
    },
  })
}

/**
 * Hook to deposit to a pool
 */
export function useDepositToPool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      poolId,
      amount,
      chainId = 84532,
    }: {
      poolId: bigint
      amount: bigint
      chainId?: number
    }) => {
      return depositToPool(poolId, amount, chainId)
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific pool data
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.POOL(variables.poolId.toString()),
      })

      // Invalidate user-specific data
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BALANCES() })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ROLES() })
    },
  })
}
