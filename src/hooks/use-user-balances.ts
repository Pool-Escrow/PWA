'use client'

import { useQuery } from '@tanstack/react-query'
import { API_ROUTES, QUERY_KEYS } from '@/lib/constants'

async function fetchBalances(address: App.Address): Promise<App.BalancesResponse> {
  const response = await fetch(`${API_ROUTES.USER_BALANCES}/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch balances')
  }
  const data = (await response.json()) as App.BalancesResponse
  return data
}

export function useUserBalances(address?: App.Address) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_BALANCES(address),
    queryFn: async () => fetchBalances(address as App.Address),
    refetchInterval: process.env.NODE_ENV === 'development' ? false : 20000,
    staleTime: process.env.NODE_ENV === 'development' ? Infinity : 10000,
    enabled: Boolean(address),
  })
}
