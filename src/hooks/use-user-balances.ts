'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { API_ROUTES, QUERY_KEYS } from '@/lib/constants'

async function fetchBalances(address: App.Address): Promise<App.BalancesResponse> {
  const response = await fetch(`${API_ROUTES.USER_BALANCES}/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch balances')
  }
  const data = (await response.json()) as App.BalancesResponse
  return data
}

export function useUserBalances() {
  const { data: user } = useUser()
  const { authenticated } = useAuth()
  const queryClient = useQueryClient()
  const address = user?.address

  // Clear balance queries when user logs out
  useEffect(() => {
    if (!authenticated) {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_BALANCES(address) })
    }
  }, [authenticated, address, queryClient])

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_BALANCES(address),
    queryFn: async () => fetchBalances(address as App.Address),
    refetchInterval: 20000, // 20 seconds
    staleTime: 0, // Always refetch when address changes
    // Don't keep previous data when user logs out
    placeholderData: undefined,
    enabled: Boolean(address) && authenticated, // Only fetch when user is authenticated
    // Clear cache when user changes
    gcTime: 0, // Immediately garbage collect when query is disabled
  })

  // Return zero balances when user is not authenticated
  if (address == null || !authenticated) {
    return {
      usdc: { balance: 0, symbol: 'USDC', rawBalance: '0' },
      drop: { balance: 0, symbol: 'DROP', rawBalance: '0' },
      isLoading: false,
    }
  }

  // Return fetched balances or zero balances while loading
  return {
    usdc: data?.balances?.usdc ?? { balance: 0, symbol: 'USDC', rawBalance: '0' },
    drop: data?.balances?.drop ?? { balance: 0, symbol: 'DROP', rawBalance: '0' },
    isLoading,
  }
}
