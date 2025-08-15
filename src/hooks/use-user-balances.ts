'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { QUERY_KEYS } from '@/lib/constants'
import { BalancesResponseSchema, safeQueryData } from '@/lib/schemas'
import { fetchUserBalances } from './use-pool-contract'

const defaultBalances: App.BalancesResponse = {
  address: '0x0000000000000000000000000000000000000000' as App.Address,
  balances: {
    usdc: { balance: 0, symbol: 'USDC', rawBalance: '0' },
    drop: { balance: 0, symbol: 'DROP', rawBalance: '0' },
  },
}

export function useUserBalances(chainId: number = 84532) {
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

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.USER_BALANCES(address),
    queryFn: async () => fetchUserBalances(address as App.Address, chainId),
    refetchInterval: 120000, // 2 minutes - even less frequent
    staleTime: 90000, // 1.5 minutes - consider data fresh for longer
    gcTime: 600000, // 10 minutes - keep in cache much longer
    enabled: Boolean(address) && authenticated,
    retry: 1,
    retryDelay: 3000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Don't refetch on network reconnect
  })

  // Return zero balances when user is not authenticated
  if (address == null || !authenticated) {
    return {
      usdc: defaultBalances.balances.usdc,
      drop: defaultBalances.balances.drop,
      isLoading: false,
      isError: false,
    }
  }

  // Handle error state gracefully - return default values instead of error
  if (isError || data === null || data === undefined) {
    return {
      usdc: defaultBalances.balances.usdc,
      drop: defaultBalances.balances.drop,
      isLoading: false, // Don't show loading state on error
      isError: false, // Don't expose error to UI
    }
  }

  // Use Zod schema to safely extract data
  const safeData = safeQueryData(data, BalancesResponseSchema, defaultBalances)

  return {
    usdc: safeData.balances.usdc,
    drop: safeData.balances.drop,
    isLoading,
    isError: false, // Never expose errors to UI
  }
}
