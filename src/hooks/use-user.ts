'use client'

import { useWallets } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

export function useUser() {
  const { ready, wallets } = useWallets()
  const address = wallets[0]?.address as App.Address

  return useQuery({
    queryKey: ['user', address, ready],
    queryFn: (): App.User => ({
      address,
      ready,
    }),
    enabled: ready && !!address,
    staleTime: 0, // Always refetch when dependencies change
    gcTime: 0, // Immediately garbage collect when disabled
  })
}
