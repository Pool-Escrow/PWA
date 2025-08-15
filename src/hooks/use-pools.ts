'use client'

import type { PoolItem } from '@/types/pools'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from './use-user'

// Query keys
const POOLS_QUERY_KEYS = {
  all: ['pools'] as const,
  lists: () => [...POOLS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...POOLS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...POOLS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...POOLS_QUERY_KEYS.details(), id] as const,
  user: (address: string) => [...POOLS_QUERY_KEYS.all, 'user', address] as const,
  upcoming: () => [...POOLS_QUERY_KEYS.lists(), 'upcoming'] as const,
}

async function fetchUpcomingPools(): Promise<{ pools: PoolItem[], total: number }> {
  const response = await fetch('/api/pools/upcoming')
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming pools')
  }
  const result = await response.json() as { success: boolean, data: { pools: PoolItem[], total: number } }
  if (!result.success) {
    throw new Error('Failed to fetch upcoming pools')
  }
  // Return the data even if pools array is empty - this is not an error
  return result.data
}

async function fetchUserPools(address: string): Promise<{ pools: PoolItem[], total: number, address: string }> {
  const response = await fetch(`/api/pools/user/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user pools')
  }
  const result = await response.json() as { success: boolean, data: { pools: PoolItem[], total: number, address: string } }
  if (!result.success) {
    throw new Error('Failed to fetch user pools')
  }
  // Return the data even if pools array is empty - this is not an error
  return result.data
}

async function fetchPoolById(id: string): Promise<{ pool: PoolItem }> {
  const response = await fetch(`/api/pools/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch pool details')
  }
  return response.json() as Promise<{ pool: PoolItem }>
}

export function useUpcomingPools() {
  return useQuery({
    queryKey: POOLS_QUERY_KEYS.upcoming(),
    queryFn: fetchUpcomingPools,
    staleTime: 300000, // 5 minutes - upcoming pools don't change often
    refetchInterval: 600000, // 10 minutes
    gcTime: 1200000, // 20 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

export function useUserPools() {
  const { data: user } = useUser()
  const address = user?.address

  return useQuery({
    queryKey: POOLS_QUERY_KEYS.user(address ?? ''),
    queryFn: async () => fetchUserPools(address!),
    enabled: Boolean(address),
    staleTime: 180000, // 3 minutes - user pools don't change frequently
    refetchInterval: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

// Prefetch hook for optimistic loading
export function usePrefetchPool() {
  const queryClient = useQueryClient()

  return (id: string) => {
    void queryClient.prefetchQuery({
      queryKey: POOLS_QUERY_KEYS.detail(id),
      queryFn: async () => fetchPoolById(id),
      staleTime: 60000, // 1 minute
    })
  }
}
