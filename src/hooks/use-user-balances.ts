'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
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
  const address = user?.address ?? (process.env.NODE_ENV === 'development' ? '0x0000000000000000000000000000000000000001' : undefined)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_BALANCES(address),
    queryFn: async () => fetchBalances(address as App.Address),
    refetchInterval: process.env.NODE_ENV === 'development' ? false : 20000,
    staleTime: process.env.NODE_ENV === 'development' ? 0 : 10000,
    // Keep showing the previous data while the new address is fetching
    placeholderData: keepPreviousData,
    enabled: Boolean(address),
  })

  // Always return consistent structure
  return {
    usdc: data?.balances?.usdc ?? { balance: 0, symbol: 'USDC' },
    drop: data?.balances?.drop ?? { balance: 0, symbol: 'DROP' },
    isLoading: isLoading && Boolean(address),
  }
}
