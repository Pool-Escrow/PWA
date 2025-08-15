'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { QUERY_KEYS } from '@/lib/constants'
import { safeQueryData, UserRolesSchema } from '@/lib/schemas'
import { fetchUserRoles } from './use-pool-contract'

const defaultRoles: App.UserRolesResponse = {
  address: '0x0000000000000000000000000000000000000000' as App.Address,
  roles: {
    isAdmin: false,
    isHost: false,
    isSponsor: false,
  },
}

export function useUserRoles(chainId: number = 84532) {
  const { data: user } = useUser()
  const { authenticated } = useAuth()
  const queryClient = useQueryClient()
  const address = user?.address

  // Clear role queries when user logs out
  useEffect(() => {
    if (!authenticated) {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_ROLES(address) })
    }
  }, [authenticated, address, queryClient])

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.USER_ROLES(address),
    queryFn: async () => fetchUserRoles(address as App.Address, chainId),
    staleTime: 60 * 60 * 1000, // 1 hour - roles don't change often
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep roles in cache for a full day
    enabled: Boolean(address) && authenticated,
    retry: 1,
    retryDelay: 3000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchInterval: false, // Never auto-refetch roles
  })

  // Return default roles when user is not authenticated
  if (address == null || !authenticated) {
    return {
      isAdmin: false,
      isHost: false,
      isSponsor: false,
      isLoading: false,
      isError: false,
    }
  }

  // Handle error state gracefully - return default values instead of error
  if (isError || data === null || data === undefined) {
    return {
      isAdmin: defaultRoles.roles.isAdmin,
      isHost: defaultRoles.roles.isHost,
      isSponsor: defaultRoles.roles.isSponsor,
      isLoading: false, // Don't show loading state on error
      isError: false, // Don't expose error to UI
    }
  }

  // Use Zod schema to safely extract data
  const safeData = safeQueryData(data, UserRolesSchema, defaultRoles)

  return {
    isAdmin: safeData.roles.isAdmin,
    isHost: safeData.roles.isHost,
    isSponsor: safeData.roles.isSponsor,
    isLoading,
    isError: false, // Never expose errors to UI
  }
}
