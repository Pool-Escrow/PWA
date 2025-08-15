'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { API_ROUTES, QUERY_KEYS } from '@/lib/constants'

async function fetchUserRoles(address: App.Address): Promise<App.UserRolesResponse> {
  const response = await fetch(`${API_ROUTES.USER_ROLES}/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user roles')
  }
  const data = (await response.json()) as App.UserRolesResponse
  return data
}

export function useUserRoles() {
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

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_ROLES(address),
    queryFn: async () => fetchUserRoles(address as App.Address),
    staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh for 1 hour
    enabled: Boolean(address) && authenticated,
  })

  // Return default roles when user is not authenticated
  if (address == null || !authenticated) {
    return {
      isAdmin: false,
      isHost: false,
      isSponsor: false,
      isLoading: false,
    }
  }

  // Return fetched roles or default roles while loading
  return {
    isAdmin: data?.roles?.isAdmin ?? false,
    isHost: data?.roles?.isHost ?? false,
    isSponsor: data?.roles?.isSponsor ?? false,
    isLoading,
  }
}
